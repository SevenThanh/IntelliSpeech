export async function transcribeAudio(file: File): Promise<string> {
  const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;

  const formData = new FormData();
  formData.append("model_id", "scribe_v1");
  formData.append("file", file, file.name);
  formData.append("tag_audio_events", "false");

  const response = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
    },
    body: formData,
  });

  const result = await response.json();

  if (response.ok && result.text) {
    return result.text;
  } else {
    throw new Error(result.error?.message || "No transcript found.");
  }
}
