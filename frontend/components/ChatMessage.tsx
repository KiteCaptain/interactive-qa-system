/**
 * ChatMessage Component
 * =====================
 * Renders individual chat messages with markdown support.
 */

'use client';

import ReactMarkdown from 'react-markdown';
import { Cloud } from 'lucide-react';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

export default function ChatMessage({ role, content, isStreaming }: ChatMessageProps) {
  const isUser = role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`
          max-w-[80%] md:max-w-[70%] rounded-2xl px-4 py-3
          ${isUser
            ? 'bg-primary text-primary-foreground rounded-br-md'
            : 'bg-card border border-border text-card-foreground rounded-bl-md shadow-sm'
          }
        `}
      >
        {/* Role indicator for assistant */}
        {!isUser && (
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center">
              <Cloud className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">Cloud Advisor</span>
            {isStreaming && (
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400">typing...</span>
              </span>
            )}
          </div>
        )}

        {/* Message content */}
        <div className={`prose prose-sm max-w-none dark:prose-invert ${isUser ? 'prose-invert' : ''}`}>
          {isUser ? (
            <p className="m-0 whitespace-pre-wrap">{content}</p>
          ) : (
            <ReactMarkdown
              components={{
                // Style code blocks
                code: ({ children, className }) => {
                  const isBlock = className?.includes('language-');
                  return isBlock ? (
                    <code className="block bg-muted text-foreground p-3 rounded-lg overflow-x-auto text-xs">
                      {children}
                    </code>
                  ) : (
                    <code className="bg-muted text-foreground px-1.5 py-0.5 rounded text-xs">
                      {children}
                    </code>
                  );
                },
                // Style lists
                ul: ({ children }) => (
                  <ul className="list-disc list-inside space-y-1 my-2">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside space-y-1 my-2">{children}</ol>
                ),
                // Style paragraphs
                p: ({ children }) => (
                  <p className="my-2 leading-relaxed">{children}</p>
                ),
                // Style headings
                h1: ({ children }) => (
                  <h1 className="text-lg font-bold mt-4 mb-2">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-base font-bold mt-3 mb-2">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-sm font-bold mt-2 mb-1">{children}</h3>
                ),
                // Style links
                a: ({ children, href }) => (
                  <a href={href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                    {children}
                  </a>
                ),
              }}
            >
              {content || '...'}
            </ReactMarkdown>
          )}
        </div>
      </div>
    </div>
  );
}
