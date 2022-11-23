import { Grid } from 'antd'

const { useBreakpoint } = Grid

export function usePhotoWidths() {
  const screens = useBreakpoint()

  if (screens['xxl']) return [100, 300, 768, 1280]
  if (screens['lg']) return [100, 300, 768]
  return [100, 300]
}

export function useFullscreenPhotoWidth() {
  const screens = useBreakpoint()

  if (screens['lg']) return null
  if (screens['md']) return 1280
  return 768
}
