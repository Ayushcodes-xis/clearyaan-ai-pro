module.exports = async function handler(req, res) {
  // CORS Headers: Taaki Vercel aur tumhare frontend ke beech connection block na ho
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Pre-flight request ko handle karna
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Sirf POST request allow karna
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, model } = req.body;
    
    // Yahan frontend se select kiya hua model automatically set ho jayega.
    // Agar koi dikkat aati hai, toh default 'gemini-2.0-flash' chalega.
    const activeModel = model || 'gemini-2.0-flash'; 

    // Gemini API ko request bhejna
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: messages })
      }
    );
    
    const data = await response.json();
    
    // AI ka response frontend ko wapas bhejna
    res.status(200).json(data);
    
  } catch (error) {
    console.error("Backend Error:", error);
    res.status(500).json({ error: 'Server error' });
  }
}
