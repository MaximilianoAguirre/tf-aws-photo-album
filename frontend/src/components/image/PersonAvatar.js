import React from 'react'
import { Avatar } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

import { usePersonPhotos, usePhoto } from 'api/dynamo'
import { useScaledPhotoURL } from 'api/s3'

export const PersonAvatar = ({ person_id, size = 64 }) => {
  const { data, isLoading, isError } = usePersonPhotos(person_id, 1)
  const { data: photoUrl } = useScaledPhotoURL(data?.[0].PK.S.replace('#S3#', ''), 768, { enabled: !isLoading })
  const { data: photo, isLoading: isLoadingPhoto } = usePhoto(data?.[0].PK.S, { enabled: !isLoading })

  if (isLoading || isError || isLoadingPhoto) return <Avatar shape='square' size={size} icon={<LoadingOutlined />} />

  const face = data[0]
  const bounding_box = JSON.parse(face.bounding_box.S)

  const photo_ratio = parseInt(photo.width.N) / parseInt(photo.height.N)
  const h = size / bounding_box.Height
  const w = (size / bounding_box.Height) * photo_ratio
  const x = -bounding_box.Left * w
  const y = -bounding_box.Top * h - 16

  return (
    <Avatar
      src={
        <svg width={size} height={size} xmlns='http://www.w3.org/2000/svg'>
          <image href={photoUrl} width={w} height={h} x={x} y={y} />
        </svg>
      }
      shape='square'
      size={size}
    />
  )
}
