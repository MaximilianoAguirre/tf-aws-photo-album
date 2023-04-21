import React, { useState, forwardRef, useImperativeHandle } from 'react'
import { Modal, Button, Switch } from 'antd'
import { SmileOutlined } from '@ant-design/icons'
import { CloseCircleOutlined, RightCircleOutlined, LeftCircleOutlined } from '@ant-design/icons'

import { FullScreenPhoto } from 'components'

export const ImagePreview = forwardRef(({ photo, onNext, onPrev }, ref) => {
  const [open, setOpen] = useState(false)
  const [frameVisible, setFrameVisible] = useState(false)

  useImperativeHandle(ref, () => ({
    open() {
      setOpen(true)
    }
  }))

  const close = () => setOpen(false)

  return (
    photo && (
      <Modal
        title={photo.PK.S.replace('#S3#', '')}
        open={open}
        onCancel={() => close()}
        wrapClassName='fullscreen-modal'
        footer={[
          <Switch
            type='primary'
            key='frame'
            checkedChildren={<SmileOutlined />}
            unCheckedChildren={<SmileOutlined />}
            checked={frameVisible}
            onChange={() => setFrameVisible((state) => !state)}
            style={{ marginRight: '10px' }}
          />,
          ...(onPrev
            ? [
                <Button key='back' icon={<LeftCircleOutlined />} onClick={() => onPrev()}>
                  Previous
                </Button>
              ]
            : []),
          ...(onNext
            ? [
                <Button key='submit' icon={<RightCircleOutlined />} onClick={() => onNext()}>
                  Next
                </Button>
              ]
            : []),
          <Button key='close' type='primary' onClick={() => setOpen(false)} icon={<CloseCircleOutlined />} danger>
            Close
          </Button>
        ]}
      >
        <FullScreenPhoto photo={photo} onClick={close} frames={frameVisible} />
      </Modal>
    )
  )
})

ImagePreview.displayName = 'ImagePreview'
