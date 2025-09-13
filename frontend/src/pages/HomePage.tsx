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
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>
            <AppstoreOutlined style={{ marginRight: 8 }} />
            我的应用
          </Title>
          <Paragraph type="secondary" style={{ margin: '8px 0 0 0' }}>
            通过自然语言描述创建和管理您的应用
          </Paragraph>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          size="large"
          onClick={() => setIsModalVisible(true)}
        >
          创建应用
        </Button>
      </div>

      {apps.length === 0 ? (
        <Empty 
          description="暂无应用，点击上方按钮创建您的第一个应用"
          style={{ marginTop: 60 }}
        />
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
        title="创建新应用"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false)
          form.resetFields()
        }}
        footer={null}
        width={500}
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
          
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button 
              onClick={() => {
                setIsModalVisible(false)
                form.resetFields()
              }}
              style={{ marginRight: 8 }}
            >
              取消
            </Button>
            <Button type="primary" htmlType="submit">
              创建应用
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default HomePage