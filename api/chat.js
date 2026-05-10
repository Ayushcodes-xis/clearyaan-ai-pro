window.sendMsg = async () => {

  const input = document.getElementById('userInput');
  const text = input.value.trim();

  if (!text) return;

  // User Message Render
  renderMessage('user', text);

  chats[currentChatId].messages.push({
    role: "user",
    content: text
  });

  syncToCloud();

  input.value = '';

  // Typing Animation
  const botUI = renderMessage('bot', '', true);

  try {

    // Gemini Format
    const messages = chats[currentChatId].messages.map(msg => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [
        {
          text: msg.content
        }
      ]
    }));

    // SECURE API CALL
    const response = await fetch('/api/chat', {

      method: 'POST',

      headers: {
        'Content-Type': 'application/json'
      },

      body: JSON.stringify({
        messages: messages
      })

    });

    const data = await response.json();

    // Error Handling
    if (data.error) {

      botUI.bubble.innerHTML =
        "❌ " + data.error;

      return;
    }

    // Gemini Reply
    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text
      || "No response received.";

    // Streaming Effect
    await streamTextEffect(
      botUI.bubble,
      reply,
      botUI.contentDiv
    );

    // Save Chat
    chats[currentChatId].messages.push({
      role: "assistant",
      content: reply
    });

    syncToCloud();

  } catch (error) {

    console.error(error);

    botUI.bubble.innerHTML =
      "❌ Failed to connect to AI server.";

  }
};
