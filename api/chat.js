module.exports = async function handler(req, res) {
  // CORS Headers set kar rahe hain taaki browser connection block na kare
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Pre-flight request ko allow karna
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Sirf POST request allow karna
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, model } = req.body;
    
    // YAHAN SARE MODELS HANDLE HOTE HAIN: 
    // Agar user ne dropdown se model select kiya hai, toh wo aayega, warna default 'gemini-2.0-flash' chalega
    const activeModel = model || 'gemini-2.0-flash'; 

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: messages })
      }
    );
    
    const data = await response.json();
    res.status(200).json(data);
    
  } catch (error) {
    console.error("Backend Error:", error);
    res.status(500).json({ error: 'Server error' });
  }
}
