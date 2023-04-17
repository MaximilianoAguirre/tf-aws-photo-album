import React, { useState } from 'react'
import { Empty, Row, Col, Switch } from 'antd'
import { SmileOutlined } from '@ant-design/icons'
import { useParams } from 'react-router-dom'
import InfiniteScroll from 'react-infinite-scroll-component'

import { usePersonPhotosInfinite } from 'api/dynamo'
import { CustomImageFromId, Frame, StickyHeader, WrappedSpinner, CustomSpinner } from 'components'
import { useImageSize } from 'context'

export const Person = () => {
  const { id } = useParams()
  const { data, isLoading, hasNextPage, fetchNextPage } = usePersonPhotosInfinite(id)
  const [frameVisible, setFrameVisible] = useState(false)

  const photos = data?.pages.reduce((acc, curr) => {
    return acc.concat(curr.Items)
  }, [])

  return (
    <>
      <StickyHeader title='Person photos'>
        <Col flex='50px'>
          <Switch
            type='primary'
            checkedChildren={<SmileOutlined />}
            unCheckedChildren={<SmileOutlined />}
            checked={frameVisible}
            onChange={() => setFrameVisible((state) => !state)}
          />
        </Col>
      </StickyHeader>
      {isLoading ? (
        <WrappedSpinner />
      ) : !photos.length ? (
        <Empty style={{ marginTop: '15px' }} description='No data' />
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
          <Row justify='center' align='bottom' gutter={[15, 15]} style={{ marginTop: '15px', width: '100%' }}>
            {photos.map((photo) => (
              <PersonPhoto key={photo.PK.S} photo={photo} frameVisible={frameVisible} />
            ))}
          </Row>
        </InfiniteScroll>
      )}
    </>
  )
}

const PersonPhoto = ({ photo, frameVisible }) => {
  const { current: width } = useImageSize()

  const box = JSON.parse(photo.bounding_box.S)
  const boundaries = {
    top: box.Top * 100,
    left: box.Left * 100,
    bottom: (box.Top + box.Height) * 100,
    rigth: (box.Left + box.Width) * 100
  }

  return (
    <Col key={photo.PK.S} style={{ position: 'relative' }}>
      <CustomImageFromId
        photoId={photo.PK.S}
        width={width}
        style={{
          position: 'absolute',
          top: 0,
          left: 0
        }}
      />
      {frameVisible && <Frame {...boundaries} />}
    </Col>
  )
}
