import React, { useRef, useState } from 'react'
import { Col, Row, Empty, Divider, Timeline } from 'antd'
import InfiniteScroll from 'react-infinite-scroll-component'

import { useAllPhotosInfinite } from 'api/dynamo'
import { usePhotoURL } from 'api/cloudfront'
import { CustomImage, StickyHeader, CustomSpinner, WrappedSpinner, ImagePreview } from 'components'
import { useImageSize } from 'context'

const dateFormatter = new Intl.DateTimeFormat('en-US', { month: 'long', year: '2-digit' })

export const AllPhotos = () => {
  const { data: url } = usePhotoURL({ key: 'IMG-20210415-WA0025.jpg', resize: "300x" })
  const preview = useRef()
  const [currentPreview, setCurrentPreview] = useState(null)
  const { current: width } = useImageSize()
  const { data, isLoading, fetchNextPage, hasNextPage } = useAllPhotosInfinite(200)

  console.log(url)

  // Process all pages returned by DynamoDB and create a single list of photos
  const photos = data?.pages.reduce((acc, curr) => {
    return acc.concat(curr.Items)
  }, [])

  // Add time dividers
  const test = photos?.reduce((prev, curr) => {
    const date = new Date(curr.timestamp.N * 1000)

    if (prev.length === 0) {
      prev.push({ divider: `${dateFormatter.format(date)}` })
    } else {
      const last_date = new Date(prev[prev.length - 1].timestamp?.N * 1000)
      const new_date = new Date(curr.timestamp.N * 1000)

      if (last_date.getMonth() !== new_date.getMonth()) {
        prev.push({ divider: `${dateFormatter.format(new_date)}` })
      }
    }

    prev.push(curr)

    return prev
  }, [])

  const openPreview = (photo) => {
    setCurrentPreview(photo)
    preview.current.open()
  }

  const next = () => {
    const current = photos.findIndex((photo) => photo.PK.S === currentPreview.PK.S)
    setCurrentPreview(photos[current + 1 < photos.length ? current + 1 : 0])
  }

  const prev = () => {
    const current = photos.findIndex((photo) => photo.PK.S === currentPreview.PK.S)
    setCurrentPreview(photos[current - 1 >= 0 ? current - 1 : photos.length - 1])
  }

  return (
    <>
      <StickyHeader title={'All photos'} />
      {isLoading ? (
        <WrappedSpinner />
      ) : !photos.length ? (
        <Empty style={{ marginTop: '15px' }} description='No media uploaded' />
      ) : (
        <>
          <InfiniteScroll
            style={{ width: '100%', padding: '5px' }}
            height='calc(100vh - 56px)'
            dataLength={photos.length}
            hasChildren={photos.length}
            hasMore={hasNextPage}
            next={() => fetchNextPage()}
            loader={<CustomSpinner />}
          >
            <Row justify='center' align='bottom' gutter={[15, 15]} style={{ marginTop: '15px', marginBottom: '15px', width: '100%' }}>
              {test.map((photo) => {
                if (photo.divider) {
                  return
                  //   <Divider key={photo.divider} orientation='left'>
                  //     {photo.divider}
                  //   </Divider>
                  // )
                } else {
                  return (
                    <Col key={photo.PK.S}>
                      <CustomImage photo={photo} width={width} onClick={openPreview} />
                    </Col>
                  )
                }
              })}
            </Row>
          </InfiniteScroll>
          <ImagePreview ref={preview} photo={currentPreview} onNext={next} onPrev={prev} />
        </>
      )}
    </>
  )
}
