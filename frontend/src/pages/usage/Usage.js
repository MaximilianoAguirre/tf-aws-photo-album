import React from 'react'

import { StickyHeader, WrappedSpinner } from 'components'
import { useMetricImage } from 'api/cloudwatch'

export const Usage = () => {
  const { data, isLoading } = useMetricImage({
    metrics: [
      [
        'AWS/S3',
        'BucketSizeBytes',
        'StorageType',
        'StandardStorage',
        'BucketName',
        'photo-assets-bucket-20221117205403796800000006',
        { label: 'Assets' }
      ],
      ['...', 'photo-bucket-20221117205400769200000005', { label: 'Photos' }]
    ],
    view: 'timeSeries',
    stacked: true,
    region: 'us-east-1',
    title: 'S3 storage',
    period: 86400,
    stat: 'Average',
    start: '-PT168H',
    theme: 'dark'
  })

  return (
    <>
      <StickyHeader title='Usage' />
      {isLoading ? <WrappedSpinner /> : <img src={data} />}
    </>
  )
}
