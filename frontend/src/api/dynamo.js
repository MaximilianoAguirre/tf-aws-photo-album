import { useQueries, useQuery, useInfiniteQuery } from 'react-query'
import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb'

import { config } from 'config/config'
import { getSignedClient } from 'util/aws'

export function useAllPhotos(limit = null, options = {}) {
  return useQuery(
    ['all-photos', limit],
    async () => {
      const command = new QueryCommand({
        TableName: config.DYNAMO_TABLE,
        Limit: limit,
        ScanIndexForward: false,
        IndexName: 'GSI2',
        KeyConditionExpression: 'GSI2PK=:GSI2PK',
        ExpressionAttributeValues: {
          ':GSI2PK': { S: '#TIMESTAMP' }
        }
      })

      const client = await getSignedClient(DynamoDBClient)
      const response = await client.send(command)
      return response
    },
    {
      ...options,
      select: (data) => data.Items
    }
  )
}

export function usePhoto(id, options = {}) {
  return useQuery(
    ['photos', id],
    async () => {
      const command = new QueryCommand({
        TableName: config.DYNAMO_TABLE,
        KeyConditionExpression: 'PK=:PK AND SK=:SK',
        ExpressionAttributeValues: {
          ':PK': { S: id },
          ':SK': { S: '#METADATA' }
        }
      })

      const client = await getSignedClient(DynamoDBClient)
      const response = await client.send(command)
      return response
    },
    {
      ...options,
      select: (data) => data.Items[0]
    }
  )
}

export function usePhotoPersons(id, limit = 20, options = {}) {
  return useQuery(
    ['photo-persons', id, limit],
    async () => {
      const command = new QueryCommand({
        TableName: config.DYNAMO_TABLE,
        Limit: limit,
        KeyConditionExpression: 'PK=:PK AND begins_with(SK, :SK)',
        ExpressionAttributeValues: {
          ':PK': { S: id },
          ':SK': { S: '#FACE' }
        }
      })

      const client = await getSignedClient(DynamoDBClient)
      const response = await client.send(command)
      return response
    },
    {
      ...options,
      select: (response) => response.Items
    }
  )
}

export function useAllPersons(limit = null, options = {}) {
  return useQuery(
    ['all-persons', limit],
    async () => {
      const command = new QueryCommand({
        TableName: config.DYNAMO_TABLE,
        Limit: limit,
        ScanIndexForward: false,
        IndexName: 'inverted',
        KeyConditionExpression: 'SK=:SK AND begins_with(PK, :PK)',
        ExpressionAttributeValues: {
          ':SK': { S: '#METADATA' },
          ':PK': { S: '#PERSON' }
        }
      })

      const client = await getSignedClient(DynamoDBClient)
      const response = await client.send(command)
      return response
    },
    {
      ...options,
      select: (data) => data.Items
    }
  )
}

export function useAllPersonsByAppearance(limit = null, options = {}) {
  return useQuery(
    ['all-persons-by-appearance', limit],
    async () => {
      const command = new QueryCommand({
        TableName: config.DYNAMO_TABLE,
        Limit: limit,
        ScanIndexForward: false,
        IndexName: 'GSI2',
        KeyConditionExpression: 'GSI2PK=:GSI2PK',
        ExpressionAttributeValues: {
          ':GSI2PK': { S: '#APPEARANCES' }
        }
      })

      const client = await getSignedClient(DynamoDBClient)
      const response = await client.send(command)
      return response
    },
    {
      ...options,
      select: (data) => data.Items
    }
  )
}

export function useAllPersonsInfinite(limit = 100, options = {}) {
  return useInfiniteQuery(
    ['all-persons-infinite', limit],
    async ({ pageParam = null }) => {
      const command = new QueryCommand({
        TableName: config.DYNAMO_TABLE,
        Limit: limit,
        ScanIndexForward: false,
        ExclusiveStartKey: pageParam,
        IndexName: 'inverted',
        KeyConditionExpression: 'SK=:SK AND begins_with(PK, :PK)',
        ExpressionAttributeValues: {
          ':SK': { S: '#METADATA' },
          ':PK': { S: '#PERSON' }
        }
      })

      const client = await getSignedClient(DynamoDBClient)
      const response = await client.send(command)
      return response
    },
    {
      ...options,
      getNextPageParam: (lastPage) => lastPage.LastEvaluatedKey
    }
  )
}

export function useAllPersonsByAppearanceInfinite(limit = null, options = {}) {
  return useInfiniteQuery(
    ['all-persons-by-appareance-infinite', limit],
    async ({ pageParam = null }) => {
      const command = new QueryCommand({
        TableName: config.DYNAMO_TABLE,
        Limit: limit,
        ScanIndexForward: false,
        ExclusiveStartKey: pageParam,
        IndexName: 'GSI2',
        KeyConditionExpression: 'GSI2PK=:GSI2PK',
        ExpressionAttributeValues: {
          ':GSI2PK': { S: '#APPEARANCES' }
        }
      })

      const client = await getSignedClient(DynamoDBClient)
      const response = await client.send(command)
      return response
    },
    {
      ...options,
      getNextPageParam: (lastPage) => lastPage.LastEvaluatedKey
    }
  )
}

export function usePersonPhotos(id, limit = 200, options = {}) {
  return useQuery(
    ['person-photos', id, limit],
    async () => {
      const command = new QueryCommand({
        TableName: config.DYNAMO_TABLE,
        Limit: limit,
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK=:GSI1PK',
        ExpressionAttributeValues: {
          ':GSI1PK': { S: id }
        }
      })

      const client = await getSignedClient(DynamoDBClient)
      const response = await client.send(command)
      return response
    },
    {
      ...options,
      select: (response) => response.Items
    }
  )
}

export function usePersonPhotosInfinite(id, limit = 200, options = {}) {
  return useInfiniteQuery(
    ['person-photos-infinite', id, limit],
    async ({ pageParam = null }) => {
      const command = new QueryCommand({
        TableName: config.DYNAMO_TABLE,
        Limit: limit,
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK=:GSI1PK',
        ExpressionAttributeValues: {
          ':GSI1PK': { S: id }
        },
        ExclusiveStartKey: pageParam
      })

      const client = await getSignedClient(DynamoDBClient)
      const response = await client.send(command)
      return response
    },
    {
      ...options,
      getNextPageParam: (lastPage) => lastPage.LastEvaluatedKey
    }
  )
}

export function useAllPhotosInfinite(limit = 200, options = {}) {
  return useInfiniteQuery(
    ['all-photos-infinite', limit],
    async ({ pageParam = null }) => {
      const command = new QueryCommand({
        TableName: config.DYNAMO_TABLE,
        Limit: limit,
        ScanIndexForward: false,
        IndexName: 'GSI2',
        KeyConditionExpression: 'GSI2PK=:GSI2PK',
        ExpressionAttributeValues: {
          ':GSI2PK': { S: '#TIMESTAMP' }
        },
        ExclusiveStartKey: pageParam
      })

      const client = await getSignedClient(DynamoDBClient)
      const response = await client.send(command)
      return response
    },
    {
      ...options,
      getNextPageParam: (lastPage) => lastPage.LastEvaluatedKey
    }
  )
}

export function useLocatedPhotos(hash, { limit = null, options = {} } = {}) {
  return useQuery(
    ['located-photos', hash, limit],
    async () => {
      const command = new QueryCommand({
        TableName: config.DYNAMO_TABLE,
        Limit: limit,
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK=:GSI1PK AND begins_with(GSI1SK, :hash)',
        ExpressionAttributeValues: {
          ':GSI1PK': { S: '#GEOHASH' },
          ':hash': { S: hash }
        }
      })

      const client = await getSignedClient(DynamoDBClient)
      const response = await client.send(command)
      return response
    },
    {
      select: (data) => data.Items,
      ...options
    }
  )
}

export function useLocatedPhotosInfinite(hash, { limit = 200, options = {} } = {}) {
  return useInfiniteQuery(
    ['located-photos-infinite', hash, limit],
    async ({ pageParam = null }) => {
      const command = new QueryCommand({
        TableName: config.DYNAMO_TABLE,
        Limit: limit,
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK=:GSI1PK AND begins_with(GSI1SK, :hash)',
        ExpressionAttributeValues: {
          ':GSI1PK': { S: '#GEOHASH' },
          ':hash': { S: hash }
        },
        ExclusiveStartKey: pageParam
      })

      const client = await getSignedClient(DynamoDBClient)
      const response = await client.send(command)
      return response
    },
    {
      ...options,
      getNextPageParam: (lastPage) => lastPage.LastEvaluatedKey
    }
  )
}

export function useLocatedPhotoslList(hashes, { limit = null, options = {} } = {}) {
  const queries = hashes.map((hash) => {
    return {
      queryKey: ['located-photos', hash, limit],
      queryFn: async () => {
        const command = new QueryCommand({
          TableName: config.DYNAMO_TABLE,
          Limit: limit,
          IndexName: 'GSI1',
          KeyConditionExpression: 'GSI1PK=:GSI1PK AND begins_with(GSI1SK, :hash)',
          ExpressionAttributeValues: {
            ':GSI1PK': { S: '#GEOHASH' },
            ':hash': { S: hash }
          }
        })

        const client = await getSignedClient(DynamoDBClient)
        const response = await client.send(command)
        return response
      },
      select: (data) => data.Items,
      staleTime: 500 * 1000,
      ...options
    }
  })

  return useQueries(queries)
}
