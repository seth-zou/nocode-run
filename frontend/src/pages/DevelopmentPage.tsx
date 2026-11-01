import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Input, Card, Typography, message, Spin } from 'antd'
import { ArrowLeftOutlined, SendOutlined } from '@ant-design/icons'
import { useAppStore } from '../store/appStore'
import { appApi } from '../services/api'
import logger from '../services/logger'

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
      logger.debug('Loading app', { id })
      const app = await appApi.getApp(id)
      logger.debug('App loaded', { id, name: app.name })
      setCurrentApp(app)
    } catch (error: any) {
      logger.error('Failed to load app', {
        id,
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
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
      logger.error('Failed to generate code', { appId, error: error.message })
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
      <div style={{ 
        marginBottom: 32, 
        display: 'flex', 
        alignItems: 'center', 
        gap: 20,
        padding: '24px 0',
        borderBottom: '1px solid rgba(0, 0, 0, 0.06)'
      }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={handleBack}
          style={{
            borderRadius: '12px',
            height: '44px',
            padding: '0 20px',
            border: '1px solid #e2e8f0',
            background: 'white',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
            transition: 'all 0.3s ease',
            fontWeight: 500
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)'
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.06)'
          }}
        >
          返回首页
        </Button>
        <div>
          <Title level={3} style={{ 
            margin: 0,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontWeight: 700
          }}>
            {currentApp?.name || '应用开发'}
          </Title>
          <Text style={{
            color: '#64748b',
            fontSize: '15px',
            marginTop: '4px',
            display: 'block'
          }}>
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
              fontSize: '13px',
              lineHeight: '1.6',
              margin: 0,
              maxHeight: '450px',
              overflow: 'auto',
              background: 'linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%)',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              color: '#334155',
              fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
              boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)'
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
              style={{
                background: isGenerating 
                  ? 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)'
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '12px',
                height: '48px',
                fontSize: '16px',
                fontWeight: 600,
                boxShadow: isGenerating 
                  ? '0 4px 15px rgba(148, 163, 184, 0.3)'
                  : '0 4px 15px rgba(102, 126, 234, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                if (!isGenerating) {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isGenerating) {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)'
                }
              }}
            >
              {isGenerating ? '生成中...' : '提交需求'}
            </Button>
          </Card>
        </div>
        
        <Card 
          className="preview-panel" 
          title={
            <span style={{
              fontSize: '16px',
              fontWeight: 600,
              color: '#334155'
            }}>
              应用预览
            </span>
          }
          styles={{
            header: {
              borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
              padding: '20px 24px 16px'
            },
            body: {
              padding: '24px',
              height: 'calc(100% - 60px)'
            }
          }}
        >
          <div style={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center',
            background: 'linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%)',
            borderRadius: '12px',
            padding: '40px',
            border: '2px dashed #cbd5e1',
            minHeight: '300px'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
              opacity: 0.8
            }}>
              <span style={{ fontSize: '32px', color: 'white' }}>📱</span>
            </div>
            <div style={{
              color: '#64748b',
              fontSize: '16px',
              textAlign: 'center',
              lineHeight: '1.6'
            }}>
              应用预览将在这里显示
              <br />
              <span style={{ fontSize: '14px', opacity: 0.8 }}>
                提交需求后查看生成的应用效果
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default DevelopmentPage