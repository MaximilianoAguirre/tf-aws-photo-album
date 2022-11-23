import { useQueries, useQuery } from 'react-query'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'

import { config } from 'config/config'
import { getSignedClient } from 'util/aws'

export function useOriginalPhotoURL(key, options = {}) {
  return useQuery(
    ['photo-url', key],
    async () => {
      const command = new GetObjectCommand({
        Bucket: config.PHOTO_BUCKET,
        Key: key
      })

      const client = await getSignedClient(S3Client)
      const response = await getSignedUrl(client, command, { expiresIn: 3600 })
      return response
    },
    {
      ...options,
      staleTime: 3600 * 1000
    }
  )
}

export function useScaledPhotoURL(key, size, options = {}) {
  return useQuery(
    ['scaled-photo-url', key, size],
    async () => {
      const command = new GetObjectCommand({
        Bucket: config.PHOTO_ASSETS_BUCKET,
        Key: `${size}/${key}`
      })

      const client = await getSignedClient(S3Client)
      const response = await getSignedUrl(client, command, { expiresIn: 3600 })
      return response
    },
    {
      ...options,
      staleTime: 3600 * 1000
    }
  )
}

export function useScaledPhotoURLs(key, sizes, options = {}) {
  const queries = sizes.map((size) => {
    return {
      queryKey: ['scaled-photo-url', key, size],
      queryFn: async () => {
        const command = new GetObjectCommand({
          Bucket: config.PHOTO_ASSETS_BUCKET,
          Key: `${size}/${key}`
        })

        const client = await getSignedClient(S3Client)
        const response = await getSignedUrl(client, command, { expiresIn: 3600 })
        return response
      },
      staleTime: 3600 * 1000,
      ...options
    }
  })

  return useQueries(queries)
}
