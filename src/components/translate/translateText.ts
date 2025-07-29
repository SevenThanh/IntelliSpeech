export async function translateText(
  text: string,
  targetLanguage: string
): Promise<string> {
  const apiKey = (import.meta as any).env.VITE_GOOGLE_API_KEY;

  const response = await fetch(
    `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        // source: "en", we could make lang a parameter so it tells google exactly what lang, but it does auto-detect
        q: text,
        target: targetLanguage,
        format: "text",
      }),
    }
  );

  const result = await response.json();

  if (result.data?.translations?.length > 0) {
    return result.data.translations[0].translatedText;
  } else {
    throw new Error(result.error?.message || "Translation failed.");
  }
}
