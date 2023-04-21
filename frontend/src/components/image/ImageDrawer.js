import React, { useState, forwardRef, useImperativeHandle, useRef } from 'react'
import { Drawer, Button, Row, Col } from 'antd'
import { useNavigate } from 'react-router-dom'

import { CustomImage, WrappedSpinner, ImagePreview } from 'components'
import { useLocatedPhotos } from 'api/dynamo'

export const ImageDrawer = forwardRef((props, ref) => {
  const preview = useRef()
  const [currentPreview, setCurrentPreview] = useState(null)
  const [open, setOpen] = useState(false)
  const [hash, setHash] = useState(null)
  const { data, isLoading } = useLocatedPhotos(hash, { limit: 5, options: { enabled: Boolean(hash) } })
  const navigate = useNavigate()

  useImperativeHandle(ref, () => ({
    open() {
      setOpen(true)
    },
    setHash(hash) {
      setHash(hash)
    }
  }))

  const onClose = () => {
    setOpen(false)
  }

  const openPreview = (photo) => {
    setCurrentPreview(photo)
    preview.current.open()
  }

  const next = () => {
    const current = data.findIndex((photo) => photo.PK.S === currentPreview.PK.S)
    setCurrentPreview(data[current + 1 < data.length ? current + 1 : 0])
  }

  const prev = () => {
    const current = data.findIndex((photo) => photo.PK.S === currentPreview.PK.S)
    setCurrentPreview(data[current - 1 >= 0 ? current - 1 : data.length - 1])
  }

  return (
    <Drawer title={<Button onClick={() => navigate(`/located/${hash}`)}>See all</Button>} placement='right' onClose={onClose} open={open}>
      {isLoading ? (
        <WrappedSpinner />
      ) : (
        <Row gutter={[5, 5]} justify='center' align='middle'>
          {data?.map((photo) => (
            <Col key={photo.name.S}>
              <CustomImage photo={photo} width={300} onClick={openPreview} />
            </Col>
          ))}
        </Row>
      )}
      <ImagePreview ref={preview} photo={currentPreview} onNext={next} onPrev={prev} />
    </Drawer>
  )
})

ImageDrawer.displayName = 'ImageDrawer'
