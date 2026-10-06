export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { bullet } = req.body;

  if (!bullet) {
    return res.status(400).json({ error: 'Bullet point is required.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const models = ['gemini-2.5-flash', 'gemini-2.5-pro'];
  const promptText = `You are an expert resume writer. Rewrite the following resume bullet point into 3 strong, high-impact alternatives using strong action verbs and professional tone:\n\n"${bullet}"`;

  for (const model of models) {
    for (let attempt = 0; attempt < 2; attempt++) {
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

        // Wait 1 second before retrying if rate limited
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (err) {
        console.error(`Error with model ${model}:`, err);
      }
    }
  }

  return res.status(503).json({ error: 'AI service is busy right now. Please try tapping Polish again in a few seconds.' });
}
