import { supabase } from '../../config/supabase';

const DEFAULT_VOICE_ID = "JBFqnCBsd6RMkjVDRZzb";

export interface TTSOptions {
  text: string;
  stability?: number;
  similarity_boost?: number;
}

export async function textToSpeech({ text, stability = 0.5, similarity_boost = 0.9 }: TTSOptions): Promise<Blob> {
  if (!text || text.trim() === '') {
    throw new Error("Missing 'text' parameter");
  }

  // Get current user session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session?.user) {
    throw new Error("User not authenticated");
  }

  const user = session.user;
  const elevenLabsApiKey = (import.meta as any).env.VITE_ELEVENLABS_API_KEY;
  
  if (!elevenLabsApiKey) {
    throw new Error("ElevenLabs API key not configured");
  }

  try {
    // Look up custom voice ID if available
    let voiceId = DEFAULT_VOICE_ID;
    
    try {
      const { data: voiceData, error: voiceError } = await supabase
        .from('voice_ids')
        .select('voice_id')
        .eq('user_id', user.id)
        .single();
      
      if (!voiceError && voiceData?.voice_id) {
        voiceId = voiceData.voice_id;
        console.log('Using custom voice ID:', voiceId);
      } else {
        console.log('Using default voice ID:', voiceId);
      }
    } catch (voiceLookupError) {
      console.warn('Voice ID lookup failed, using default:', voiceLookupError);
    }

    // Call ElevenLabs TTS API
    const elevenResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': elevenLabsApiKey,
        'Accept': 'audio/mpeg'
      },
      body: JSON.stringify({
        text: text.trim(),
        model_id: 'eleven_flash_v2_5',
        voice_settings: {
          stability,
          similarity_boost
        }
      })
    });

    if (!elevenResponse.ok) {
      const errorText = await elevenResponse.text();
      console.error('ElevenLabs API error:', errorText);
      throw new Error(`TTS failed: ${errorText}`);
    }

    // Get the audio as array buffer and convert to blob
    const audioBuffer = await elevenResponse.arrayBuffer();
    const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
    
    return audioBlob;
    
  } catch (error) {
    console.error('Text-to-speech error:', error);
    throw error;
  }
}

export async function playTTSAudio(audioBlob: Blob): Promise<void> {
  try {
    // Create URL from the audio blob
    const audioUrl = URL.createObjectURL(audioBlob);
    
    const audio = new Audio(audioUrl);
    
    return new Promise((resolve, reject) => {
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        resolve();
      };
      
      audio.onerror = (error) => {
        URL.revokeObjectURL(audioUrl);
        reject(error);
      };
      
      audio.play().catch(reject);
    });
    
  } catch (error) {
    console.error('Error playing TTS audio:', error);
    throw error;
  }
} 