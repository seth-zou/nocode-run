// Unit tests for the App model (backend/src/models/App.js)
require('./setup')

const App = require('../src/models/App')
const { getDatabase } = require('../src/database/init')

describe('App model', () => {
  describe('create', () => {
    it('creates a new app and persists it to the database', async () => {
      const app = await App.create({ name: 'My App', description: 'A test app' })

      expect(app).toBeDefined()
      expect(app.id).toEqual(expect.any(String))
      expect(app.name).toBe('My App')
      expect(app.description).toBe('A test app')
      expect(app.createdAt).toBeDefined()
      expect(app.updatedAt).toBeDefined()

      // Verify it was actually written to the database.
      const row = await new Promise((resolve, reject) => {
        getDatabase().get('SELECT * FROM apps WHERE id = ?', [app.id], (err, r) => {
          if (err) return reject(err)
          resolve(r)
        })
      })
      expect(row).not.toBeNull()
      expect(row.name).toBe('My App')
      expect(row.description).toBe('A test app')
    })

    it('defaults description to an empty string when not provided', async () => {
      const app = await App.create({ name: 'NoDesc' })
      expect(app.description).toBe('')
    })

    it('rejects a duplicate name with a meaningful error', async () => {
      await App.create({ name: 'Duplicate', description: 'first' })
      await expect(App.create({ name: 'Duplicate', description: 'second' }))
        .rejects.toThrow('应用名称已存在')
    })
  })

  describe('findAll', () => {
    it('returns apps ordered by created_at descending', async () => {
      await App.create({ name: 'Alpha' })
      // Small delay so created_at timestamps differ reliably.
      await new Promise((r) => setTimeout(r, 10))
      await App.create({ name: 'Beta' })

      const apps = await App.findAll()
      expect(apps).toHaveLength(2)
      expect(apps[0].name).toBe('Beta')
      expect(apps[1].name).toBe('Alpha')
    })

    it('returns an empty array when no apps exist', async () => {
      const apps = await App.findAll()
      expect(apps).toEqual([])
    })
  })

  describe('findById', () => {
    it('returns the app when it exists', async () => {
      const created = await App.create({ name: 'FindMe', description: 'desc' })
      const found = await App.findById(created.id)
      expect(found).not.toBeNull()
      expect(found.name).toBe('FindMe')
      expect(found.description).toBe('desc')
    })

    it('returns null when the app does not exist', async () => {
      const found = await App.findById('nonexistent-id')
      expect(found).toBeNull()
    })
  })

  describe('update', () => {
    it('updates name and description and returns the updated app', async () => {
      const created = await App.create({ name: 'Original', description: 'orig' })
      const updated = await App.update(created.id, { name: 'Updated', description: 'new desc' })
      expect(updated.name).toBe('Updated')
      expect(updated.description).toBe('new desc')
      expect(updated.id).toBe(created.id)
    })

    it('rejects updating to a name that another app already uses', async () => {
      await App.create({ name: 'Taken' })
      const app = await App.create({ name: 'Free' })
      await expect(App.update(app.id, { name: 'Taken', description: '' }))
        .rejects.toThrow('应用名称已存在')
    })

    it('allows an app to keep its own name on update', async () => {
      const app = await App.create({ name: 'KeepName', description: 'd' })
      const updated = await App.update(app.id, { name: 'KeepName', description: 'changed' })
      expect(updated.description).toBe('changed')
    })

    it('rejects updating a nonexistent app', async () => {
      await expect(App.update('does-not-exist', { name: 'X', description: '' }))
        .rejects.toThrow('应用不存在')
    })
  })

  describe('delete', () => {
    it('deletes an existing app and reports it as deleted', async () => {
      const app = await App.create({ name: 'DeleteMe' })
      const result = await App.delete(app.id)
      expect(result).toEqual({ deleted: true, id: app.id })
      const found = await App.findById(app.id)
      expect(found).toBeNull()
    })

    it('rejects deleting a nonexistent app', async () => {
      await expect(App.delete('no-such-id')).rejects.toThrow('应用不存在')
    })
  })

  describe('nameExists', () => {
    it('returns true when the name is in use', async () => {
      await App.create({ name: 'ExistingName' })
      expect(await App.nameExists('ExistingName')).toBe(true)
    })

    it('returns false when the name is not in use', async () => {
      expect(await App.nameExists('NothingHere')).toBe(false)
    })

    it('returns false for an existing name when excluded by id', async () => {
      const app = await App.create({ name: 'OwnName' })
      expect(await App.nameExists('OwnName', app.id)).toBe(false)
    })
  })
})
