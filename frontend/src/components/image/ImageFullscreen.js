import React, { useMemo } from 'react'
import { Image } from 'antd'
import { Blurhash } from 'react-blurhash'
import { useNavigate } from 'react-router-dom'

import { usePhotoComplete } from 'api/s3'
import { usePhotoPersons, usePhoto } from 'api/dynamo'
import { fallback_image } from 'util/fallback_image'
import { useWindowSize } from 'util/windows_size'
import { Frame } from 'components'

export const FullScreenPhoto = ({ photo, onClick, frames = true }) => {
  const navigate = useNavigate()
  const [window_width, window_height] = useWindowSize()
  const { data: photoInfo, isLoading: isLoadingPhotoInfo } = usePhoto(photo.PK.S, { enabled: !photo.name?.S })
  const photos = usePhotoComplete(photo.name?.S || photoInfo?.name.S, window_width, { enabled: !!photo.name?.S || !isLoadingPhotoInfo })
  const { data, isLoading } = usePhotoPersons(photo?.PK.S)

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
  const { width, height } = useMemo(() => {
    if (original_width > window_width - 32) {
      let new_height = original_height * ((window_width - 32) / original_width)

      if (new_height > window_height - 110) {
        return {
          width: original_width * ((window_height - 110) / original_height),
          height: window_height - 110
        }
      } else {
        return {
          width: window_width - 32,
          height: new_height
        }
      }
    } else {
      if (original_height > window_height - 110) {
        return {
          width: original_width * ((window_height - 110) / original_height),
          height: window_height - 110
        }
      } else {
        return {
          width: original_width,
          height: original_height
        }
      }
    }
  }, [original_width, original_height, window_height, window_width])

  return (
    <>
      <div>
        {loading ? (
          photo.blurhash ? (
            <Blurhash hash={photo.blurhash.S} width={width} height={height} />
          ) : null
        ) : (
          <div style={{ position: 'relative' }}>
            <Image
              src={best_loaded_picture?.data.photo}
              preview={false}
              style={{
                width: `${width}px`,
                height: `${height}px`
              }}
              fallback={fallback_image}
            />
            {!isLoading &&
              frames &&
              data.map((face) => {
                const box = JSON.parse(face.bounding_box.S)
                const boundaries = {
                  top: box.Top * 100,
                  left: box.Left * 100,
                  bottom: (box.Top + box.Height) * 100,
                  rigth: (box.Left + box.Width) * 100
                }

                return (
                  <Frame
                    key={face.SK.S}
                    {...boundaries}
                    width={width}
                    height={height}
                    marginLeft='0'
                    onClick={() => {
                      onClick && onClick()
                      navigate(`/person/${encodeURIComponent(face.GSI1PK.S)}`)
                    }}
                  />
                )
              })}
          </div>
        )}
      </div>
    </>
  )
}
