import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Layout } from 'antd'
import HomePage from './pages/HomePage'
import DevelopmentPage from './pages/DevelopmentPage.tsx'
import Header from './components/Header'

const { Content } = Layout

function App() {
  return (
    <Layout className="app-container">
      <Header />
      <Content className="page-container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/app/:appId" element={<DevelopmentPage />} />
        </Routes>
      </Content>
    </Layout>
  )
}

export default App