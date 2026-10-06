export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { bullet } = req.body;

  if (!bullet) {
    return res.status(400).json({ error: 'Bullet point is required.' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are an expert resume writer. Rewrite the following resume bullet point into 3 strong, high-impact alternatives using strong action verbs and professional tone:\n\n"${bullet}"`
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: data.error?.message || 'Gemini API Error' });
    }

    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return res.status(200).json({ result: resultText });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
