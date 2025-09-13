const express = require('express')
const Joi = require('joi')
const App = require('../models/App')

const router = express.Router()

// 验证模式
const createAppSchema = Joi.object({
  name: Joi.string().trim().min(1).max(50).required().messages({
    'string.empty': '应用名称不能为空',
    'string.min': '应用名称至少需要1个字符',
    'string.max': '应用名称不能超过50个字符',
    'any.required': '应用名称是必填项'
  }),
  description: Joi.string().trim().max(200).allow('').messages({
    'string.max': '应用描述不能超过200个字符'
  })
})

const updateAppSchema = Joi.object({
  name: Joi.string().trim().min(1).max(50).messages({
    'string.empty': '应用名称不能为空',
    'string.min': '应用名称至少需要1个字符',
    'string.max': '应用名称不能超过50个字符'
  }),
  description: Joi.string().trim().max(200).allow('').messages({
    'string.max': '应用描述不能超过200个字符'
  })
})

// 获取所有应用
router.get('/', async (req, res) => {
  try {
    const apps = await App.findAll()
    res.json(apps)
  } catch (error) {
    console.error('Error fetching apps:', error)
    res.status(500).json({ 
      error: '获取应用列表失败',
      message: error.message 
    })
  }
})

// 获取单个应用
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: '无效的应用ID' })
    }
    
    const app = await App.findById(id)
    
    if (!app) {
      return res.status(404).json({ error: '应用不存在' })
    }
    
    res.json(app)
  } catch (error) {
    console.error('Error fetching app:', error)
    res.status(500).json({ 
      error: '获取应用失败',
      message: error.message 
    })
  }
})

// 创建应用
router.post('/', async (req, res) => {
  try {
    // 验证请求数据
    const { error, value } = createAppSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ 
        error: '数据验证失败',
        details: error.details.map(detail => detail.message)
      })
    }
    
    const { name, description } = value
    
    // 检查应用名称是否已存在
    const nameExists = await App.nameExists(name)
    if (nameExists) {
      return res.status(409).json({ error: '应用名称已存在' })
    }
    
    // 创建应用
    const app = await App.create({ name, description })
    
    res.status(201).json(app)
  } catch (error) {
    console.error('Error creating app:', error)
    res.status(500).json({ 
      error: '创建应用失败',
      message: error.message 
    })
  }
})

// 更新应用
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: '无效的应用ID' })
    }
    
    // 验证请求数据
    const { error, value } = updateAppSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ 
        error: '数据验证失败',
        details: error.details.map(detail => detail.message)
      })
    }
    
    const { name, description } = value
    
    // 检查应用是否存在
    const existingApp = await App.findById(id)
    if (!existingApp) {
      return res.status(404).json({ error: '应用不存在' })
    }
    
    // 如果更新名称，检查新名称是否已被其他应用使用
    if (name && name !== existingApp.name) {
      const nameExists = await App.nameExists(name, id)
      if (nameExists) {
        return res.status(409).json({ error: '应用名称已存在' })
      }
    }
    
    // 更新应用
    const updatedApp = await App.update(id, { 
      name: name || existingApp.name, 
      description: description !== undefined ? description : existingApp.description 
    })
    
    res.json(updatedApp)
  } catch (error) {
    console.error('Error updating app:', error)
    res.status(500).json({ 
      error: '更新应用失败',
      message: error.message 
    })
  }
})

// 删除应用
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: '无效的应用ID' })
    }
    
    // 检查应用是否存在
    const existingApp = await App.findById(id)
    if (!existingApp) {
      return res.status(404).json({ error: '应用不存在' })
    }
    
    // 删除应用
    const result = await App.delete(id)
    
    res.json({ 
      message: '应用删除成功',
      ...result 
    })
  } catch (error) {
    console.error('Error deleting app:', error)
    res.status(500).json({ 
      error: '删除应用失败',
      message: error.message 
    })
  }
})

module.exports = router