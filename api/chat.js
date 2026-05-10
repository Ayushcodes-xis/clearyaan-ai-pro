module.exports = async function handler(req, res) {

  res.setHeader(
    'Access-Control-Allow-Origin',
    'https://clearyaan-ai-pro.vercel.app'
  );

  res.setHeader(
    'Access-Control-Allow-Methods',
    'POST'
  );

  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type'
  );

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed'
    });
  }

  try {

    const { messages } = req.body;

    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
      return res.status(500).json({
        error: 'Missing API key'
      });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: messages
        })
      }
    );

    const data = await response.json();

    return res.status(200).json(data);

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      error: 'Internal server error'
    });

  }

        }
