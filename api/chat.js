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
    
    // Frontend se model aayega. Agar nahi aaya toh default 'openrouter/free' chalega.
    const activeModel = model || 'openrouter/free'; 

    // 1. Frontend ke messages ko OpenRouter (OpenAI) format mein convert karna
    const formattedMessages = messages.map(msg => {
      let textContent = "";
      let visionContent = [];
      let hasImage = false;

      if (msg.parts) {
        msg.parts.forEach(part => {
          if (part.text) {
            textContent += part.text;
            visionContent.push({ type: "text", text: part.text });
          } else if (part.inlineData) {
            hasImage = true;
            // Image ko base64 format mein properly set karna
            const base64Url = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            visionContent.push({
              type: "image_url",
              image_url: { url: base64Url }
            });
          }
        });
      } else {
        textContent = msg.content || "";
      }

      return {
        role: msg.role === 'model' ? 'assistant' : msg.role,
        content: hasImage ? visionContent : textContent
      };
    });

    // 2. OpenRouter API ko request bhejna (Vercel ENV Variable use karke)
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        // Ye line Vercel se tumhari API key automatically utha legi
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`, 
        'HTTP-Referer': 'https://clearyaan.vercel.app', // Optional: Tumhari website ka link
        'X-Title': 'Clearyaan AI' // Optional: App ka naam
      },
      body: JSON.stringify({ 
        model: activeModel,
        messages: formattedMessages 
      })
    });
    
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "OpenRouter API error ya key invalid hai");
    }

    // 3. OpenRouter ke answer ko frontend ke liye set karna
    const replyText = data.choices[0].message.content;

    // Naye HTML code ke hisaab se clean format mein bhejna
    res.status(200).json({ reply: replyText });
    
  } catch (error) {
    console.error("Backend Error:", error);
    res.status(500).json({ error: { message: error.message || 'Server error' } });
  }
          }
      
