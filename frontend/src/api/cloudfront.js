import { useQuery, useQueries } from 'react-query'
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda'
import { Buffer } from 'buffer'

import { config } from 'config/config'
import { getSignedClient } from 'util/aws'

export function usePhotoURL({ key, resize, crop, options }) {
    return useQuery(
        ['photo-url', key, resize, crop],
        async () => {
            const url = new URL(`https://mockurl.com/images/${key}`)
            if (resize) url.searchParams.append('resize', resize)
            if (crop) url.searchParams.append('crop', crop)

            const command = new InvokeCommand({
                FunctionName: config.URL_SIGNER_LAMBDA,
                InvocationType: 'RequestResponse',
                Payload: JSON.stringify({
                    s3_object: `${url.pathname.slice(1)}${url.search}`
                })
            })

            const client = await getSignedClient(LambdaClient)
            const response = await client.send(command)
            return response
        },
        {
            ...options,
            staleTime: 3600 * 1000,
            select: (data) => Buffer.from(data.Payload).toString('utf8')
        }
    )
}

export function usePhotoURLs(photos, options = {}) {
    const queries = photos.map((photo) => {
        const { key, resize, crop, photo_options } = photo

        return {
            queryKey: ['photo-url', key, resize, crop],
            queryFn: async () => {
                const url = new URL(`https://mockurl.com/images/${key}`)
                if (resize) url.searchParams.append('resize', resize)
                if (crop) url.searchParams.append('crop', crop)

                const command = new InvokeCommand({
                    FunctionName: config.URL_SIGNER_LAMBDA,
                    InvocationType: 'RequestResponse',
                    Payload: JSON.stringify({
                        s3_object: `${url.pathname.slice(1)}${url.search}`
                    })
                })

                const client = await getSignedClient(LambdaClient)
                const response = await client.send(command)
                return response
            },
            ...options,
            ...photo_options,
            staleTime: 3600 * 1000,
            select: (data) => Buffer.from(data.Payload).toString('utf8')
        }
    })

    return useQueries(queries)
}

const widths = [100, 300, 768, 1280]

export function usePhotoComplete(id, width, options = {}) {
    const required_photos = widths.filter((w) => w <= width)
    required_photos.append(null)
    const urls = usePhotoURLs(required_photos.map(size => {
        return {
            key: id,
            resize: size && `${size}x`
        }
    }))

    const queries = urls.map((query) => {
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

    return useQueries(queries)
}
