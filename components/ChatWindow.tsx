
import React, { useState, useEffect, useRef } from 'react';
import { socket } from '../socket';
import { ChatMessage, User, UserRole } from '../types';
import { ICONS } from '../constants';

interface ChatWindowProps {
    requestId: string;
    currentUser: User;
    onClose?: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ requestId, currentUser, onClose }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Load messages from localStorage on mount
    useEffect(() => {
        const storageKey = `chat-${requestId}`;
        const stored = localStorage.getItem(storageKey);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setMessages(parsed);
            } catch (e) {
                console.error('Failed to parse stored messages:', e);
            }
        }
    }, [requestId]);

    // Save messages to localStorage whenever they change
    useEffect(() => {
        if (messages.length > 0) {
            const storageKey = `chat-${requestId}`;
            localStorage.setItem(storageKey, JSON.stringify(messages));
        }
    }, [messages, requestId]);

    useEffect(() => {
        // Ensure socket is connected before joining room
        const joinRoom = () => {
            console.log(`Joining chat room: chat-${requestId}`);
            socket.emit('join-mission-chat', requestId);
        };

        if (socket.connected) {
            joinRoom();
        } else {
            socket.connect();
            socket.once('connect', joinRoom);
        }

        const onMessageReceived = (message: ChatMessage) => {
            console.log('Received message:', message);
            if (message.requestId === requestId) {
                setMessages(prev => {
                    // Prevent duplicates
                    if (prev.find(m => m.id === message.id)) return prev;
                    return [...prev, message];
                });
            }
        };

        socket.on('receive-message', onMessageReceived);

        return () => {
            socket.off('receive-message', onMessageReceived);
        };
    }, [requestId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        const newMessage: ChatMessage = {
            id: Math.random().toString(36).substr(2, 9),
            requestId,
            senderId: currentUser.id,
            senderName: currentUser.name,
            text: inputText,
            role: currentUser.role,
            createdAt: Date.now()
        };

        console.log('Sending message:', newMessage);
        setMessages(prev => [...prev, newMessage]);
        socket.emit('send-message', newMessage);
        setInputText('');
    };

    return (
        <div className="flex flex-col h-[500px] w-full max-w-md bg-white rounded-[2rem] shadow-3xl border border-slate-100 overflow-hidden animate-entrance">
            {/* Header */}
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-600 p-2 rounded-xl">
                        <ICONS.Box className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-black text-sm tracking-tight">Mission Radio</h4>
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${socket.connected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                            <p className="text-[9px] text-indigo-400 font-black uppercase tracking-widest">
                                {socket.connected ? 'Link Active' : 'Reconnecting...'}
                            </p>
                        </div>
                    </div>
                </div>
                {onClose && (
                    <button onClick={onClose} className="text-white/30 hover:text-white transition-colors">
                        ✕
                    </button>
                )}
            </div>

            {/* Messages */}
            <div className="flex-grow p-6 overflow-y-auto space-y-4 custom-scrollbar bg-slate-50/50">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <ICONS.Bell className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-sm font-bold text-slate-400">Secure link established. Awaiting tactical communication.</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex flex-col ${msg.senderId === currentUser.id ? 'items-end' : 'items-start'}`}
                        >
                            <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-medium shadow-sm ${msg.senderId === currentUser.id
                                ? 'bg-indigo-600 text-white rounded-tr-none'
                                : 'bg-white text-slate-900 border border-slate-100 rounded-tl-none'
                                }`}>
                                {msg.text}
                            </div>
                            <span className="text-[9px] font-black text-slate-400 mt-1 uppercase tracking-tighter">
                                {msg.senderName} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100 flex gap-3">
                <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Transmit message..."
                    className="flex-grow px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-600 outline-none transition-all text-sm font-bold"
                />
                <button
                    type="submit"
                    className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg active:scale-95"
                >
                    <ICONS.ChevronRight className="w-5 h-5" />
                </button>
            </form>
        </div>
    );
};
