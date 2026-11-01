// Unit tests for the apps API routes and health endpoint (backend/src/routes/apps.js)
require('./setup')

const request = require('supertest')
const { createApp } = require('../src/index')

const app = createApp()

describe('GET /api/health', () => {
  it('returns status ok with a timestamp and version', async () => {
    const res = await request(app).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body.timestamp).toEqual(expect.any(String))
    expect(res.body.version).toBe('1.0.0')
  })
})

describe('Apps API', () => {
  describe('GET /api/apps', () => {
    it('returns an empty list when no apps exist', async () => {
      const res = await request(app).get('/api/apps')
      expect(res.status).toBe(200)
      expect(res.body).toEqual([])
    })

    it('returns all created apps', async () => {
      await request(app).post('/api/apps').send({ name: 'App One', description: 'first' })
      await request(app).post('/api/apps').send({ name: 'App Two', description: 'second' })

      const res = await request(app).get('/api/apps')
      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(2)
      const names = res.body.map((a) => a.name).sort()
      expect(names).toEqual(['App One', 'App Two'])
    })
  })

  describe('POST /api/apps', () => {
    it('creates an app and returns 201 with the created app', async () => {
      const res = await request(app)
        .post('/api/apps')
        .send({ name: 'New App', description: 'desc' })

      expect(res.status).toBe(201)
      expect(res.body.id).toEqual(expect.any(String))
      expect(res.body.name).toBe('New App')
      expect(res.body.description).toBe('desc')
      expect(res.body.createdAt).toBeDefined()
      expect(res.body.updatedAt).toBeDefined()
    })

    it('returns 400 when name is missing', async () => {
      const res = await request(app).post('/api/apps').send({ description: 'no name' })
      expect(res.status).toBe(400)
      expect(res.body.error).toBe('数据验证失败')
      expect(res.body.details).toEqual(expect.any(Array))
    })

    it('returns 400 when name exceeds 50 characters', async () => {
      const res = await request(app)
        .post('/api/apps')
        .send({ name: 'x'.repeat(51) })
      expect(res.status).toBe(400)
      expect(res.body.error).toBe('数据验证失败')
    })

    it('returns 400 when description exceeds 200 characters', async () => {
      const res = await request(app)
        .post('/api/apps')
        .send({ name: 'Valid', description: 'y'.repeat(201) })
      expect(res.status).toBe(400)
      expect(res.body.error).toBe('数据验证失败')
    })

    it('returns 409 when creating an app with a duplicate name', async () => {
      await request(app).post('/api/apps').send({ name: 'Dup', description: '' })
      const res = await request(app).post('/api/apps').send({ name: 'Dup', description: '' })
      expect(res.status).toBe(409)
      expect(res.body.error).toBe('应用名称已存在')
    })
  })

  describe('GET /api/apps/:id', () => {
    it('returns the app when it exists', async () => {
      const created = await request(app)
        .post('/api/apps')
        .send({ name: 'Single', description: 'find' })
      const res = await request(app).get(`/api/apps/${created.body.id}`)
      expect(res.status).toBe(200)
      expect(res.body.name).toBe('Single')
    })

    it('returns 404 when the app does not exist', async () => {
      const res = await request(app).get('/api/apps/no-such-app')
      expect(res.status).toBe(404)
      expect(res.body.error).toBe('应用不存在')
    })
  })

  describe('PUT /api/apps/:id', () => {
    it('updates an app and returns the updated app', async () => {
      const created = await request(app)
        .post('/api/apps')
        .send({ name: 'ToUpdate', description: 'before' })

      const res = await request(app)
        .put(`/api/apps/${created.body.id}`)
        .send({ name: 'UpdatedName', description: 'after' })

      expect(res.status).toBe(200)
      expect(res.body.name).toBe('UpdatedName')
      expect(res.body.description).toBe('after')
    })

    it('returns 404 when updating a nonexistent app', async () => {
      const res = await request(app)
        .put('/api/apps/no-such-app')
        .send({ name: 'X', description: '' })
      expect(res.status).toBe(404)
      expect(res.body.error).toBe('应用不存在')
    })

    it('returns 409 when updating to a name used by another app', async () => {
      await request(app).post('/api/apps').send({ name: 'Conflict', description: '' })
      const target = await request(app)
        .post('/api/apps')
        .send({ name: 'Other', description: '' })

      const res = await request(app)
        .put(`/api/apps/${target.body.id}`)
        .send({ name: 'Conflict', description: '' })

      expect(res.status).toBe(409)
      expect(res.body.error).toBe('应用名称已存在')
    })

    it('returns 400 when the updated name exceeds 50 characters', async () => {
      const created = await request(app)
        .post('/api/apps')
        .send({ name: 'Valid', description: '' })

      const res = await request(app)
        .put(`/api/apps/${created.body.id}`)
        .send({ name: 'z'.repeat(51) })

      expect(res.status).toBe(400)
    })
  })

  describe('DELETE /api/apps/:id', () => {
    it('deletes an existing app', async () => {
      const created = await request(app)
        .post('/api/apps')
        .send({ name: 'ToDelete', description: '' })

      const res = await request(app).delete(`/api/apps/${created.body.id}`)
      expect(res.status).toBe(200)
      expect(res.body.deleted).toBe(true)
      expect(res.body.id).toBe(created.body.id)

      const getRes = await request(app).get(`/api/apps/${created.body.id}`)
      expect(getRes.status).toBe(404)
    })

    it('returns 404 when deleting a nonexistent app', async () => {
      const res = await request(app).delete('/api/apps/no-such-app')
      expect(res.status).toBe(404)
      expect(res.body.error).toBe('应用不存在')
    })
  })

  describe('unknown API routes', () => {
    it('returns 404 JSON for unknown API endpoints', async () => {
      const res = await request(app).get('/api/unknown')
      expect(res.status).toBe(404)
      expect(res.body.error).toBe('API endpoint not found')
    })
  })
})
