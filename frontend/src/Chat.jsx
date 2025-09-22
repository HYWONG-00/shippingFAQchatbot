import React, { useState, useEffect } from 'react';

function Chat() {
  const [messages, setMessages] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMessages([
      {
        text: 'Hi, I am shipping faq assistant. You can ask me shipping return policy, order tracking, shipping options, and more. How can I help you?',
        isBot: true,
      },
    ]);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setMessages([...messages, { isBot: false, text: prompt }]);
    setPrompt('');
    setIsLoading(true);
    
    let api = import.meta.env.VITE_API_URL;
    try {
      const response = await fetch(`${api}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (response.ok) {
        const { bot } = await response.json();
        setMessages((prev) => [...prev, { isBot: true, text: bot }]);
      } else {
        throw new Error(await response.text());
      }
    } catch (err) {
      setMessages((prev) => [...prev, { isBot: true, text: 'Something went wrong' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.isBot ? 'bot' : 'user'}`}>
            {msg.isBot ? 'Bot: ' : 'You: '}
            {msg.text}
          </div>
        ))}
        {isLoading && <div className="message bot">Typing...</div>}
      </div>
      <form onSubmit={handleSubmit} className="chat-form">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your prompt"
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>Send</button>
      </form>
    </div>
  );
}

export default Chat;