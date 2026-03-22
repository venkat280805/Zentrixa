"use client";

import React, { useState, useRef, useEffect } from 'react';
import styles from './Chatbot.module.css';
import { Send, Bot, User, Loader2, Maximize2, Minimize2, Trash2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Chatbot({ datasetId, active }: { datasetId: string, active?: boolean }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !datasetId) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: input, dataset_id: datasetId }),
      });

      const data = await response.json();
      if (data.status === 'success') {
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error processing your request.' }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Is the backend running?' }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    if (confirm('Clear chat history?')) {
      setMessages([]);
    }
  };

  return (
    <div className={`${styles.container} ${isExpanded ? styles.expanded : ''} fade-in`}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <Bot size={20} className={styles.botIcon} />
          <div>
            <div className={styles.title}>Zentrixa AI</div>
            <div className={styles.status}>Online & Ready</div>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.iconBtn} onClick={clearChat} title="Clear Chat">
            <Trash2 size={16} />
          </button>
          <button className={styles.iconBtn} onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      <div className={styles.chatWindow}>
        {messages.length === 0 ? (
          <div className={styles.emptyState}>
            <Bot size={48} className={styles.emptyIcon} />
            <p>Ask me questions about your data, e.g., &quot;What&apos;s the average value of [Column]?&quot;</p>
          </div>
        ) : (
          <div className={styles.messageList}>
            {messages.map((msg, idx) => (
              <div key={idx} className={`${styles.messageWrapper} ${msg.role === 'user' ? styles.userRow : styles.botRow}`}>
                <div className={styles.avatar}>
                  {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>
                <div className={styles.message}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className={styles.botRow}>
                <div className={styles.avatar}><Bot size={14} /></div>
                <div className={`${styles.message} ${styles.loading}`}>
                  <Loader2 size={16} className={styles.spin} />
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className={styles.inputArea}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder={datasetId ? "Type your question..." : "Upload a CSV first..."}
          disabled={!datasetId || loading}
          className={styles.input}
        />
        <button 
          onClick={handleSend} 
          disabled={!input.trim() || !datasetId || loading}
          className={styles.sendBtn}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
