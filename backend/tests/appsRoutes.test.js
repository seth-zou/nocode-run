const fs = require('fs')
const path = require('path')
const os = require('os')
const request = require('supertest')

// Use a unique temp database for each test process so we never touch the
// real development database file.
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nocode-route-'))
const dbPath = path.join(tempDir, 'test.db')
process.env.DB_PATH = dbPath

const { app, initDatabase } = require('../src/index')
const { closeDatabase } = require('../src/database/init')

beforeAll(async () => {
  await initDatabase()
})

afterAll(async () => {
  await closeDatabase()
  fs.rmSync(tempDir, { recursive: true, force: true })
})

afterEach(async () => {
  const { getDatabase } = require('../src/database/init')
  await new Promise((resolve, reject) => {
    getDatabase().run('DELETE FROM apps', (err) => {
      if (err) return reject(err)
      resolve()
    })
  })
})

describe('GET /api/health', () => {
  it('returns status ok with a timestamp and version', async () => {
    const res = await request(app).get('/api/health')

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body.timestamp).toBeDefined()
    expect(res.body.version).toBe('1.0.0')
  })
})

describe('POST /api/apps', () => {
  it('creates an app and returns 201 with the app body', async () => {
    const res = await request(app)
      .post('/api/apps')
      .send({ name: 'RouteApp', description: 'via route' })

    expect(res.status).toBe(201)
    expect(res.body.id).toBeDefined()
    expect(res.body.name).toBe('RouteApp')
    expect(res.body.description).toBe('via route')
  })

  it('returns 400 when name is missing', async () => {
    const res = await request(app).post('/api/apps').send({ description: 'x' })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('数据验证失败')
    expect(Array.isArray(res.body.details)).toBe(true)
  })

  it('returns 409 when creating a duplicate name', async () => {
    await request(app).post('/api/apps').send({ name: 'Dup', description: '' })
    const res = await request(app).post('/api/apps').send({ name: 'Dup' })

    expect(res.status).toBe(409)
    expect(res.body.error).toBe('应用名称已存在')
  })
})

describe('GET /api/apps', () => {
  it('returns an empty list initially', async () => {
    const res = await request(app).get('/api/apps')

    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })

  it('returns created apps', async () => {
    await request(app).post('/api/apps').send({ name: 'A', description: '' })
    await request(app).post('/api/apps').send({ name: 'B', description: '' })

    const res = await request(app).get('/api/apps')

    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(2)
    const names = res.body.map((a) => a.name)
    expect(names).toContain('A')
    expect(names).toContain('B')
  })
})

describe('GET /api/apps/:id', () => {
  it('returns 404 for a non-existent id', async () => {
    const res = await request(app).get('/api/apps/no-such-id')

    expect(res.status).toBe(404)
    expect(res.body.error).toBe('应用不存在')
  })

  it('returns the app for a valid id', async () => {
    const created = await request(app)
      .post('/api/apps')
      .send({ name: 'Find', description: 'd' })

    const res = await request(app).get(`/api/apps/${created.body.id}`)

    expect(res.status).toBe(200)
    expect(res.body.name).toBe('Find')
  })
})

describe('PUT /api/apps/:id', () => {
  it('updates an existing app', async () => {
    const created = await request(app)
      .post('/api/apps')
      .send({ name: 'Old', description: 'old desc' })

    const res = await request(app)
      .put(`/api/apps/${created.body.id}`)
      .send({ name: 'New', description: 'new desc' })

    expect(res.status).toBe(200)
    expect(res.body.name).toBe('New')
    expect(res.body.description).toBe('new desc')
  })

  it('returns 404 when updating a non-existent app', async () => {
    const res = await request(app)
      .put('/api/apps/no-such-id')
      .send({ name: 'X', description: '' })

    expect(res.status).toBe(404)
    expect(res.body.error).toBe('应用不存在')
  })

  it('returns 409 when renaming to an existing name', async () => {
    await request(app).post('/api/apps').send({ name: 'Taken' })
    const other = await request(app).post('/api/apps').send({ name: 'Other' })

    const res = await request(app)
      .put(`/api/apps/${other.body.id}`)
      .send({ name: 'Taken', description: '' })

    expect(res.status).toBe(409)
    expect(res.body.error).toBe('应用名称已存在')
  })
})

describe('DELETE /api/apps/:id', () => {
  it('deletes an existing app', async () => {
    const created = await request(app)
      .post('/api/apps')
      .send({ name: 'Del', description: '' })

    const res = await request(app).delete(`/api/apps/${created.body.id}`)

    expect(res.status).toBe(200)
    expect(res.body.deleted).toBe(true)

    const getRes = await request(app).get(`/api/apps/${created.body.id}`)
    expect(getRes.status).toBe(404)
  })

  it('returns 404 when deleting a non-existent app', async () => {
    const res = await request(app).delete('/api/apps/no-such-id')

    expect(res.status).toBe(404)
    expect(res.body.error).toBe('应用不存在')
  })
})
