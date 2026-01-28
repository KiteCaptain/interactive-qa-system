'use client';

import { useState, useRef, useEffect, FormEvent, KeyboardEvent } from 'react';
import {  Loader2, SendHorizonal } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface ChatInputProps {
    onSubmit: (message: string) => void;
    isLoading: boolean;
    placeholder?: string;
}

export default function ChatInput({ onSubmit, isLoading, placeholder }: ChatInputProps) {
    const [input, setInput] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea based on content
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
        }
    }, [input]);

    // Focus textarea on mount
    useEffect(() => {
        textareaRef.current?.focus();
    }, []);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const trimmedInput = input.trim();
        if (trimmedInput && !isLoading) {
            onSubmit(trimmedInput);
            setInput('');
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        // enter key to submit
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="relative">
            <div className="flex items-end gap-2 p-4 bg-background border-t border-border">
                <div className="flex-1 relative">
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder || "Ask about Google Cloud, Workspace, or cloud migration..."}
                        disabled={isLoading}
                        rows={1}
                        className=" w-full resize-none rounded-4xl border border-input bg-background
                        px-4 py-3 pr-12
                        focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
                        disabled:bg-muted disabled:text-muted-foreground
                        placeholder:text-muted-foreground
                        transition-all duration-200
                        "
                        style={{ maxHeight: '200px' }}
                    />
                
                    {/* Character count hint */}
                    {input.length > 500 && (
                        <span className="absolute bottom-1 right-14 text-xs text-muted-foreground">
                            {input.length}/2000
                        </span>
                    )}
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="h-12 w-12 rounded-full absolute bottom-2 right-1 hover:bg-primary/10 hover:text-primary
                        flex items-center justify-center
                        disabled:opacity-50 disabled:cursor-not-allowed
                        transition-colors duration-200
                        "
                    >
                        {isLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <SendHorizonal  className="h-5 w-5" />
                        )}
                    </button>
                </div>

                {/* Submit button */}
            </div>

            {/* Helper text */}
            <div className="px-4 pb-2 text-xs text-muted-foreground text-center">
                <kbd className="px-1.5 py-0.5 bg-muted rounded text-foreground">Enter</kbd> to send, 
                <kbd className="px-1.5 py-0.5 bg-muted rounded text-foreground ml-1">Shift + Enter</kbd> for new line
            </div>
        </form>
    );
}
