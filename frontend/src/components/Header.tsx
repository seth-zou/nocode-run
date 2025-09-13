import React from 'react'
import { Layout, Typography } from 'antd'
import { useNavigate } from 'react-router-dom'

const { Header: AntHeader } = Layout
const { Title } = Typography

const Header: React.FC = () => {
  const navigate = useNavigate()

  const handleLogoClick = () => {
    navigate('/')
  }

  return (
    <AntHeader style={{ 
      background: '#fff', 
      borderBottom: '1px solid #f0f0f0',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center'
    }}>
      <Title 
        level={3} 
        style={{ 
          margin: 0, 
          cursor: 'pointer',
          color: '#1890ff'
        }}
        onClick={handleLogoClick}
      >
        NoCode Run
      </Title>
    </AntHeader>
  )
}

export default Header