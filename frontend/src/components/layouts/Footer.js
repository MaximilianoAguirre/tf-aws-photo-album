import React from 'react'
import { Layout, Typography } from 'antd'

const { Footer } = Layout
const { Link } = Typography

export const CustomFooter = () => {
  return (
    <Footer style={{ textAlign: 'center' }}>
      Photo Gallery - By{' '}
      <Link href='https://www.linkedin.com/in/MaximilianoAguirre/' target='_blank'>
        Maximiliano Aguirre
      </Link>
    </Footer>
  )
}
