import { useInfiniteQuery, useQuery } from "react-query"
import { CognitoIdentityProviderClient, ListUsersCommand, AdminListGroupsForUserCommand } from "@aws-sdk/client-cognito-identity-provider"

import { config } from "config/config"
import { getSignedClient } from "util/aws"

export function useAllUsersInfinite(limit = 60, options = {}) {
    return useInfiniteQuery(
        ["all-users-infinite", limit],
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
            getNextPageParam: (lastPage, pages) => lastPage.PaginationToken
        }
    )
}

export function useAllUserGroups(user, limit = 3, options = {}) {
    return useQuery(
        ["user-groups", user, limit],
        async () => {
            const command = new AdminListGroupsForUserCommand({
                Username: user,
                UserPoolId: config.COGNITO_USER_POOL,
                Limit: limit,
            })

            const client = await getSignedClient(CognitoIdentityProviderClient)
            const response = await client.send(command)
            return response
        },
        {
            ...options,
            select: data => data.Groups
        }
    )
}
