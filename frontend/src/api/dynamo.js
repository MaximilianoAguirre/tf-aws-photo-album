import { useQueries, useQuery, useInfiniteQuery } from "react-query"
import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";

import { config } from "config/config"

const dynamoClient = new DynamoDBClient({
    region: config.AWS_REGION,
    credentials: {
        accessKeyId: config.AWS_ACCESS_KEY_ID,
        secretAccessKey: config.AWS_SECRET_ACCESS_KEY
    }
});

export function useAllPhotos(limit = null, options = {}) {
    const command = new QueryCommand({
        TableName: config.DYNAMO_TABLE,
        Limit: limit,
        ScanIndexForward: false,
        IndexName: "timestamp",
        KeyConditionExpression: "range_key = :image",
        ExpressionAttributeValues: {
            ":image": { "S": "image" }
        },
    })

    return useQuery(
        ["all-photos", limit],
        () => dynamoClient.send(command),
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
                IndexName: "timestamp",
                KeyConditionExpression: "range_key = :image",
                ExpressionAttributeValues: {
                    ":image": { "S": "image" }
                },
                ExclusiveStartKey: pageParam
            })


            // console.log(command)
            const response = await dynamoClient.send(command)
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
    const command = new QueryCommand({
        TableName: config.DYNAMO_TABLE,
        Limit: limit,
        IndexName: "geohash",
        KeyConditionExpression: "range_key = :image AND begins_with(geohash, :hash)",
        ExpressionAttributeValues: {
            ":image": { "S": "image" },
            ":hash": { "S": hash }
        },
    })

    return useQuery(
        ["located-photos", hash, limit],
        () => dynamoClient.send(command),
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
                IndexName: "geohash",
                KeyConditionExpression: "range_key = :image AND begins_with(geohash, :hash)",
                ExpressionAttributeValues: {
                    ":image": { "S": "image" },
                    ":hash": { "S": hash }
                },
                ExclusiveStartKey: pageParam
            })


            // console.log(command)
            const response = await dynamoClient.send(command)
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
        const command = new QueryCommand({
            TableName: config.DYNAMO_TABLE,
            Limit: limit,
            IndexName: "geohash",
            KeyConditionExpression: "range_key = :image AND begins_with(geohash, :hash)",
            ExpressionAttributeValues: {
                ":image": { "S": "image" },
                ":hash": { "S": hash }
            }
        })

        return {
            queryKey: ["located-photos", hash, limit],
            queryFn: () => dynamoClient.send(command),
            select: data => data.Items,
            staleTime: 500 * 1000,
            ...options,
        }
    })

    return useQueries(queries)
}
