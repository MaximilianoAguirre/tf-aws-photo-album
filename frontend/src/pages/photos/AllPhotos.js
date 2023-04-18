import React from 'react'
import { Col, Row, Empty, Divider } from 'antd'
import InfiniteScroll from 'react-infinite-scroll-component'

import { useAllPhotosInfinite } from 'api/dynamo'
import { CustomImage, StickyHeader, CustomSpinner, WrappedSpinner } from 'components'
import { useImageSize } from 'context'

export const AllPhotos = () => {
  const { current: width, size_to_limit } = useImageSize()
  const { data, isLoading, fetchNextPage, hasNextPage } = useAllPhotosInfinite(size_to_limit(width))

  // Process all pages returned by DynamoDB and create a single list of photos
  const photos = data?.pages.reduce((acc, curr) => {
    console.log(curr.Items)
    return acc.concat(curr.Items)
  }, [])

  return (
    <>
      <StickyHeader title={'All photos'} />
      {isLoading ? (
        <WrappedSpinner />
      ) : !photos.length ? (
        <Empty style={{ marginTop: '15px' }} description='No media uploaded' />
      ) : (
        <InfiniteScroll
          style={{ width: '100%', padding: '5px' }}
          height='calc(100vh - 56px)'
          dataLength={photos.length}
          hasChildren={photos.length}
          hasMore={hasNextPage}
          next={() => fetchNextPage()}
          loader={<CustomSpinner />}
        >
          <Divider orientation='left'>Febrero &apos;22</Divider>
          <Row justify='center' align='bottom' gutter={[15, 15]} style={{ marginTop: '15px', width: '100%' }}>
            {photos.map((photo) => (
              <Col key={photo.PK.S}>
                <CustomImage photo={photo} width={width} />
              </Col>
            ))}
          </Row>
        </InfiniteScroll>
      )}
    </>
  )
}
