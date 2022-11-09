import { useQueries, useQuery } from "react-query"
import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";

import { config } from "config/config"

const dynamoClient = new DynamoDBClient({
    region: config.AWS_REGION,
    credentials: {
        accessKeyId: config.AWS_ACCESS_KEY_ID,
        secretAccessKey: config.AWS_SECRET_ACCESS_KEY
    }
});

export function useAllPhotos(options = {}) {
    const command = new QueryCommand({
        TableName: config.DYNAMO_TABLE,
        IndexName: "inverted",
        KeyConditionExpression: "range_key = :image",
        ExpressionAttributeValues: {
            ":image": { "S": "image" }
        }
    })

    return useQuery(
        ["all-photos"],
        () => dynamoClient.send(command),
        {
            ...options,
            select: data => data.Items
        }
    )
}

export function useLocatedPhotos(hash, options = {}) {
    const command = new QueryCommand({
        TableName: config.DYNAMO_TABLE,
        IndexName: "geohash",
        KeyConditionExpression: "range_key = :image AND begins_with(geohash, :hash)",
        ExpressionAttributeValues: {
            ":image": { "S": "image" },
            ":hash": { "S": hash }
        }
    })

    return useQuery(
        ["located-photos", hash],
        () => dynamoClient.send(command),
        {
            select: data => data.Items,
            ...options
        }
    )
}

export function useLocatedPhotoslList(hashes, options = {}) {
    const queries = hashes.map(hash => {
        const command = new QueryCommand({
            TableName: config.DYNAMO_TABLE,
            IndexName: "geohash",
            KeyConditionExpression: "range_key = :image AND begins_with(geohash, :hash)",
            ExpressionAttributeValues: {
                ":image": { "S": "image" },
                ":hash": { "S": hash }
            }
        })

        return {
            queryKey: ["located-photos", hash],
            queryFn: () => dynamoClient.send(command),
            select: data => data.Items,
            staleTime: 500 * 1000,
            ...options,
        }
    })

    return useQueries(queries)
}
