import { useQueries, useQuery, useInfiniteQuery } from "react-query"
import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";

import { config } from "config/config"
import { getSignedClient } from "util/aws"

export function useAllPhotos(limit = null, options = {}) {
    return useQuery(
        ["all-photos", limit],
        async () => {
            const command = new QueryCommand({
                TableName: config.DYNAMO_TABLE,
                Limit: limit,
                ScanIndexForward: false,
                IndexName: "GSI2",
                KeyConditionExpression: "GSI2PK=:GSI2PK",
                ExpressionAttributeValues: {
                    ":GSI2PK": { "S": "#TIMESTAMP" }
                },
            })

            const client = await getSignedClient(DynamoDBClient)
            const response = await client.send(command)
            return response
        },
        {
            ...options,
            select: data => data.Items
        }
    )
}

export function useAllPhotosInfinite(limit = 20, options = {}) {
    return useInfiniteQuery(
        ["all-photos-infinite", limit],
        async ({ pageParam = null }) => {
            const command = new QueryCommand({
                TableName: config.DYNAMO_TABLE,
                Limit: limit,
                ScanIndexForward: false,
                IndexName: "GSI2",
                KeyConditionExpression: "GSI2PK=:GSI2PK",
                ExpressionAttributeValues: {
                    ":GSI2PK": { "S": "#TIMESTAMP" }
                },
                ExclusiveStartKey: pageParam
            })

            const client = await getSignedClient(DynamoDBClient)
            const response = await client.send(command)
            return response
        },
        {
            ...options,
            // select: data => data.Items,
            getNextPageParam: (lastPage, pages) => lastPage.LastEvaluatedKey
        }
    )
}

export function useLocatedPhotos(hash, { limit = null, options = {} } = {}) {
    return useQuery(
        ["located-photos", hash, limit],
        async () => {
            const command = new QueryCommand({
                TableName: config.DYNAMO_TABLE,
                Limit: limit,
                IndexName: "GSI1",
                KeyConditionExpression: "GSI1PK=:GSI1PK AND begins_with(GSI1SK, :hash)",
                ExpressionAttributeValues: {
                    ":GSI1PK": { "S": "#GEOHASH" },
                    ":hash": { "S": hash }
                },
            })

            const client = await getSignedClient(DynamoDBClient)
            const response = await client.send(command)
            return response
        },
        {
            select: data => data.Items,
            ...options
        }
    )
}

export function useLocatedPhotosInfinite(hash, { limit = 20, options = {} } = {}) {
    return useInfiniteQuery(
        ["located-photos-infinite", hash, limit],
        async ({ pageParam = null }) => {
            const command = new QueryCommand({
                TableName: config.DYNAMO_TABLE,
                Limit: limit,
                IndexName: "GSI1",
                KeyConditionExpression: "GSI1PK=:GSI1PK AND begins_with(GSI1SK, :hash)",
                ExpressionAttributeValues: {
                    ":GSI1PK": { "S": "#GEOHASH" },
                    ":hash": { "S": hash }
                },
                ExclusiveStartKey: pageParam
            })

            const client = await getSignedClient(DynamoDBClient)
            const response = await client.send(command)
            return response
        },
        {
            ...options,
            getNextPageParam: (lastPage, pages) => lastPage.LastEvaluatedKey
        }
    )
}

export function useLocatedPhotoslList(hashes, { limit = null, options = {} } = {}) {
    const queries = hashes.map(hash => {
        return {
            queryKey: ["located-photos", hash, limit],
            queryFn: async () => {
                const command = new QueryCommand({
                    TableName: config.DYNAMO_TABLE,
                    Limit: limit,
                    IndexName: "GSI1",
                    KeyConditionExpression: "GSI1PK=:GSI1PK AND begins_with(GSI1SK, :hash)",
                    ExpressionAttributeValues: {
                        ":GSI1PK": { "S": "#GEOHASH" },
                        ":hash": { "S": hash }
                    }
                })

                const client = await getSignedClient(DynamoDBClient)
                const response = await client.send(command)
                return response
            },
            select: data => data.Items,
            staleTime: 500 * 1000,
            ...options,
        }
    })

    return useQueries(queries)
}
