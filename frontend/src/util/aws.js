import { Auth } from "aws-amplify"

import { config } from "config/config"

export async function getSignedClient(client) {
    try {
        const credentials = await Auth.currentCredentials()

        const cl = new client({
            region: config.AWS_REGION,
            credentials: Auth.essentialCredentials(credentials)
        })

        return cl
    }
    catch (err) {
        console.log(err)
    }
}
