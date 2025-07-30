import { describe, it, expect, vi, beforeEach } from 'vitest'
import { transcribeAudio } from './transcribeAudio'

describe('transcribeAudio', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should successfully transcribe audio file', async () => {
    const mockFile = new File(['audio data'], 'test.mp3', { type: 'audio/mp3' })
    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({
        text: 'Hello, this is a test transcription'
      })
    }
    
    global.fetch = vi.fn().mockResolvedValue(mockResponse)

    const result = await transcribeAudio(mockFile)
    
    expect(result).toBe('Hello, this is a test transcription')
    expect(fetch).toHaveBeenCalledWith(
      'https://api.elevenlabs.io/v1/speech-to-text',
      expect.objectContaining({
        method: 'POST',
        headers: { 'xi-api-key': 'test-elevenlabs-api-key' }
      })
    )
  })

  it('should throw error when transcription fails', async () => {
    const mockFile = new File(['audio data'], 'test.mp3', { type: 'audio/mp3' })
    const mockResponse = {
      ok: false,
      json: vi.fn().mockResolvedValue({
        error: { message: 'Transcription failed' }
      })
    }
    
    global.fetch = vi.fn().mockResolvedValue(mockResponse)

    await expect(transcribeAudio(mockFile)).rejects.toThrow('Transcription failed')
  })
}) 