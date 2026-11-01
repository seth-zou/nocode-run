const sqlite3 = require('sqlite3').verbose()
const path = require('path')

// Use an in-memory database for tests by overriding the DB_PATH before
// requiring any application code. The in-memory DB persists for the life of
// the single shared connection managed by database/init.js.
process.env.DB_PATH = ':memory:'

// Load the application modules after env is configured so they pick up the
// test database path.
const { initDatabase, closeDatabase, getDatabase } = require('../src/database/init')

// Reset the module-level singleton connection between test files so each file
// starts with a fresh in-memory database.
beforeAll(async () => {
  await initDatabase()
})

afterEach(async () => {
  // Clear the apps table after each test so tests are isolated.
  await new Promise((resolve, reject) => {
    getDatabase().run('DELETE FROM apps', (err) => {
      if (err) return reject(err)
      resolve()
    })
  })
})

afterAll(async () => {
  await closeDatabase()
})
