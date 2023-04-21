import React, { useRef, useState } from 'react'
import { Col, Row, Empty } from 'antd'
import { useParams } from 'react-router-dom'
import InfiniteScroll from 'react-infinite-scroll-component'

import { useLocatedPhotosInfinite } from 'api/dynamo'
import { CustomImage, StickyHeader, LocatedMap, CustomSpinner, WrappedSpinner, ImagePreview } from 'components'
import { useImageSize } from 'context'

export const Located = () => {
  const preview = useRef()
  const [currentPreview, setCurrentPreview] = useState(null)
  let { geohash } = useParams()
  const { current: width } = useImageSize()
  const { data, isLoading, fetchNextPage, hasNextPage } = useLocatedPhotosInfinite(geohash, { limit: 200 })

  // Process all pages returned by DynamoDB and create a single list of photos
  const photos = data?.pages.reduce((acc, curr) => {
    return acc.concat(curr.Items)
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
      <StickyHeader title='Located photos' />
      <LocatedMap hash={geohash} />
      {isLoading ? (
        <WrappedSpinner />
      ) : !photos.length ? (
        <Empty style={{ marginTop: '15px' }} description='No media in this location' />
      ) : (
        <>
          <InfiniteScroll
            style={{ width: '100%', padding: '5px' }}
            height='calc(80vh - 56px)'
            dataLength={photos.length}
            hasChildren={photos.length}
            hasMore={hasNextPage}
            next={() => fetchNextPage()}
            loader={<CustomSpinner />}
          >
            <Row justify='center' align='bottom' gutter={[15, 15]} style={{ marginTop: '15px', width: '100%' }}>
              {photos.map((photo) => (
                <Col key={photo.name.S}>
                  <CustomImage photo={photo} width={width} onClick={openPreview} />
                </Col>
              ))}
            </Row>
          </InfiniteScroll>
          <ImagePreview ref={preview} photo={currentPreview} onNext={next} onPrev={prev} />
        </>
      )}
    </>
  )
}
