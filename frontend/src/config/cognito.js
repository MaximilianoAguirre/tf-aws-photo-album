import { config } from "config/config"

export const cognitoConfig = {
    Auth: {
        region: config.AWS_REGION,
        userPoolId: config.COGNITO_USER_POOL,
        userPoolWebClientId: config.COGNITO_USER_POOL_WEB_CLIENT,
        identityPoolId: config.COGNITO_IDENTITY_POOL,
    }
}
