import React from 'react'
import { message, Upload } from 'antd'
import { InboxOutlined } from '@ant-design/icons'
import { S3Client } from '@aws-sdk/client-s3'
import { XhrHttpHandler } from '@aws-sdk/xhr-http-handler'
import { Upload as S3Upload } from '@aws-sdk/lib-storage'

import { StickyHeader } from 'components'
import { getSignedClient } from 'util/aws'
import { config } from 'config/config'

const { Dragger } = Upload

export const UploadFiles = () => {
  return (
    <>
      <StickyHeader title='Upload files' chooseSize={false} />
      <div style={{ padding: '15px', minHeight: '20vh' }}>
        <Dragger
          name='files'
          multiple={true}
          accept='.jpeg,.jpg'
          listType='picture-card'
          // className='upload-list-inline'
          progress={{
            strokeWidth: 2,
            showInfo: true,
            format: (percent) => percent && `${parseFloat(percent.toFixed(2))}%`
          }}
          showUploadList={{
            showPreviewIcon: false,
            showDownloadIcon: false,
            showRemoveIcon: false
          }}
          customRequest={async ({ file, onError, onProgress, onSuccess }) => {
            const client = await getSignedClient(S3Client, { requestHandler: new XhrHttpHandler({}) })

            try {
              const upload = new S3Upload({
                client: client,
                params: {
                  Bucket: config.PHOTO_BUCKET,
                  Key: file.name,
                  Body: file,
                  ContentType: file.type
                }
              })

              upload.on('httpUploadProgress', (progress) => {
                onProgress(
                  {
                    percent: Math.round((progress.loaded / progress.total) * 100)
                  },
                  file
                )
              })

              const response = await upload.done()
              onSuccess(response, file)
            } catch (err) {
              onError()
              message.error(err.message)
            }
          }}
        >
          <p className='ant-upload-drag-icon'>
            <InboxOutlined />
          </p>
          <p className='ant-upload-text'>Click or drag file to this area to upload</p>
        </Dragger>
      </div>
    </>
  )
}
