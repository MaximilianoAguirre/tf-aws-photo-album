import React from "react"
import { Image } from 'antd'
import { Blurhash } from "react-blurhash"

import { useScaledPhotoURL, useOriginalPhotoURL } from "api/s3"
import { fallback_image } from "util/fallback_image"

export const CustomImage = ({ photo, width, style }) => {
    const { data: photoUrl } = useScaledPhotoURL(photo.hash_key.S, width, { enabled: photo.resized?.BOOL })
    const { data: OriginalPhotoUrl } = useOriginalPhotoURL(photo.hash_key.S, width, { enabled: !photo.resized?.BOOL })

    const src = photo.resized?.BOOL ? photoUrl : OriginalPhotoUrl
    const height = (width / photo.width?.N) * photo.height?.N

    return <Image
        width={width}
        height={height}
        src={src}
        preview={false}
        style={style}
        fallback={fallback_image}
        placeholder={"blurhash" in photo &&
            <Blurhash
                hash={photo.blurhash.S}
                width={width}
                height={height}
            />
        }
    />
}
