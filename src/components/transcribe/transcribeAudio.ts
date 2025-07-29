export async function transcribeAudio(
  file: File,
  languageCode: string
): Promise<string> {
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;

  function toBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(",")[1]);
      reader.onerror = (err) => reject(err);
    });
  }

  const base64Audio = await toBase64(file);

  const body = {
    config: {
      languageCode,
    },
    audio: {
      content: base64Audio,
    },
  };

  const response = await fetch(
    `https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  const result = await response.json();

  if (result.results && result.results.length > 0) {
    return result.results
      .map((r: any) => r.alternatives[0].transcript)
      .join("\n");
  } else {
    throw new Error(result.error?.message || "No transcript found.");
  }
}
