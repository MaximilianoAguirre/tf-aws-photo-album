import React from 'react'

export const Frame = ({ top, left, bottom, rigth }) => {
  return (
    <svg
      width='calc(100% - 15px)'
      height='100%'
      xmlns='http://www.w3.org/2000/svg'
      style={{ position: 'absolute', top: 0, left: 0, display: 'block', marginLeft: '7.5px' }}
      viewBox='0 0 100 100'
      preserveAspectRatio='none'
    >
      <path d={`M ${left} ${top} H ${rigth} V ${bottom} H ${left} Z`} fill='transparent' stroke='red' vectorEffect='non-scaling-stroke' />
    </svg>
  )
}
