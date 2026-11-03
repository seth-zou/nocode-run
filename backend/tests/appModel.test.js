const fs = require('fs')
const path = require('path')
const os = require('os')

// Use a unique temp database for each test process so we never touch the
// real development database file.
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nocode-test-'))
const dbPath = path.join(tempDir, 'test.db')
process.env.DB_PATH = dbPath

const { initDatabase, closeDatabase } = require('../src/database/init')
const App = require('../src/models/App')

beforeAll(async () => {
  await initDatabase()
})

afterAll(async () => {
  await closeDatabase()
  fs.rmSync(tempDir, { recursive: true, force: true })
})

afterEach(async () => {
  // Clear the apps table between tests so each test is independent.
  const { getDatabase } = require('../src/database/init')
  await new Promise((resolve, reject) => {
    getDatabase().run('DELETE FROM apps', (err) => {
      if (err) return reject(err)
      resolve()
    })
  })
})

describe('App model', () => {
  describe('create', () => {
    it('creates an app and returns it with an id and timestamps', async () => {
      const app = await App.create({ name: 'TestApp', description: 'desc' })

      expect(app.id).toBeDefined()
      expect(typeof app.id).toBe('string')
      expect(app.name).toBe('TestApp')
      expect(app.description).toBe('desc')
      expect(app.createdAt).toBeDefined()
      expect(app.updatedAt).toBeDefined()
    })

    it('defaults description to empty string when omitted', async () => {
      const app = await App.create({ name: 'NoDesc' })

      expect(app.description).toBe('')
    })

    it('rejects a duplicate name', async () => {
      await App.create({ name: 'Dup', description: 'first' })

      await expect(App.create({ name: 'Dup' })).rejects.toThrow(
        '应用名称已存在'
      )
    })
  })

  describe('findAll', () => {
    it('returns an empty array when no apps exist', async () => {
      const apps = await App.findAll()
      expect(apps).toEqual([])
    })

    it('returns all created apps', async () => {
      await App.create({ name: 'App1' })
      await App.create({ name: 'App2' })

      const apps = await App.findAll()
      expect(apps).toHaveLength(2)
      const names = apps.map((a) => a.name)
      expect(names).toContain('App1')
      expect(names).toContain('App2')
    })
  })

  describe('findById', () => {
    it('returns null for a non-existent id', async () => {
      const app = await App.findById('does-not-exist')
      expect(app).toBeNull()
    })

    it('returns the app for a valid id', async () => {
      const created = await App.create({ name: 'FindMe' })
      const found = await App.findById(created.id)

      expect(found).not.toBeNull()
      expect(found.id).toBe(created.id)
      expect(found.name).toBe('FindMe')
    })
  })

  describe('update', () => {
    it('updates name and description of an existing app', async () => {
      const created = await App.create({ name: 'Original', description: 'd1' })
      const updated = await App.update(created.id, {
        name: 'Updated',
        description: 'd2',
      })

      expect(updated.name).toBe('Updated')
      expect(updated.description).toBe('d2')
    })

    it('rejects updating to a name that already exists on another app', async () => {
      await App.create({ name: 'Taken' })
      const other = await App.create({ name: 'Other' })

      await expect(
        App.update(other.id, { name: 'Taken', description: '' })
      ).rejects.toThrow('应用名称已存在')
    })

    it('rejects updating a non-existent app', async () => {
      await expect(
        App.update('no-such-id', { name: 'X', description: '' })
      ).rejects.toThrow('应用不存在')
    })
  })

  describe('delete', () => {
    it('deletes an existing app', async () => {
      const created = await App.create({ name: 'DeleteMe' })
      const result = await App.delete(created.id)

      expect(result.deleted).toBe(true)
      expect(result.id).toBe(created.id)

      const found = await App.findById(created.id)
      expect(found).toBeNull()
    })

    it('rejects deleting a non-existent app', async () => {
      await expect(App.delete('no-such-id')).rejects.toThrow('应用不存在')
    })
  })

  describe('nameExists', () => {
    it('returns true when the name exists', async () => {
      await App.create({ name: 'Exists' })

      expect(await App.nameExists('Exists')).toBe(true)
    })

    it('returns false when the name does not exist', async () => {
      expect(await App.nameExists('Nope')).toBe(false)
    })

    it('returns false for an excluded id even when the name exists', async () => {
      const created = await App.create({ name: 'Shared' })

      expect(await App.nameExists('Shared', created.id)).toBe(false)
    })

    it('returns true when a different app owns the name', async () => {
      const owner = await App.create({ name: 'Shared' })
      const other = await App.create({ name: 'Other' })

      expect(await App.nameExists('Shared', other.id)).toBe(true)
      // sanity: excluding the owner itself returns false
      expect(await App.nameExists('Shared', owner.id)).toBe(false)
    })
  })
})
