import { useQuery } from "react-query"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

import { config } from "config/config"

const s3Client = new S3Client({
    region: config.AWS_REGION,
    credentials: {
        accessKeyId: config.AWS_ACCESS_KEY_ID,
        secretAccessKey: config.AWS_SECRET_ACCESS_KEY
    }
});

export function useOriginalPhotoURL(key, options = {}) {
    const command = new GetObjectCommand({
        Bucket: config.PHOTO_BUCKET,
        Key: key
    })

    return useQuery(
        ["photo-url", key],
        () => getSignedUrl(s3Client, command, { expiresIn: 3600 }),
        {
            ...options,
            staleTime: 3600 * 1000
        }
    )
}

export function useScaledPhotoURL(key, size, options = {}) {
    const command = new GetObjectCommand({
        Bucket: config.PHOTO_ASSETS_BUCKET,
        Key: `${size}/${key}`
    })

    return useQuery(
        ["scaled-photo-url", key, size],
        () => getSignedUrl(s3Client, command, { expiresIn: 3600 }),
        {
            ...options,
            staleTime: 3600 * 1000
        }
    )
}
