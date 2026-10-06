export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { bullet } = req.body;
  if (!bullet) {
    return res.status(400).json({ error: 'Please provide a bullet point.' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert executive resume writer. Rewrite the provided resume bullet point into 3 impactful, action-oriented variations with strong metric placeholders (e.g., increased revenue by X%). Output ONLY the 3 bullet options as a bulleted list.'
          },
          { role: 'user', content: bullet }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      return res.status(500).json({ error: data.error?.message || 'OpenAI API error' });
    }

    return res.status(200).json({ result: data.choices[0].message.content });
  } catch (err) {
    return res.status(500).json({ error: 'Server error processing request.' });
  }
}
