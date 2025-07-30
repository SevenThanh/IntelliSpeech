import { describe, it, expect, vi, beforeEach } from 'vitest'
import { textToSpeech, playTTSAudio } from './textToSpeech'
import { supabase } from '../../config/supabase'

vi.mock('../../config/supabase')

describe('Text-to-Speech Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock environment variable
    Object.defineProperty(window, 'import', {
      value: {
        meta: {
          env: {
            VITE_ELEVENLABS_API_KEY: 'test-eleven-labs-key'
          }
        }
      }
    })
  })

  describe('textToSpeech', () => {
    it('should successfully generate TTS audio with default voice', async () => {
      // Mock Supabase auth session
      supabase.auth.getSession.mockResolvedValue({
        data: { 
          session: { 
            user: { id: 'user-123', email: 'test@example.com' } 
          } 
        },
        error: null
      })

      // Mock voice ID lookup (no custom voice found)
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116' } // No rows returned
            })
          })
        })
      })

      // Mock ElevenLabs API response
      const mockArrayBuffer = new ArrayBuffer(100)
      const mockResponse = {
        ok: true,
        arrayBuffer: vi.fn().mockResolvedValue(mockArrayBuffer)
      }
      global.fetch = vi.fn().mockResolvedValue(mockResponse)

      const result = await textToSpeech({ text: 'Hello world' })
      
      expect(result).toBeDefined()
      expect(result).toBeInstanceOf(Blob) // audio blob
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('https://api.elevenlabs.io/v1/text-to-speech/JBFqnCBsd6RMkjVDRZzb'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'xi-api-key': 'test-eleven-labs-key'
          }),
          body: expect.stringContaining('"text":"Hello world"')
        })
      )
    })

    it('should use custom voice ID when available', async () => {
      const customVoiceId = 'custom-voice-123'
      
      // Mock Supabase auth session
      supabase.auth.getSession.mockResolvedValue({
        data: { 
          session: { 
            user: { id: 'user-123', email: 'test@example.com' } 
          } 
        },
        error: null
      })

      // Mock voice ID lookup with custom voice
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { voice_id: customVoiceId },
              error: null
            })
          })
        })
      })

      // Mock ElevenLabs API response
      const mockArrayBuffer = new ArrayBuffer(100)
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        arrayBuffer: vi.fn().mockResolvedValue(mockArrayBuffer)
      })

      await textToSpeech({ text: 'Hello world' })
      
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`https://api.elevenlabs.io/v1/text-to-speech/${customVoiceId}`),
        expect.any(Object)
      )
    })

    it('should throw error when user is not authenticated', async () => {
      supabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null
      })

      await expect(textToSpeech({ text: 'Hello world' })).rejects.toThrow('User not authenticated')
    })

    it('should throw error when text is empty', async () => {
      await expect(textToSpeech({ text: '' })).rejects.toThrow("Missing 'text' parameter")
      await expect(textToSpeech({ text: '   ' })).rejects.toThrow("Missing 'text' parameter")
    })

    it('should throw error when ElevenLabs API key is missing', async () => {
      // Mock missing API key
      Object.defineProperty(window, 'import', {
        value: { meta: { env: {} } }
      })

      supabase.auth.getSession.mockResolvedValue({
        data: { 
          session: { 
            user: { id: 'user-123', email: 'test@example.com' } 
          } 
        },
        error: null
      })

      await expect(textToSpeech({ text: 'Hello world' })).rejects.toThrow('ElevenLabs API key not configured')
    })

    it('should handle ElevenLabs API errors', async () => {
      supabase.auth.getSession.mockResolvedValue({
        data: { 
          session: { 
            user: { id: 'user-123', email: 'test@example.com' } 
          } 
        },
        error: null
      })

      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: null })
          })
        })
      })

      // Mock failed API response
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        text: vi.fn().mockResolvedValue('API quota exceeded')
      })

      await expect(textToSpeech({ text: 'Hello world' })).rejects.toThrow('TTS failed: API quota exceeded')
    })
  })

  describe('playTTSAudio', () => {
    let mockAudio

    beforeEach(() => {
      // Mock Audio constructor and methods
      mockAudio = {
        play: vi.fn().mockResolvedValue(undefined),
        onended: null,
        onerror: null
      }
      
      global.Audio = vi.fn().mockReturnValue(mockAudio)
      global.URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url')
      global.URL.revokeObjectURL = vi.fn()
      global.Blob = vi.fn().mockImplementation(() => ({}))
    })

    it('should successfully play TTS audio', async () => {
      const audioBlob = new Blob(['audio data'], { type: 'audio/mpeg' })
      
      // Simulate successful audio playback
      setTimeout(() => {
        if (mockAudio.onended) mockAudio.onended()
      }, 10)

      await playTTSAudio(audioBlob)
      
      expect(global.Audio).toHaveBeenCalled()
      expect(mockAudio.play).toHaveBeenCalled()
      expect(global.URL.createObjectURL).toHaveBeenCalled()
      expect(global.URL.revokeObjectURL).toHaveBeenCalled()
    })

    it('should handle audio playback errors', async () => {
      const audioBlob = new Blob(['audio data'], { type: 'audio/mpeg' })
      
      // Simulate audio error
      setTimeout(() => {
        if (mockAudio.onerror) mockAudio.onerror(new Error('Audio playback failed'))
      }, 10)

      await expect(playTTSAudio(audioBlob)).rejects.toThrow()
      expect(global.URL.revokeObjectURL).toHaveBeenCalled()
    })

    it('should handle invalid blob data', async () => {
      global.URL.createObjectURL = vi.fn().mockImplementation(() => {
        throw new Error('Invalid blob')
      })

      const audioBlob = new Blob(['invalid data'], { type: 'audio/mpeg' })
      await expect(playTTSAudio(audioBlob)).rejects.toThrow('Error playing TTS audio')
    })
  })
}) 