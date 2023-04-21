import React, { useMemo } from 'react'
import { Image } from 'antd'
import { Blurhash } from 'react-blurhash'

import { usePhotoComplete } from 'api/s3'
import { usePhoto } from 'api/dynamo'
import { fallback_image } from 'util/fallback_image'

const max_height = (width) => {
  return 0.7 * width
}

export const CustomImage = ({ photo, width, style, rootClassName, onClick }) => {
  const { data: photoInfo, isLoading: isLoadingPhotoInfo } = usePhoto(photo.PK.S, { enabled: !photo.name?.S })
  const photos = usePhotoComplete(photo.name?.S || photoInfo?.name.S, width, { enabled: !!photo.name?.S || !isLoadingPhotoInfo })

  // Filter photos loaded and choose the bigger one
  const loaded_photos = photos.filter((photo) => photo.status === 'success')
  const best_loaded_picture = loaded_photos.reduce((prev, curr) => {
    if (prev?.data.width > curr.data.width) return prev
    return curr
  }, null)
  const loading = best_loaded_picture === null

  const original_width = photo?.width?.N || photoInfo?.width.N
  const original_height = photo?.height?.N || photoInfo?.height.N

  // Calculate size to use
  const { height, final_width } = useMemo(() => {
    let height, final_width

    if (original_height > max_height(original_width)) {
      height = max_height(width)
      final_width = (height / original_height) * original_width
    } else {
      height = (width / original_width) * original_height
      final_width = width
    }

    return { height, final_width }
  }, [original_width, original_height, width])

  return (
    <>
      <div onClick={() => onClick && onClick(photo)}>
        {loading ? (
          photo.blurhash ? (
            <Blurhash hash={photo.blurhash?.S} width={final_width} height={height} />
          ) : null
        ) : (
          <Image
            width={final_width}
            height={height}
            src={best_loaded_picture?.data.photo}
            preview={false}
            rootClassName={rootClassName}
            style={{
              ...style,
              cursor: onClick ? 'pointer' : 'default'
            }}
            fallback={fallback_image}
          />
        )}
      </div>
    </>
  )
}
