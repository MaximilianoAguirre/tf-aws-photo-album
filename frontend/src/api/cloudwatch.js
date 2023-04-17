import { useQueries, useQuery, useInfiniteQuery } from 'react-query'
import { CloudWatchClient, GetMetricWidgetImageCommand } from '@aws-sdk/client-cloudwatch'

import { config } from 'config/config'
import { getSignedClient } from 'util/aws'

export function useMetricImage(metric, options = {}) {
  return useQuery(
    ['metric-image', metric],
    async () => {
      const command = new GetMetricWidgetImageCommand({
        MetricWidget: JSON.stringify(metric)
      })

      const client = await getSignedClient(CloudWatchClient)
      const response = await client.send(command)
      return URL.createObjectURL(new Blob([response.MetricWidgetImage.buffer], { type: 'image/png' }))
    },
    {
      staleTime: 24 * 3600 * 1000,
      ...options
    }
  )
}
