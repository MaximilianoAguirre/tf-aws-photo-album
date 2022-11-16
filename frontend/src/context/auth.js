import React, { createContext, useContext, useEffect, useReducer } from "react"
import { Auth, Hub, Amplify } from "aws-amplify"
import { useNavigate } from "react-router-dom"
import { message } from "antd"

import { cognitoConfig } from "config/cognito"

Amplify.configure(cognitoConfig)

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

const ACTIONS = {
    LOGIN: 'login',
    LOGIN_ERROR: 'login_error',
    LOGOUT: 'logout',
    CHALLENGE: 'challenge',
    START_LOGIN: 'start_login',
    START_LOGOUT: 'start_logout',
    START_CHANGE_PWD: 'start_change_pwd',
    CHANGE_PWD_FINISH: 'change_pwd_finish'
}

export const CHALLENGES = {
    SET_PASSWORD: 'NEW_PASSWORD_REQUIRED',
    CUSTOM_CHALLENGE: 'CUSTOM_CHALLENGE',
    MFA_SETUP: 'MFA_SETUP',
    SMS_MFA: 'SMS_MFA',
    SOFTWARE_TOKEN_MFA: 'SOFTWARE_TOKEN_MFA'
}

var INITIAL_STATE = {
    isAuthenticated: false,
    isAuthenticating: false,
    isLoggingOut: false,
    user: null,
    userId: null,
    isChallenged: false,
    challengePayload: null,
    challenge: null,
    isChangingPassword: false
}

function reducer(state, action) {
    switch (action.type) {

        case ACTIONS.LOGIN:
            return {
                ...state,
                isAuthenticated: true,
                isAuthenticating: false,
                user: action.payload,
                userId: action.payload.attributes.email,
                isChallenged: false,
                challengePayload: null,
                challenge: null,
            }

        case ACTIONS.LOGOUT:
            return {
                ...state,
                isAuthenticated: false,
                isLoggingOut: false,
                user: null,
                userId: null,
                isChallenged: false,
                challengePayload: null,
                challenge: null,
            }

        case ACTIONS.CHALLENGE:
            return {
                ...state,
                isAuthenticating: false,
                isChallenged: true,
                challengePayload: action.payload,
                challenge: action.payload.challengeName,
            }

        case ACTIONS.START_LOGIN:
            return {
                ...state,
                isAuthenticating: true,
            }

        case ACTIONS.LOGIN_ERROR:
            return {
                ...state,
                isAuthenticating: false,
            }

        case ACTIONS.START_LOGOUT:
            return {
                ...state,
                isLoggingOut: true,
            }

        case ACTIONS.START_CHANGE_PWD:
            return {
                ...state,
                isChangingPassword: true
            }

        case ACTIONS.CHANGE_PWD_FINISH:
            return {
                ...state,
                isChangingPassword: false
            }

        default:
            return state
    }
}

export function AuthProvider({ children }) {
    const [state, dispatch] = useReducer(reducer, INITIAL_STATE)
    const navigate = useNavigate()

    const login = ({ username, password }) => {
        dispatch({ type: ACTIONS.START_LOGIN })

        Auth.signIn(username, password)
            .then(user => {
                if (user.challengeName) {
                    switch (user.challengeName) {
                        case CHALLENGES.SET_PASSWORD:
                            message.error("Password reset required")
                            dispatch({ type: ACTIONS.CHALLENGE, payload: user })
                            navigate('/login/set-password')
                            break

                        default:
                            break
                    }
                }
                else {
                    dispatch({ type: ACTIONS.LOGIN, payload: user })
                }
            })
            .catch(() => dispatch({ type: ACTIONS.LOGIN_ERROR }))
    }

    const setPassword = ({ newPassword }) => {
        dispatch({ type: ACTIONS.START_LOGIN })

        Auth.completeNewPassword(state.challengePayload, newPassword)
            .then(() => {
                Auth.currentAuthenticatedUser()
                    .then(user => {
                        if (user) dispatch({ type: ACTIONS.LOGIN, payload: user })
                    })
                    .catch(() => console.log('Not signed in'));
            })
            .catch(error => {
                message.error(error.message)
                dispatch({ type: ACTIONS.LOGOUT })
            })
    }

    const logout = () => {
        dispatch({ type: ACTIONS.START_LOGOUT })

        Auth.signOut()
            .then(() => dispatch({ type: ACTIONS.LOGOUT }))
    }

    const changePassword = ({ old_password, new_password, callback }) => {
        dispatch({ type: ACTIONS.START_CHANGE_PWD })
        Auth.changePassword(state.user, old_password, new_password)
            .then(() => {
                message.success("Password changed successfully!")
                callback && callback()
            })
            .catch(err => message.error(err.message))
            .finally(() => dispatch({ type: ACTIONS.CHANGE_PWD_FINISH }))
    }

    useEffect(() => {
        Hub.listen('auth', ({ payload: { event, data } }) => {
            switch (event) {
                case 'signIn':
                case 'cognitoHostedUI':
                    break

                case 'signOut':
                    break

                case 'tokenRefresh_failure':
                    dispatch({ type: ACTIONS.LOGOUT })
                    console.log('Token refresh failed')
                    break

                case 'signIn_failure':
                case 'cognitoHostedUI_failure':
                    message.error(data.message)
                    break

                case 'tokenRefresh':
                    console.log('Token refresh succeeded')
                    break

                default:
                    break
            }
        });

        Auth.currentAuthenticatedUser()
            .then(user => {
                if (user) dispatch({ type: ACTIONS.LOGIN, payload: user })
            })
            .catch(() => console.log('Not signed in'));

    }, []);

    return <AuthContext.Provider
        value={{
            ...state,
            login,
            logout,
            setPassword,
            changePassword
        }}
    >
        {children}
    </AuthContext.Provider>
}
