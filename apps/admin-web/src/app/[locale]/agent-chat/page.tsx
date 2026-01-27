'use client';

import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { Badge } from 'primereact/badge';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { ScrollPanel } from 'primereact/scrollpanel';
import { Divider } from 'primereact/divider';
import { Avatar } from 'primereact/avatar';
import { apiClient } from '@/lib/api-client';

interface Message {
  id: number;
  message: string;
  senderType: 'guest' | 'user' | 'agent' | 'system';
  createdAt: string;
  sender?: {
    name: string;
  };
}

interface Conversation {
  id: number;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  status: 'waiting' | 'active' | 'resolved' | 'closed';
  unreadCount: number;
  createdAt: string;
  messages: Message[];
  agent?: {
    name: string;
  };
}

export default function AgentChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [loading, setLoading] = useState(true);
  const toast = useRef<Toast>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize Socket.io connection
    const newSocket = io('http://localhost:3000/agent-chat', {
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket');
    });

    newSocket.on('new-conversation-request', (data: { conversationId: number }) => {
      console.log('New conversation request:', data);
      loadConversations();
    });

    newSocket.on('new-message', (message: Message) => {
      console.log('New message:', message);
      setSelectedConversation(prev => {
        if (prev && prev.messages) {
          return {
            ...prev,
            messages: [...prev.messages, message],
          };
        }
        return prev;
      });
    });

    // Listen for conversation status updates
    newSocket.on('conversation-status-updated', (data: { 
      conversationId: number; 
      status: string; 
      agentId?: number 
    }) => {
      console.log('Conversation status updated:', data);
      
      // Update in conversations list
      setConversations(prev => prev.map(conv => 
        conv.id === data.conversationId 
          ? { ...conv, status: data.status as any, agent: data.agentId ? conv.agent : undefined }
          : conv
      ));
      
      // Update selected conversation if it's the same one
      setSelectedConversation(prev => {
        if (prev && prev.id === data.conversationId) {
          return { ...prev, status: data.status as any };
        }
        return prev;
      });
    });

    setSocket(newSocket);

    // Load initial conversations
    loadConversations();

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const loadConversations = async () => {
    try {
      const data = await apiClient.get<Conversation[]>('/agent-chat/conversations');

      console.log('Loaded conversations:', data);
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        console.log('Conversations data:', data.map(c => ({ 
          id: c.id, 
          name: c.guestName, 
          status: c.status,
          agentId: c.agent?.name,
          unreadCount: c.unreadCount
        })));
        setConversations(data);
      } else {
        console.error('Conversations data is not an array:', data);
        setConversations([]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading conversations:', error);
      setConversations([]);
      setLoading(false);
    }
  };

  const selectConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation);

    if (socket) {
      socket.emit('join-conversation', {
        conversationId: conversation.id,
        userType: 'agent',
      });
    }

    // Mark as read
    await apiClient.patch(`/agent-chat/conversations/${conversation.id}/read`, {
      senderType: 'guest'
    });

    // Reload conversation details
    const fullConversation = await apiClient.get<Conversation>(
      `/agent-chat/conversations/${conversation.id}`
    );
    setSelectedConversation(fullConversation);
  };

  const sendMessage = () => {
    if (!messageInput.trim() || !selectedConversation || !socket) return;

    const agentId = 1; // TODO: Get from auth context

    socket.emit('send-message', {
      conversationId: selectedConversation.id,
      message: messageInput,
      senderId: agentId,
      senderType: 'agent',
    });

    setMessageInput('');
  };

  const assignToMe = async () => {
    if (!selectedConversation) return;

    const agentId = 1; // TODO: Get from auth context

    const updatedConversation = await apiClient.post<Conversation>(
      `/agent-chat/conversations/${selectedConversation.id}/assign`,
      { agentId }
    );

    setSelectedConversation(updatedConversation);
    loadConversations();
  };

  const closeConversation = async () => {
    if (!selectedConversation) return;

    await apiClient.patch(`/agent-chat/conversations/${selectedConversation.id}/close`);

    toast.current?.show({
      severity: 'success',
      summary: 'Success',
      detail: 'Conversation closed',
      life: 3000,
    });

    loadConversations();
    setSelectedConversation(null);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation?.messages]);

  const getStatusSeverity = (status: string) => {
    switch (status) {
      case 'waiting':
        return 'warning';
      case 'active':
        return 'success';
      case 'resolved':
        return 'info';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="flex align-items-center justify-content-center" style={{ minHeight: '70vh' }}>
        <i className="pi pi-spin pi-spinner text-4xl text-primary"></i>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', overflow: 'hidden' }}>
      <Toast ref={toast} />
      <div style={{ display: 'flex', height: '100%' }}>
        {/* Conversations List - Left Column */}
        <div style={{ width: '33%', display: 'flex', flexDirection: 'column' }}>
          <Card 
            title="Agent Chat" 
            subTitle={`${conversations.length} conversations`}
            style={{ display: 'flex', flexDirection: 'column', padding: '0.75rem' }}
          >
              <ScrollPanel style={{ width: '100%', maxHeight: '70vh' }}>
                {conversations.length === 0 ? (
                  <div className="text-center p-4">
                    <i className="pi pi-comments text-6xl text-400 mb-3"></i>
                    <p className="text-600 mb-2">No conversations yet</p>
                    <p className="text-sm text-500">Conversations will appear here when users request agent chat</p>
                  </div>
                ) : (
                  <div className="flex flex-column gap-2">
                    {conversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={`p-3 border-1 border-round cursor-pointer transition-all transition-duration-200 ${
                          selectedConversation?.id === conversation.id 
                            ? 'bg-blue-50 border-blue-500 shadow-2' 
                            : 'surface-card border-gray-300 hover:border-blue-400 hover:shadow-1'
                        }`}
                        onClick={() => selectConversation(conversation)}
                      >
                        <div className="flex justify-content-between align-items-start">
                          <div className="flex-1">
                            <div className="flex align-items-center gap-2 mb-2">
                              <Avatar 
                                icon="pi pi-user" 
                                size="large" 
                                shape="circle"
                                className={conversation.status === 'active' ? 'bg-green-600' : 'bg-orange-500'}
                              />
                              <div className="flex-1">
                                <p className="font-bold m-0 text-900 text-base">{conversation.guestName}</p>
                                <p className="text-sm text-700 m-0">{conversation.guestEmail}</p>
                              </div>
                            </div>
                            <div className="flex align-items-center gap-2 mt-2">
                              <Tag 
                                value={conversation.status.toUpperCase()} 
                                severity={getStatusSeverity(conversation.status)}
                                className="font-semibold rounded-full"
                              />
                              <small className="text-600 font-medium">
                                {new Date(conversation.createdAt).toLocaleString()}
                              </small>
                            </div>
                          </div>
                          {conversation.unreadCount > 0 && (
                            <Badge value={conversation.unreadCount} severity="danger" className="ml-2" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollPanel>
            </Card>
          </div>

          {/* Chat Window - Right Column */}
          <div style={{ width: '67%', display: 'flex', flexDirection: 'column' }}>
            {selectedConversation ? (
              <Card style={{ display: 'flex', flexDirection: 'column', padding: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {/* Header */}
                  <div style={{ flexShrink: 0, marginBottom: '0.75rem', padding: '1rem 1rem 0 1rem' }}>
                    <div className="flex justify-content-between align-items-center pb-2 border-bottom-1 surface-border">
                      <div className="flex align-items-center gap-3">
                        <Avatar 
                          icon="pi pi-user" 
                          size="xlarge" 
                          shape="circle"
                          className="bg-primary"
                        />
                        <div>
                          <h3 className="m-0 mb-1">{selectedConversation.guestName}</h3>
                          <p className="text-sm text-600 m-0">{selectedConversation.guestEmail}</p>
                          {selectedConversation.guestPhone && (
                            <p className="text-sm text-600 m-0">
                              <i className="pi pi-phone mr-2"></i>
                              {selectedConversation.guestPhone}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {selectedConversation.status === 'waiting' && (
                          <Button
                            label="Assign to Me"
                            icon="pi pi-user-plus"
                            onClick={assignToMe}
                            severity="success"
                          />
                        )}
                        <Button
                          label="Close"
                          icon="pi pi-times"
                          onClick={closeConversation}
                          severity="secondary"
                          outlined
                        />
                      </div>
                    </div>
                  </div>

                  {/* Messages - Scrollable Area */}
                  <div
                    style={{
                      maxHeight: '60vh',
                      minHeight: '300px',
                      overflowY: 'auto',
                      overflowX: 'hidden',
                      backgroundColor: '#f9fafb',
                      borderRadius: '0.5rem',
                      padding: '1rem'
                    }}
                  >
                      <div className="flex flex-column gap-3">
                        {selectedConversation.messages?.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.senderType === 'agent' ? 'justify-content-end' : 'justify-content-start'
                          }`}
                        >
                          <div
                            className="max-w-30rem p-4 border-round-lg"
                            style={{
                              backgroundColor: message.senderType === 'agent' 
                                ? '#2563eb' 
                                : message.senderType === 'system'
                                  ? '#fef3c7'
                                  : '#ffffff',
                              border: message.senderType === 'agent'
                                ? '2px solid #1d4ed8'
                                : message.senderType === 'system'
                                  ? '2px solid #f59e0b'
                                  : '2px solid #6b7280',
                              boxShadow: message.senderType === 'agent' 
                                ? '0 4px 12px rgba(37, 99, 235, 0.4)' 
                                : '0 2px 6px rgba(0,0,0,0.1)',
                            }}
                          >
                            <p 
                              className="m-0 font-bold line-height-3"
                              style={{
                                fontSize: '15px',
                                color: message.senderType === 'agent' 
                                  ? '#ffffff' 
                                  : message.senderType === 'system'
                                    ? '#92400e'
                                    : '#111827',
                              }}
                            >
                              {message.message}
                            </p>
                            <div 
                              className="mt-2 text-xs font-semibold"
                              style={{
                                color: message.senderType === 'agent' 
                                  ? 'rgba(255, 255, 255, 0.9)' 
                                  : message.senderType === 'system'
                                    ? '#b45309'
                                    : '#6b7280',
                              }}
                            >
                              {new Date(message.createdAt).toLocaleTimeString()} • {message.senderType.toUpperCase()}
                            </div>
                          </div>
                        </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                  </div>

                  {/* Input */}
                  <div style={{ flexShrink: 0, marginTop: '0.75rem', padding: '0 1rem 1rem 1rem' }}>
                    <Divider style={{ margin: '0 0 0.75rem 0' }} />
                    <div className="flex gap-2">
                    <InputTextarea
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      placeholder="Type your message... (Shift+Enter for new line)"
                      rows={2}
                      className="flex-1"
                      autoResize
                    />
                    <Button
                      icon="pi pi-send"
                      onClick={sendMessage}
                      severity="info"
                      disabled={!messageInput.trim()}
                      style={{ height: '100%' }}
                    />
                  </div>
                  </div>
                </div>
              </Card>
            ) : (
              <Card>
                <div className="flex align-items-center justify-content-center text-500" style={{ minHeight: '60vh' }}>
                  <div className="text-center">
                    <i className="pi pi-comment text-6xl mb-3"></i>
                    <p className="text-xl">Select a conversation to start chatting</p>
                  </div>
                </div>
              </Card>
            )}
          </div>
      </div>
    </div>
  );
}
