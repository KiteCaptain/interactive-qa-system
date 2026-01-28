'use client';

import { Conversation } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Cloud, X, Plus, MessageCircle, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface ConversationSidebarProps {
    conversations: Conversation[];
    currentConversationId: string | null;
    onSelectConversation: (id: string) => void;
    onNewConversation: () => void;
    onDeleteConversation: (id: string) => void;
    isOpen: boolean;
    onClose: () => void;
}

export default function ConversationSidebar({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  isOpen,
  onClose,
}: ConversationSidebarProps) {

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString();
    };

    return (
        <>
        {isOpen && ( 
            <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose}/>
        )}

        {/* Sidebar */}
        <aside
            className={`fixed inset-y-0 left-0 z-50
            w-72 bg-sidebar text-sidebar-foreground border-r border-sidebar-border
            transform transition-transform duration-300 ease-in-out
            ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            flex flex-col
            `}
        >
            {/* Header */}
            <div className="p-4 border-b border-sidebar-border">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Cloud className="w-5 h-5 text-primary" />
                        </div>
                        <span className="font-semibold">Cloud Advisor</span>
                    </div>
                    
                    {/* Close button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className=""
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* New chat */}
                <Button
                    onClick={() => { onNewConversation(); onClose();}}
                    className=" w-full flex items-center gap-2 bg-primary/10  border border-primary/50 hover:bg-primary/20 hover:border-primary  text-primary
                    shadow-lg shadow-primary/20
                    "
                >
                    <Plus className="w-5 h-5" />
                    New Chat
                </Button>
            </div>

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto p-2">
                {conversations.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8 px-4">
                        <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">No conversations yet</p>
                        <p className="text-xs mt-1">Start a new chat to begin</p>
                    </div>
                ) : (
                    <div className="space-y-1">
                    {conversations.map((conv) => (
                        <div
                            key={conv.id}
                            className={`group flex items-center gap-2 p-3 rounded-lg cursor-pointer
                                transition-all duration-200
                                ${currentConversationId === conv.id
                                ? 'bg-sidebar-accent border-l-2 border-primary'
                                : 'hover:bg-sidebar-accent/50'
                                }
                            `}
                            onClick={() => {
                                onSelectConversation(conv.id);
                                onClose();
                            }}
                        >
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                    {conv.title || 'New Conversation'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {formatDate(conv.updated_at)}
                                </p>
                            </div>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteConversation(conv.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-destructive/20 rounded-lg transition-all duration-200 "
                                title="Delete conversation"
                            >
                                <Trash2 className="w-4 h-4 text-destructive" />
                            </button>
                        </div>
                    ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-sidebar-border text-xs text-muted-foreground text-center">
                Built by <Link href="https://kiteeugine.com" target="_blank" className="text-orange-600 hover:underline"> Kite Eugine </Link> for <Link href="https://pawait.africa/" target="_blank" className="text-emerald-600 hover:underline">PawaIT Solutions</Link> Full-Stack Developer Assessment
            </div>
        </aside>
        </>
    );
}
