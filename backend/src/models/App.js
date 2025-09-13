const { v4: uuidv4 } = require('uuid')
const { getDatabase } = require('../database/init')

class App {
  constructor(data) {
    this.id = data.id || uuidv4()
    this.name = data.name
    this.description = data.description || ''
    this.createdAt = data.created_at || new Date().toISOString()
    this.updatedAt = data.updated_at || new Date().toISOString()
  }

  // 创建应用
  static async create(data) {
    return new Promise((resolve, reject) => {
      const db = getDatabase()
      const app = new App(data)
      
      const sql = `
        INSERT INTO apps (id, name, description, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?)
      `
      
      db.run(sql, [
        app.id,
        app.name,
        app.description,
        app.createdAt,
        app.updatedAt
      ], function(err) {
        if (err) {
          if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return reject(new Error('应用名称已存在'))
          }
          return reject(err)
        }
        resolve(app)
      })
    })
  }

  // 获取所有应用
  static async findAll() {
    return new Promise((resolve, reject) => {
      const db = getDatabase()
      const sql = 'SELECT * FROM apps ORDER BY created_at DESC'
      
      db.all(sql, [], (err, rows) => {
        if (err) {
          return reject(err)
        }
        
        const apps = rows.map(row => ({
          id: row.id,
          name: row.name,
          description: row.description,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        }))
        
        resolve(apps)
      })
    })
  }

  // 根据ID获取应用
  static async findById(id) {
    return new Promise((resolve, reject) => {
      const db = getDatabase()
      const sql = 'SELECT * FROM apps WHERE id = ?'
      
      db.get(sql, [id], (err, row) => {
        if (err) {
          return reject(err)
        }
        
        if (!row) {
          return resolve(null)
        }
        
        const app = {
          id: row.id,
          name: row.name,
          description: row.description,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        }
        
        resolve(app)
      })
    })
  }

  // 更新应用
  static async update(id, data) {
    return new Promise((resolve, reject) => {
      const db = getDatabase()
      const updatedAt = new Date().toISOString()
      
      const sql = `
        UPDATE apps 
        SET name = ?, description = ?, updated_at = ?
        WHERE id = ?
      `
      
      db.run(sql, [
        data.name,
        data.description || '',
        updatedAt,
        id
      ], function(err) {
        if (err) {
          if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return reject(new Error('应用名称已存在'))
          }
          return reject(err)
        }
        
        if (this.changes === 0) {
          return reject(new Error('应用不存在'))
        }
        
        // 返回更新后的应用
        App.findById(id)
          .then(resolve)
          .catch(reject)
      })
    })
  }

  // 删除应用
  static async delete(id) {
    return new Promise((resolve, reject) => {
      const db = getDatabase()
      const sql = 'DELETE FROM apps WHERE id = ?'
      
      db.run(sql, [id], function(err) {
        if (err) {
          return reject(err)
        }
        
        if (this.changes === 0) {
          return reject(new Error('应用不存在'))
        }
        
        resolve({ deleted: true, id })
      })
    })
  }

  // 检查应用名称是否存在
  static async nameExists(name, excludeId = null) {
    return new Promise((resolve, reject) => {
      const db = getDatabase()
      let sql = 'SELECT COUNT(*) as count FROM apps WHERE name = ?'
      const params = [name]
      
      if (excludeId) {
        sql += ' AND id != ?'
        params.push(excludeId)
      }
      
      db.get(sql, params, (err, row) => {
        if (err) {
          return reject(err)
        }
        resolve(row.count > 0)
      })
    })
  }
}

module.exports = App