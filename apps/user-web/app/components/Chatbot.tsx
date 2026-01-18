'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { io, Socket } from 'socket.io-client';

interface Message {
  role: 'user' | 'bot';
  content: string;
  timestamp: string;
}

export function Chatbot() {
  const t = useTranslations('Chatbot');
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAgentForm, setShowAgentForm] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [isConnectedToAgent, setIsConnectedToAgent] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Cleanup socket on component unmount
  useEffect(() => {
    return () => {
      if (socket) {
        console.log('Disconnecting socket on unmount');
        socket.disconnect();
      }
    };
  }, [socket]);

  // Load chat history from localStorage (separate per locale)
  useEffect(() => {
    const savedMessages = localStorage.getItem(`chatbot_history_${locale}`);
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        // Ensure all content is string type
        setMessages(parsed.map((m: Message) => ({
          ...m,
          content: String(m.content),
        })));
      } catch (e) {
        console.error('Failed to load chat history');
      }
    } else {
      // Initial welcome message in user's language
      setMessages([{
        role: 'bot',
        content: String(t('welcomeMessage')),
        timestamp: new Date().toISOString(),
      }]);
    }
  }, [locale, t]);

  // Save chat history to localStorage (separate per locale)
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`chatbot_history_${locale}`, JSON.stringify(messages));
    }
  }, [messages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: inputValue,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputValue;
    setInputValue('');

    // If connected to agent via WebSocket, send through socket ONLY
    if (socket && conversationId) {
      console.log('Sending message to agent via WebSocket');
      socket.emit('send-message', {
        conversationId: conversationId,
        message: currentMessage,
        senderType: 'guest',
      });
      return; // Don't send to AI when agent is connected
    }

    // Otherwise use regular chatbot API
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3000/v1/chatbot/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentMessage,
          locale: locale,
          conversationHistory: messages.map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            content: String(m.content),
          })),
        }),
      });

      const data = await response.json();

      const botMessage: Message = {
        role: 'bot',
        content: String(data.reply),
        timestamp: data.timestamp,
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);
      setMessages(prev => [...prev, {
        role: 'bot',
        content: String(t('apiErrorMessage')),
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearHistory = () => {
    localStorage.removeItem(`chatbot_history_${locale}`);
    setMessages([{
      role: 'bot',
      content: t('welcomeMessage'),
      timestamp: new Date().toISOString(),
    }]);
  };

  // Function to parse message content and convert URLs to clickable links
  const parseMessageWithLinks = (content: string) => {
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    const parts = content.split(urlPattern);
    
    return parts.map((part, index) => {
      if (part.match(urlPattern)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-600 hover:text-brand-700 underline break-all"
          >
            {part}
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const submitAgentRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const response = await fetch('http://localhost:3000/v1/chatbot/connect-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.get('name'),
          email: formData.get('email'),
          phone: formData.get('phone'),
          message: formData.get('message'),
          locale: locale,
        }),
      });

      const data = await response.json();
      
      if (data.success && data.conversationId) {
        setConversationId(data.conversationId);
        
        // Initialize WebSocket connection
        const newSocket = io('http://localhost:3000/agent-chat', {
          transports: ['websocket'],
        });

        newSocket.on('connect', () => {
          console.log('Connected to agent chat');
          newSocket.emit('join-conversation', {
            conversationId: data.conversationId,
            userType: 'guest',
          });
        });

        newSocket.on('new-message', (message: any) => {
          if (message.senderType === 'agent') {
            setMessages(prev => [...prev, {
              role: 'bot',
              content: message.message,
              timestamp: message.createdAt,
            }]);
          }
        });

        newSocket.on('agent-assigned', () => {
          console.log('Agent assigned to conversation');
          setIsConnectedToAgent(true);
          setMessages(prev => [...prev, {
            role: 'bot',
            content: t('agentJoined'),
            timestamp: new Date().toISOString(),
          }]);
        });

        setSocket(newSocket);
        setIsConnectedToAgent(true); // Mark as connected immediately when socket is created
      }
      
      setMessages(prev => [...prev, {
        role: 'bot',
        content: data.message,
        timestamp: new Date().toISOString(),
      }]);

      setShowAgentForm(false);
    } catch (error) {
      console.error('Agent request error:', error);
    }
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-brand-500 to-brand-600 rounded-full shadow-2xl hover:shadow-brand-500/50 hover:scale-110 transition-all duration-300 flex items-center justify-center z-[9999] group"
          aria-label={t('openChat')}
        >
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[380px] h-[650px] bg-white rounded-2xl shadow-2xl flex flex-col z-[9999] overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-500 to-brand-600 p-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                {/* <span className="text-2xl">🏠</span> */}
              </div>
              <div>
                <h3 className="font-bold">{t('title')}</h3>
                <p className="text-xs opacity-90">{t('subtitle')}</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 rounded-lg p-1 transition-colors"
              title={t('closeChat')}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-brand-600 text-white rounded-tr-none'
                      : 'bg-white text-gray-800 shadow-sm border border-gray-200 rounded-tl-none'
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap break-words">
                    {parseMessageWithLinks(String(message.content))}
                  </div>
                  <p className={`text-xs mt-1 ${message.role === 'user' ? 'text-brand-100' : 'text-gray-400'}`}>
                    {new Date(message.timestamp).toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm border border-gray-200">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Agent Form */}
          {showAgentForm && (
            <div className="border-t border-gray-200 bg-white max-h-[400px] overflow-y-auto">
              <div className="p-4">
                <form onSubmit={submitAgentRequest} className="space-y-3">
                  <h4 className="font-semibold text-sm text-gray-700 mb-2">{t('agentFormTitle')}</h4>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">{t('name')}</label>
                    <input
                      type="text"
                      name="name"
                      placeholder={t('name')}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">{t('email')}</label>
                    <input
                      type="email"
                      name="email"
                      placeholder={t('email')}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">{t('phone')}</label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder={t('phone')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">{t('message')}</label>
                    <textarea
                      name="message"
                      placeholder={t('message')}
                      rows={2}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 resize-none"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
                    >
                      {t('submit')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAgentForm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      {t('cancel')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex gap-2 mb-2">
              <button
                onClick={() => setShowAgentForm(!showAgentForm)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {t('talkToAgent')}
              </button>
              <button
                onClick={clearHistory}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-xs transition-colors"
                title={t('clearHistory')}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t('placeholder')}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !inputValue.trim()}
                className="bg-brand-600 text-white p-2 rounded-full hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={t('send')}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
