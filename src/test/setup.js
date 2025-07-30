import '@testing-library/jest-dom'

// Mock environment variables
Object.defineProperty(window, 'import', {
  value: {
    meta: {
      env: {
        VITE_GOOGLE_API_KEY: 'test-google-api-key',
        VITE_ELEVENLABS_API_KEY: 'test-elevenlabs-api-key'
      }
    }
  }
})

// Mock fetch globally
global.fetch = vi.fn() 