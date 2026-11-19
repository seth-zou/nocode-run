const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const path = require('path')
require('dotenv').config()

const appRoutes = require('./routes/apps')
const { initDatabase } = require('./database/init')
const logger = require('./utils/logger')
const requestLogger = require('./utils/requestLogger')

function createApp() {
  const app = express()

  // 中间件
  app.use(helmet())
  app.use(cors())
  // Structured HTTP access logging (routes Morgan output through the logger).
  app.use(requestLogger())
  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ extended: true }))

  // 静态文件服务
  app.use(express.static(path.join(__dirname, '../../frontend/dist')))

  // API 路由
  app.use('/api/apps', appRoutes)

  // 健康检查
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    })
  })

  // 前端路由处理 (SPA)
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'API endpoint not found' })
    }
    res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'))
  })

  // 错误处理中间件
  app.use((err, req, res, next) => {
    logger.error('Unhandled request error', {
      method: req.method,
      path: req.path,
      error: err.message,
      stack: err.stack,
    })
    res.status(err.status || 500).json({
      error: err.message || 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    })
  })

  // 404 处理
  app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' })
  })

  return app
}

module.exports = { createApp, initDatabase }

// 仅在直接执行此文件时启动服务器（测试通过 require 引入时不启动）
if (require.main === module) {
  const PORT = process.env.PORT || 3003
  const app = createApp()

  // 初始化数据库并启动服务器
  initDatabase()
    .then(() => {
      app.listen(PORT, () => {
        logger.info('Server started', {
          port: PORT,
          frontend: `http://localhost:${PORT}`,
          api: `http://localhost:${PORT}/api`,
          health: `http://localhost:${PORT}/api/health`,
        })
      })
    })
    .catch((error) => {
      logger.error('Failed to initialize database', { error: error.message, stack: error.stack })
      process.exit(1)
    })

  // 优雅关闭
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully')
    process.exit(0)
  })

  process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully')
    process.exit(0)
  })
}