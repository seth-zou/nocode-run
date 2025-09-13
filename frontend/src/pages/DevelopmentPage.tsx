import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Input, Card, Typography, message, Spin } from 'antd'
import { ArrowLeftOutlined, SendOutlined } from '@ant-design/icons'
import { useAppStore } from '../store/appStore'
import { appApi } from '../services/api'

const { TextArea } = Input
const { Title, Text } = Typography

const DevelopmentPage: React.FC = () => {
  const { appId } = useParams<{ appId: string }>()
  const navigate = useNavigate()
  const { currentApp, setCurrentApp, loading, setLoading } = useAppStore()
  const [requirement, setRequirement] = useState('')
  const [codeOutput, setCodeOutput] = useState('欢迎使用 NoCode Run！\n\n请在下方输入您的需求描述，我将为您生成相应的代码。')
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    if (appId) {
      loadApp(appId)
    }
  }, [appId])

  const loadApp = async (id: string) => {
    try {
      setLoading(true)
      console.log('Loading app with ID:', id)
      const app = await appApi.getApp(id)
      console.log('App loaded successfully:', app)
      setCurrentApp(app)
    } catch (error: any) {
      console.error('Failed to load app:', error)
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      })
      message.error(`加载应用失败: ${error.response?.data?.error || error.message}`)
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitRequirement = async () => {
    if (!requirement.trim()) {
      message.warning('请输入需求描述')
      return
    }

    setIsGenerating(true)
    try {
      // 模拟代码生成过程
      setCodeOutput('正在分析您的需求...')
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setCodeOutput(`正在为您生成代码...\n\n需求: ${requirement}\n\n生成的代码将在这里显示。`)
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const generatedCode = `// 基于需求生成的代码\n// 需求: ${requirement}\n\nfunction App() {\n  return (\n    <div>\n      <h1>Hello World</h1>\n      <p>这是根据您的需求生成的应用</p>\n    </div>\n  )\n}\n\nexport default App`
      
      setCodeOutput(generatedCode)
      message.success('代码生成完成')
    } catch (error: any) {
      console.error('Failed to generate code:', error)
      message.error('代码生成失败')
      setCodeOutput('代码生成失败，请重试。')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleBack = () => {
    navigate('/')
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={handleBack}
        >
          返回首页
        </Button>
        <div>
          <Title level={3} style={{ margin: 0 }}>
            {currentApp?.name || '应用开发'}
          </Title>
          <Text type="secondary">
            {currentApp?.description || '应用开发页面'}
          </Text>
        </div>
      </div>

      <div className="development-layout">
        <div className="left-panel">
          <Card className="code-display" title="代码生成过程">
            <pre style={{ 
              whiteSpace: 'pre-wrap', 
              wordBreak: 'break-word',
              fontSize: '12px',
              lineHeight: '1.4',
              margin: 0,
              maxHeight: '400px',
              overflow: 'auto'
            }}>
              {codeOutput}
            </pre>
          </Card>
          
          <Card className="input-area" title="需求输入">
            <TextArea
              value={requirement}
              onChange={(e) => setRequirement(e.target.value)}
              placeholder="请用自然语言描述您想要实现的功能...\n\n例如：创建一个待办事项列表，包含添加、删除、标记完成等功能"
              rows={3}
              style={{ marginBottom: 12 }}
            />
            <Button 
              type="primary" 
              icon={<SendOutlined />}
              onClick={handleSubmitRequirement}
              loading={isGenerating}
              block
            >
              {isGenerating ? '生成中...' : '提交需求'}
            </Button>
          </Card>
        </div>
        
        <Card className="preview-panel" title="应用预览">
          <div style={{ 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#999',
            fontSize: '16px'
          }}>
            应用预览将在这里显示
          </div>
        </Card>
      </div>
    </div>
  )
}

export default DevelopmentPage