const sqlite3 = require('sqlite3').verbose()
const path = require('path')
const fs = require('fs')

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../data/nocode.db')
const DATA_DIR = path.dirname(DB_PATH)

// 确保数据目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

let db = null

// 获取数据库连接
function getDatabase() {
  if (!db) {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error opening database:', err.message)
        throw err
      }
      console.log('📦 Connected to SQLite database')
    })
  }
  return db
}

// 初始化数据库表
function initDatabase() {
  return new Promise((resolve, reject) => {
    const database = getDatabase()
    
    // 创建应用表
    const createAppsTable = `
      CREATE TABLE IF NOT EXISTS apps (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `
    
    // 创建应用代码表
    const createAppCodeTable = `
      CREATE TABLE IF NOT EXISTS app_code (
        id TEXT PRIMARY KEY,
        app_id TEXT NOT NULL,
        requirement TEXT,
        generated_code TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (app_id) REFERENCES apps (id) ON DELETE CASCADE
      )
    `
    
    database.serialize(() => {
      database.run(createAppsTable, (err) => {
        if (err) {
          console.error('Error creating apps table:', err)
          return reject(err)
        }
        console.log('✅ Apps table created/verified')
      })
      
      database.run(createAppCodeTable, (err) => {
        if (err) {
          console.error('Error creating app_code table:', err)
          return reject(err)
        }
        console.log('✅ App code table created/verified')
        resolve()
      })
    })
  })
}

// 关闭数据库连接
function closeDatabase() {
  return new Promise((resolve) => {
    if (db) {
      db.close((err) => {
        if (err) {
          console.error('Error closing database:', err.message)
        } else {
          console.log('📦 Database connection closed')
        }
        db = null
        resolve()
      })
    } else {
      resolve()
    }
  })
}

module.exports = {
  getDatabase,
  initDatabase,
  closeDatabase
}