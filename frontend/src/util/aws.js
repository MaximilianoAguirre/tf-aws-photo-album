import { Auth } from 'aws-amplify'

import { config } from 'config/config'

export async function getSignedClient(client, options = {}) {
  try {
    const credentials = await Auth.currentCredentials()

    const cl = new client({
      region: config.AWS_REGION,
      credentials: Auth.essentialCredentials(credentials),
      ...options
    })

    return cl
  } catch (err) {
    console.log(err)
  }
}
