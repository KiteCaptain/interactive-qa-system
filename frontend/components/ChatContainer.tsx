'use client';

import { useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import WelcomeScreen from './WelcomeScreen';
import { ThemeToggle } from './theme-toggle';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

// Simple message interface for our use case
interface ChatMessageType {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatContainerProps {
    messages: ChatMessageType[];
    isLoading: boolean;
    onSubmit: (message: string) => void;
    onSidebarToggle: () => void;
}

export default function ChatContainer({
    messages,
    isLoading,
    onSubmit,
    onSidebarToggle,
}: ChatContainerProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom on new message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const hasMessages = messages.length > 0;

    return (
        <div className="flex-1 flex flex-col h-full bg-background">
            {/* Header */}
            <header className="flex items-center justify-between px-4 py-3 bg-background/80 backdrop-blur-sm border-b border-border">
                <div className="flex items-center gap-3">
                    {/* Sidebar toggle button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onSidebarToggle}
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                </div>

                {/* Right side controls */}
                <div className="flex items-center gap-3">
                    <ThemeToggle />
                </div>
            </header>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto">
                {hasMessages ? (
                <div className="max-w-4xl mx-auto px-4 py-6">
                    {messages.map((message, index) => (
                        <ChatMessage
                            key={message.id || index}
                            role={message.role as 'user' | 'assistant'}
                            content={message.content}
                            isStreaming={isLoading && index === messages.length - 1 && message.role === 'assistant'}
                        />
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                ) : (
                    <WelcomeScreen onExampleClick={onSubmit} />
                )}
            </div>

            {/* Input area */}
            <div className="max-w-4xl mx-auto w-full">
                <ChatInput onSubmit={onSubmit} isLoading={isLoading}/>
            </div>
        </div>
    );
}
