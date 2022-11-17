import React, { useRef } from "react"
import { Image } from 'antd'
import { Blurhash } from "react-blurhash"

import { useScaledPhotoURL, useOriginalPhotoURL } from "api/s3"
import { fallback_image } from "util/fallback_image"
import { ImagePreview } from "components"

const max_height = (width) => {
    return 1.5 * width
}

export const CustomImage = ({ photo, width, style }) => {
    const preview = useRef()
    const { data: photoUrl } = useScaledPhotoURL(photo.name.S, width)
    const { data: OriginalPhotoUrl } = useOriginalPhotoURL(photo.name.S, width)

    const src = photo.resized?.BOOL ? photoUrl : OriginalPhotoUrl
    let height, final_width

    if (photo.height?.N > max_height(photo.width?.N)) {
        height = max_height(width)
        final_width = (height / photo.height?.N) * photo.width?.N
    }
    else {
        height = (width / photo.width?.N) * photo.height?.N
        final_width = width
    }

    return <>
        <div
            onClick={() => preview.current.open()}
        >
            <Image
                width={final_width}
                height={height}
                src={src}
                preview={false}
                style={{
                    ...style,
                    cursor: "pointer"
                }}
                fallback={fallback_image}
                placeholder={"blurhash" in photo &&
                    <Blurhash
                        hash={photo.blurhash.S}
                        width={final_width}
                        height={height}
                    />
                }
            />
        </div>
        <ImagePreview ref={preview} photo={photo} />
    </>
}
