import React, { createContext, useContext, useState, useEffect } from "react"
import Amplify, { Auth, Hub } from "aws-amplify"
import { useNavigate } from "react-router-dom"
import { message } from "antd"

import { cognitoConfig } from "config/cognito"

Amplify.configure(cognitoConfig)

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const navigate = useNavigate()
    const [user, setUser] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // isAuthenticated
    const isAuthenticated = !!user;

    const login = ({ username, password }) => {
        setIsAuthenticating(true)

        Auth.signIn(username, password)
            .then(user => {
                if (user.challengeName) {
                    switch (user.challengeName) {
                        case "NEW_PASSWORD_REQUIRED":
                            message.error("Password reset required")
                            setIsAuthenticating(false)
                            setUser(user)
                            navigate('/login/new-password')
                            break

                        default:
                            break
                    }
                }
            })
    }

    const setPassword = ({ newPassword }) => {
        setIsAuthenticating(true)

        Auth.completeNewPassword(user, newPassword)
            .then(user => {
                setIsAuthenticating(false)
                getUser().then(userData => {
                    setUser(userData)
                    setUserId(getUserId(userData))
                })
            })
            .catch(error => {
                console.log(error)
                message.error(error.message)
                setIsAuthenticating(false)
            })
    }

    const logout = () => {
        setIsLoggingOut(true);
        Auth.signOut();
    }

    const getUserId = (user) => {
        let userId = user?.attributes?.email
        return userId?.split("@")[0];
    }

    useEffect(() => {
        Hub.listen('auth', ({ payload: { event, data } }) => {
            switch (event) {
                case 'signIn':
                case 'cognitoHostedUI':
                    setIsAuthenticating(false)
                    console.log("Logged in")
                    getUser().then(userData => {
                        setUser(userData)
                        setUserId(getUserId(userData))
                    })
                    break

                case 'signOut':
                    setIsAuthenticating(false)
                    setUser(null)
                    setUserId(null)
                    setIsLoggingOut(false)
                    break

                case 'tokenRefresh_failure':
                    setIsAuthenticating(false)
                    setUser(null)
                    setUserId(null)
                    setIsLoggingOut(false)
                    console.log('Token refresh failed')
                    break

                case 'signIn_failure':
                case 'cognitoHostedUI_failure':
                    setIsAuthenticating(false)
                    message.error(data.message)
                    break

                case 'tokenRefresh':
                    console.log('Token refresh succeeded')
                    break

                default:
                    break
            }
        });

        getUser().then(userData => {
            if (userData) {
                setUser(userData)
                setUserId(getUserId(userData))
            }
        });
    }, []);

    function getUser() {
        return Auth.currentAuthenticatedUser()
            .then(userData => userData)
            .catch(() => console.log('Not signed in'));
    }

    return <AuthContext.Provider
        value={{
            isAuthenticated,
            isAuthenticating,
            isLoggingOut,
            user,
            userId,
            login,
            logout,
            setPassword
        }}
    >
        {children}
    </AuthContext.Provider>
}
