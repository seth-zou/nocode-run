import React, { useEffect, useState } from 'react'
import { Card, Button, Modal, Form, Input, message, Row, Col, Typography, Empty, Popconfirm } from 'antd'
import { PlusOutlined, DeleteOutlined, AppstoreOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/appStore'
import { appApi } from '../services/api'

const { Title, Paragraph } = Typography
const { TextArea } = Input

const HomePage: React.FC = () => {
  const navigate = useNavigate()
  const { apps, setApps, addApp, deleteApp, loading, setLoading, setError } = useAppStore()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    loadApps()
  }, [])

  const loadApps = async () => {
    try {
      setLoading(true)
      const appsData = await appApi.getApps()
      setApps(appsData)
    } catch (error) {
      console.error('Failed to load apps:', error)
      setError('加载应用列表失败')
      message.error('加载应用列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateApp = async (values: { name: string; description: string }) => {
    try {
      const newApp = await appApi.createApp(values)
      addApp(newApp)
      message.success('应用创建成功')
      setIsModalVisible(false)
      form.resetFields()
    } catch (error) {
      console.error('Failed to create app:', error)
      message.error('应用创建失败')
    }
  }

  const handleDeleteApp = async (id: string) => {
    try {
      await appApi.deleteApp(id)
      deleteApp(id)
      message.success('应用删除成功')
    } catch (error) {
      console.error('Failed to delete app:', error)
      message.error('应用删除失败')
    }
  }

  const handleAppClick = (appId: string) => {
    navigate(`/app/${appId}`)
  }

  return (
    <div>
      <div style={{ 
        marginBottom: 32, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '24px 0',
        borderBottom: '1px solid rgba(0, 0, 0, 0.06)'
      }}>
        <div>
          <Title level={2} style={{ 
            margin: 0,
            background: 'linear-gradient(135deg,#667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontWeight: 700
          }}>
            <AppstoreOutlined style={{ 
              marginRight: 12,
              color: '#667eea',
              fontSize: '28px'
            }} />
            我的应用
          </Title>
          <Paragraph type="secondary" style={{ 
            margin: '12px 0 0 0',
            fontSize: '16px',
            color: '#64748b'
          }}>
            通过自然语言描述创建和管理您的应用
          </Paragraph>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          size="large"
          onClick={() => setIsModalVisible(true)}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            borderRadius: '12px',
            height: '48px',
            padding: '0 24px',
            fontSize: '16px',
            fontWeight: 600,
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)'
          }}
        >
          创建应用
        </Button>
      </div>

      {apps.length === 0 ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: '20px',
          padding: '60px 40px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)',
          marginTop: 20
        }}>
          <div style={{
            width: '120px',
            height: '120px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px',
            boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
          }}>
            <AppstoreOutlined style={{ fontSize: '48px', color: 'white' }} />
          </div>
          <Title level={3} style={{ 
            color: '#334155',
            marginBottom: '12px',
            textAlign: 'center'
          }}>
            开始创建您的第一个应用
          </Title>
          <Paragraph style={{ 
            color: '#64748b',
            fontSize: '16px',
            textAlign: 'center',
            maxWidth: '400px',
            lineHeight: '1.6'
          }}>
            使用自然语言描述您想要的功能，我们将为您生成相应的代码
          </Paragraph>
        </div>
      ) : (
        <Row gutter={[16, 16]}>
          {apps.map((app) => (
            <Col xs={24} sm={12} md={8} lg={6} key={app.id}>
              <Card
                className="app-card"
                hoverable
                actions={[
                  <Popconfirm
                    key="delete"
                    title="确定要删除这个应用吗？"
                    onConfirm={() => handleDeleteApp(app.id)}
                    okText="确定"
                    cancelText="取消"
                  >
                    <DeleteOutlined style={{ color: '#ff4d4f' }} />
                  </Popconfirm>
                ]}
                onClick={() => handleAppClick(app.id)}
              >
                <Card.Meta
                  title={app.name}
                  description={
                    <div>
                      <Paragraph 
                        ellipsis={{ rows: 2 }} 
                        style={{ marginBottom: 8, minHeight: 44 }}
                      >
                        {app.description || '暂无描述'}
                      </Paragraph>
                      <div style={{ fontSize: 12, color: '#999' }}>
                        创建时间: {new Date(app.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Modal
        title={
          <div style={{
            fontSize: '20px',
            fontWeight: 600,
            color: '#334155',
            padding: '8px 0'
          }}>
            创建新应用
          </div>
        }
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false)
          form.resetFields()
        }}
        footer={null}
        width={520}
        style={{
          borderRadius: '16px'
        }}
        styles={{
          content: {
            borderRadius: '16px',
            padding: '32px'
          },
          header: {
            borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
            paddingBottom: '16px',
            marginBottom: '24px'
          }
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateApp}
        >
          <Form.Item
            name="name"
            label="应用名称"
            rules={[
              { required: true, message: '请输入应用名称' },
              { max: 50, message: '应用名称不能超过50个字符' }
            ]}
          >
            <Input placeholder="请输入应用名称" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="应用描述"
            rules={[
              { max: 200, message: '应用描述不能超过200个字符' }
            ]}
          >
            <TextArea 
              rows={4} 
              placeholder="请描述您想要创建的应用功能和特点"
            />
          </Form.Item>
          
          <Form.Item style={{ marginBottom: 0, textAlign: 'right', marginTop: '32px' }}>
            <Button 
              onClick={() => {
                setIsModalVisible(false)
                form.resetFields()
              }}
              style={{ 
                marginRight: 12,
                borderRadius: '8px',
                height: '40px',
                padding: '0 20px',
                border: '1px solid #d1d5db',
                color: '#6b7280'
              }}
            >
              取消
            </Button>
            <Button 
              type="primary" 
              htmlType="submit"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '8px',
                height: '40px',
                padding: '0 20px',
                fontWeight: 600,
                boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
              }}
            >
              创建应用
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default HomePage