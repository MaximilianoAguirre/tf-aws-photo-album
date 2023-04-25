import React, { useState, useContext, createContext, useEffect } from 'react'
import { Grid } from 'antd'
import createPersistedState from "use-persisted-state"

const { useBreakpoint } = Grid
const useImageSizeState = createPersistedState("image-size")
const ImageSizeContext = createContext()

export function useImageSize() {
  return useContext(ImageSizeContext)
}

const get_available_widths = (screens) => {
  if (screens['xxl']) return [100, 300, 768, 1280]
  if (screens['lg']) return [100, 300, 768]
  return [100, 300]
}

const get_fullscreen_size = (screens) => {
  if (screens['lg']) return null
  if (screens['md']) return 1280
  return 768
}

export const size_to_label = (size) => {
  const sizes = {
    100: 'xs',
    300: 'sm',
    768: 'md',
    1280: 'lg'
  }
  return sizes[size]
}

export const size_to_limit = (size) => {
  const sizes = {
    100: 200,
    300: 50,
    768: 20,
    1280: 5
  }
  return sizes[size]
}

const set_size = (size, state) => {
  if (state.available.includes(size)) return { ...state, current: size }
  else return state
}

export function ImageSizeProvider({ children }) {
  const breakpoints = useBreakpoint()
  const [state, setState] = useState({
    current: 100,
    available: get_available_widths(breakpoints),
    full_screen_size: get_fullscreen_size(breakpoints)
  })

  // If viewport changes, resize if needed
  useEffect(() => {
    setState((state) => {
      const updated_state = {
        available: get_available_widths(breakpoints),
        full_screen_size: get_fullscreen_size(breakpoints)
      }

      if (!updated_state['available'].includes(state['current'])) updated_state['current'] = get_available_widths(breakpoints).at(-1)
      return { ...state, ...updated_state }
    })
  }, [breakpoints, setState])

  return (
    <ImageSizeContext.Provider
      value={{
        ...state,
        set_size: (size) => setState((state) => set_size(size, state)),
        size_to_label,
        size_to_limit
      }}
    >
      {children}
    </ImageSizeContext.Provider>
  )
}
