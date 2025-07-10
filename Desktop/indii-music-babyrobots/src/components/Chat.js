import { useState } from 'react';
import styles from './Chat.module.css';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const handleSend = async () => {
    if (input.trim()) {
      const userMessage = { text: input, sender: 'user' };
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      setInput('');

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: input }),
        });

        if (response.ok) {
          const data = await response.json();
          const botMessage = { text: data.reply, sender: 'bot' };
          setMessages([...newMessages, botMessage]);
        } else {
          console.error('API call failed');
          const botMessage = { text: 'Error: Could not get a response.', sender: 'bot' };
          setMessages([...newMessages, botMessage]);
        }
      } catch (error) {
        console.error('Error sending message:', error);
        const botMessage = { text: 'Error: Could not connect to the server.', sender: 'bot' };
        setMessages([...newMessages, botMessage]);
      }
    }
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.messages}>
        {messages.map((msg, index) => (
          <div key={index} className={`${styles.message} ${styles[msg.sender]}`}>
            {msg.text}
          </div>
        ))}
      </div>
      <div className={styles.inputContainer}>
        <input
          type="text"
          className={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type your message..."
        />
        <button onClick={handleSend} className={styles.button}>Send</button>
      </div>
    </div>
  );
}
