import React, { useMemo } from 'react'
import { Avatar } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

import { usePersonPhotos, usePhoto } from 'api/dynamo'
import { useScaledPhotoURL } from 'api/s3'

export const PersonAvatar = ({ person_id, size = 64, style, onClick }) => {
  const { data, isLoading, isError } = usePersonPhotos(person_id, 1)
  const { data: photoUrl } = useScaledPhotoURL(data?.[0].PK.S.replace('#S3#', ''), 768, { enabled: !isLoading })
  const { data: photo, isLoading: isLoadingPhoto } = usePhoto(data?.[0].PK.S, { enabled: !isLoading })

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

  if (isLoading || isError || isLoadingPhoto) return <Avatar shape='square' size={size} icon={<LoadingOutlined />} />

  return (
    <Avatar
      src={
        <svg width={size} height={size} xmlns='http://www.w3.org/2000/svg'>
          <image href={photoUrl} width={coord.w} height={coord.h} x={coord.x} y={coord.y} />
        </svg>
      }
      style={style}
      onClick={() => onClick && onClick()}
      shape='square'
      size={size}
    />
  )
}
