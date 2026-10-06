export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { bullet } = req.body;

  if (!bullet) {
    return res.status(400).json({ error: 'Bullet point is required.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  
  // List of models to attempt in order if high demand occurs
  const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash'];

  const promptText = `You are an expert resume writer. Rewrite the following resume bullet point into 3 strong, high-impact alternatives using strong action verbs and professional tone:\n\n"${bullet}"`;

  for (const model of models) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }]
          })
        }
      );

      const data = await response.json();

      if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
        const resultText = data.candidates[0].content.parts[0].text;
        return res.status(200).json({ result: resultText });
      }

      // If model returns high demand or rate limit, log and try next model
      console.warn(`Model ${model} failed with status ${response.status}: ${data.error?.message}`);
    } catch (err) {
      console.error(`Error requesting model ${model}:`, err);
    }
  }

  return res.status(503).json({ error: 'AI service is temporarily busy. Please try again in a few seconds.' });
}
