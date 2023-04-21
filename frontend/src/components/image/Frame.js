import React from 'react'

export const Frame = ({ top, left, bottom, rigth, width = 'calc(100% - 15px)', height = '100%', marginLeft = '7.5px', onClick }) => {
  return (
    <svg
      width={width}
      height={height}
      xmlns='http://www.w3.org/2000/svg'
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        display: 'block',
        marginLeft: marginLeft,
        pointerEvents: 'none'
      }}
      viewBox='0 0 100 100'
      preserveAspectRatio='none'
    >
      <path
        onClick={() => onClick && onClick()}
        d={`M ${left} ${top} H ${rigth} V ${bottom} H ${left} Z`}
        fill='transparent'
        stroke='red'
        vectorEffect='non-scaling-stroke'
        style={{
          cursor: onClick ? 'pointer' : 'default',
          pointerEvents: onClick ? 'auto' : 'none'
        }}
      />
    </svg>
  )
}
