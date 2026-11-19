import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Unmount React trees created during each test so the DOM is clean for the next.
afterEach(() => {
  cleanup()
})
