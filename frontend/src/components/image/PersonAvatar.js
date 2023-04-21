import React, { useMemo } from 'react'
import { Avatar } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

import { usePersonPhotos, usePhoto } from 'api/dynamo'
import { usePhotoComplete } from 'api/s3'

export const PersonAvatar = ({ person_id, size = 64, style, onClick }) => {
  const { data, isLoading, isError } = usePersonPhotos(person_id, 1)
  const photos = usePhotoComplete(data?.[0].PK.S.replace('#S3#', ''), 1280, { enabled: !isLoading })
  const { data: photo, isLoading: isLoadingPhoto } = usePhoto(data?.[0].PK.S, { enabled: !isLoading })

  // Filter photos loaded and choose the bigger one
  const loaded_photos = photos.filter((photo) => photo.status === 'success')
  const best_loaded_picture = loaded_photos.reduce((prev, curr) => {
    if (prev?.data.width > curr.data.width) return prev
    return curr
  }, null)
  const loading = best_loaded_picture === null

  const coord = useMemo(() => {
    if (isLoading || isError || isLoadingPhoto) return

    const face = data[0]
    const bounding_box = JSON.parse(face.bounding_box.S)

    const photo_ratio = parseInt(photo.width?.N) / parseInt(photo.height?.N)
    const h = size / bounding_box.Height
    const w = (size / bounding_box.Height) * photo_ratio

    return {
      h,
      w,
      x: -bounding_box.Left * w,
      y: -bounding_box.Top * h - 16
    }
  }, [data, photo, isLoading, isError, isLoadingPhoto])

  if (isLoading || isError || isLoadingPhoto || loading) return <Avatar shape='square' size={size} icon={<LoadingOutlined />} />

  return (
    <Avatar
      src={
        <svg width={size} height={size} xmlns='http://www.w3.org/2000/svg'>
          <image href={best_loaded_picture?.data.photo} width={coord.w} height={coord.h} x={coord.x} y={coord.y} />
        </svg>
      }
      style={style}
      onClick={() => onClick && onClick()}
      shape='square'
      size={size}
    />
  )
}
