import React from 'react'
import { Layout, Typography } from 'antd'
import { useNavigate } from 'react-router-dom'
import { CodeOutlined } from '@ant-design/icons'

const { Header: AntHeader } = Layout
const { Title } = Typography

const Header: React.FC = () => {
  const navigate = useNavigate()

  const handleLogoClick = () => {
    navigate('/')
  }

  return (
    <AntHeader style={{ 
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)', 
      borderBottom: 'none',
      padding: '0 32px',
      display: 'flex',
      alignItems: 'center',
      backdropFilter: 'blur(20px)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      position: 'relative',
      zIndex: 1000
    }}>
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          padding: '8px 16px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
        }}
        onClick={handleLogoClick}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)'
        }}
      >
        <CodeOutlined style={{ fontSize: '20px', marginRight: '8px' }} />
        <Title 
          level={3} 
          style={{ 
            margin: 0,
            color: 'white',
            fontWeight: 600,
            letterSpacing: '0.5px'
          }}
        >
          NoCode Run
        </Title>
      </div>
    </AntHeader>
  )
}

export default Header