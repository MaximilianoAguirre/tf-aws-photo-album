import React from 'react'
import { Layout, Typography } from 'antd'

const { Footer } = Layout
const { Link } = Typography

export const CustomFooter = () => {
  return (
    <Footer style={{ textAlign: 'center' }}>
      Photo Album - By{' '}
      <Link href='https://www.linkedin.com/in/MaximilianoAguirre/' target='_blank'>
        Maxi Aguirre
      </Link>
    </Footer>
  )
}
