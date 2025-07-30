import { describe, it, expect, vi, beforeEach } from 'vitest'
import { translateText } from './translateText'

describe('translateText', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should successfully translate text', async () => {
    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({
        data: {
          translations: [
            { translatedText: 'Bonjour le monde' }
          ]
        }
      })
    }
    
    global.fetch = vi.fn().mockResolvedValue(mockResponse)

    const result = await translateText('Hello world', 'fr')
    
    expect(result).toBe('Bonjour le monde')
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('https://translation.googleapis.com'),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('"q":"Hello world"')
      })
    )
  })

  it('should throw error when translation fails', async () => {
    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({
        error: { message: 'Translation failed' }
      })
    }
    
    global.fetch = vi.fn().mockResolvedValue(mockResponse)

    await expect(translateText('Hello', 'fr')).rejects.toThrow('Translation failed')
  })
}) 