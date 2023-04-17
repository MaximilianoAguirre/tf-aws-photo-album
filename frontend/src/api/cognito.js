import { useInfiniteQuery, useQuery, useMutation } from 'react-query'
import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  AdminListGroupsForUserCommand,
  AdminDeleteUserCommand,
  AdminCreateUserCommand,
  AdminRemoveUserFromGroupCommand,
  AdminAddUserToGroupCommand,
  AdminEnableUserCommand,
  AdminDisableUserCommand
} from '@aws-sdk/client-cognito-identity-provider'

import { config } from 'config/config'
import { getSignedClient } from 'util/aws'

export function useAllUsersInfinite(limit = 60, options = {}) {
  return useInfiniteQuery(
    ['all-users-infinite', limit],
    async ({ pageParam = null }) => {
      const command = new ListUsersCommand({
        UserPoolId: config.COGNITO_USER_POOL,
        Limit: limit,
        PaginationToken: pageParam
      })

      const client = await getSignedClient(CognitoIdentityProviderClient)
      const response = await client.send(command)
      return response
    },
    {
      ...options,
      getNextPageParam: (lastPage) => lastPage.PaginationToken
    }
  )
}

export function useAllUserGroups(user, limit = 3, options = {}) {
  return useQuery(
    ['user-groups', user, limit],
    async () => {
      const command = new AdminListGroupsForUserCommand({
        Username: user,
        UserPoolId: config.COGNITO_USER_POOL,
        Limit: limit
      })

      const client = await getSignedClient(CognitoIdentityProviderClient)
      const response = await client.send(command)
      return response
    },
    {
      ...options,
      select: (data) => data.Groups
    }
  )
}

export function useDeleteUser(options = {}) {
  return useMutation(async (data) => {
    const command = new AdminDeleteUserCommand({
      UserPoolId: config.COGNITO_USER_POOL,
      Username: data
    })

    const client = await getSignedClient(CognitoIdentityProviderClient)
    const response = await client.send(command)
    return response
  }, options)
}

export function useCreateUser(options = {}) {
  return useMutation(async ({ email }) => {
    const command = new AdminCreateUserCommand({
      UserPoolId: config.COGNITO_USER_POOL,
      Username: email,
      UserAttributes: [
        {
          Name: 'email',
          Value: email
        },
        {
          Name: 'email_verified',
          Value: 'true'
        }
      ],
      DesiredDeliveryMediums: ['EMAIL']
    })

    const client = await getSignedClient(CognitoIdentityProviderClient)
    const response = await client.send(command)
    return response
  }, options)
}

export function useEnableUser(options = {}) {
  return useMutation(async (username) => {
    const command = new AdminEnableUserCommand({
      UserPoolId: config.COGNITO_USER_POOL,
      Username: username
    })

    const client = await getSignedClient(CognitoIdentityProviderClient)
    const response = await client.send(command)
    return response
  }, options)
}

export function useDisableUser(options = {}) {
  return useMutation(async (username) => {
    const command = new AdminDisableUserCommand({
      UserPoolId: config.COGNITO_USER_POOL,
      Username: username
    })

    const client = await getSignedClient(CognitoIdentityProviderClient)
    const response = await client.send(command)
    return response
  }, options)
}

export function useChangeUserRole(options = {}) {
  return useMutation(async ({ user_id, old_group, new_group }) => {
    const client = await getSignedClient(CognitoIdentityProviderClient)

    if (old_group !== 'none') {
      const removeCommand = new AdminRemoveUserFromGroupCommand({
        UserPoolId: config.COGNITO_USER_POOL,
        Username: user_id,
        GroupName: old_group
      })
      await client.send(removeCommand)
    }

    if (new_group !== 'none') {
      const addCommand = new AdminAddUserToGroupCommand({
        UserPoolId: config.COGNITO_USER_POOL,
        Username: user_id,
        GroupName: new_group
      })
      await client.send(addCommand)
    }
  }, options)
}
