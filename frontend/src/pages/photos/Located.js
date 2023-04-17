import React from 'react'
import { Col, Row, Empty } from 'antd'
import { useParams } from 'react-router-dom'
import InfiniteScroll from 'react-infinite-scroll-component'

import { useLocatedPhotosInfinite } from 'api/dynamo'
import { CustomImage, StickyHeader, LocatedMap, CustomSpinner, WrappedSpinner } from 'components'
import { useImageSize } from 'context'

export const Located = () => {
  let { geohash } = useParams()
  const { current: width, size_to_limit } = useImageSize()
  const { data, isLoading, fetchNextPage, hasNextPage } = useLocatedPhotosInfinite(geohash, { limit: size_to_limit(width) })

  // Process all pages returned by DynamoDB and create a single list of photos
  const photos = data?.pages.reduce((acc, curr) => {
    return acc.concat(curr.Items)
  }, [])

  return (
    <>
      <StickyHeader title='Located photos' />
      <LocatedMap hash={geohash} />
      {isLoading ? (
        <WrappedSpinner />
      ) : !photos.length ? (
        <Empty style={{ marginTop: '15px' }} description='No media in this location' />
      ) : (
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
                <CustomImage photo={photo} width={width} />
              </Col>
            ))}
          </Row>
        </InfiniteScroll>
      )}
    </>
  )
}
