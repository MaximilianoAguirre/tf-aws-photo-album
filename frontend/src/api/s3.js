import { useQueries, useQuery } from 'react-query'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import axios from 'axios'
import { Buffer } from 'buffer'

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
      ...options,
      select: (data) => {
        return {
          url: parse_url(data),
          width: size
        }
      }
    }
  })

  return useQueries(queries)
}

const parse_url = (url) => {
  const parsed_url = new URL(url)
  return parsed_url
}

const widths = [100, 300, 768, 1280]

export function usePhotoComplete(id, width, options = {}) {
  const original_url = useOriginalPhotoURL(id, { select: (response) => parse_url(response) })
  const scaled_urls = useScaledPhotoURLs(
    id,
    widths.filter((w) => w <= width)
  )

  const scaled_urls_queries = scaled_urls.map((query) => {
    return {
      queryKey: ['photo', `${query.data?.url.origin}${query.data?.url.pathname}`],
      queryFn: async () => {
        const response = await axios.get(query.data?.url.href, { responseType: 'arraybuffer' })
        const buffer = Buffer.from(response.data, 'binary').toString('base64')
        return {
          photo: `data:${response.headers['content-type']};base64, ${buffer}`,
          width: query.data?.width
        }
      },
      enabled: !query.isLoading,
      ...options,
      staleTime: 36000 * 1000
    }
  })

  return useQueries([
    {
      queryKey: ['photo', `${original_url.data?.origin}${original_url.data?.pathname}`],
      queryFn: async () => {
        const response = await axios.get(original_url.data?.href, { responseType: 'arraybuffer' })
        const buffer = Buffer.from(response.data, 'binary').toString('base64')
        return `data:${response.headers['content-type']};base64, ${buffer}`
      },
      enabled: !original_url.isLoading && width > 1280,
      ...options,
      staleTime: 36000 * 1000
    },
    ...scaled_urls_queries
  ])
}
