import React, { useState, useRef } from 'react'
import { Empty, Row, Col, Switch } from 'antd'
import { SmileOutlined } from '@ant-design/icons'
import { useParams } from 'react-router-dom'
import InfiniteScroll from 'react-infinite-scroll-component'

import { usePersonPhotosInfinite } from 'api/dynamo'
import { CustomImage, Frame, StickyHeader, WrappedSpinner, CustomSpinner, ImagePreview } from 'components'
import { useImageSize } from 'context'

export const Person = () => {
  const preview = useRef()
  const [currentPreview, setCurrentPreview] = useState(null)
  const { id } = useParams()
  const { data, isLoading, hasNextPage, fetchNextPage } = usePersonPhotosInfinite(id)
  const [frameVisible, setFrameVisible] = useState(false)

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
            <Row justify='center' align='bottom' gutter={[15, 15]} style={{ marginTop: '15px', width: '100%' }}>
              {photos.map((photo) => (
                <PersonPhoto key={photo.PK.S} photo={photo} frameVisible={frameVisible} onClick={openPreview} />
              ))}
            </Row>
          </InfiniteScroll>
          <ImagePreview ref={preview} photo={currentPreview} onNext={next} onPrev={prev} />
        </>
      )}
    </>
  )
}

const PersonPhoto = ({ photo, frameVisible, onClick }) => {
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
      <CustomImage
        photo={photo}
        width={width}
        onClick={onClick}
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
