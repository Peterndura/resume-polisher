export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { bullet } = req.body;

  if (!bullet) {
    return res.status(400).json({ error: 'Bullet point is required.' });
  }

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Missing GROQ_API_KEY in environment variables.' });
  }

  // Candidate models to attempt in sequence
  const models = [
    'llama-3.3-70b-versatile',
    'llama3-8b-8192',
    'llama-3.1-8b-instant',
    'mixtral-8x7b-32768'
  ];

  let lastError = null;

  for (const model of models) {
    try {
      const response = await fetch(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: model,
            messages: [
              {
                role: 'system',
                content: 'You are an expert resume writer. Rewrite the provided resume bullet point into 3 strong, high-impact alternatives using strong action verbs and professional tone.'
              },
              {
                role: 'user',
                content: bullet
              }
            ]
          })
        }
      );

      const data = await response.json();

      if (response.ok && data.choices?.[0]?.message?.content) {
        return res.status(200).json({ result: data.choices[0].message.content });
      }

      lastError = data.error?.message || `Groq error on model ${model}`;
    } catch (err) {
      lastError = err.message;
    }
  }

  return res.status(500).json({ error: lastError || 'Failed to generate output from AI models.' });
}
