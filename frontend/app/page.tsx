'use client';

import { useState, useEffect, useCallback } from 'react';
import ChatContainer from '@/components/ChatContainer';
import ConversationSidebar from '@/components/ConversationSidebar';
import { 
	getConversations, 
	createConversation, 
	getConversation, 
	deleteConversation, 
	addMessages 
} from '@/lib/api';
import { Conversation } from '@/lib/types';
import {toast} from 'sonner'

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function Home() {
	const [conversations, setConversations] = useState<Conversation[]>([]);
	const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
	const [sidebarOpen, setSidebarOpen] = useState(true); 
	const [isLoadingConversations, setIsLoadingConversations] = useState(true);
	const [backendAvailable, setBackendAvailable] = useState(true);
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [isChatLoading, setIsChatLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		const isDesktop = window.innerWidth >= 1024; 
		setSidebarOpen(isDesktop);
	}, []);

	// Loading conversations from fastapi
	const loadConversations = useCallback(async () => {
		try {
			const convs = await getConversations();
			setConversations(convs);
			setBackendAvailable(true);
		} catch (err) {
			console.error('Failed to load conversations:', err);
			toast.error('Failed to load conversations from backend');
			setBackendAvailable(false);
		} finally {
			setIsLoadingConversations(false);
		}
	}, []);

	// Load conversations on mount
	useEffect(() => {
		loadConversations();
	}, [loadConversations]);

	// new conversation
	const handleNewConversation = async () => {
		setMessages([]);
		setCurrentConversationId(null);
		
		if (backendAvailable) {
			try {
				const newConv = await createConversation();
				setCurrentConversationId(newConv.id);
				await loadConversations();
			} catch (err) {
				console.error('Failed to create conversation:', err);
				toast.error('Failed to create new conversation');
			}
		}
	};

	// selecting a conversation
	const handleSelectConversation = async (id: string) => {
		try {
			const conv = await getConversation(id);
			setCurrentConversationId(id);
			
			// Convert backend messages to AI SDK format
			const chatMessages = conv.messages.map((msg) => ({
				id: msg.id.toString(),
				role: msg.role as 'user' | 'assistant',
				content: msg.content,
			}));
			setMessages(chatMessages);
		} catch (err) {
			console.error('Failed to load conversation:', err);
			toast.error('Failed to load conversation');
		}
	};

	// deleting  conversation
	const handleDeleteConversation = async (id: string) => {
		try {
			await deleteConversation(id);
			if (currentConversationId === id) {
				setMessages([]);
				setCurrentConversationId(null);
			}
			await loadConversations();
		} catch (err) {
			console.error('Failed to delete conversation:', err);
			toast.error('Failed to delete conversation');
		}
	};

	// submitting message with streaming
	const submitMessage = async (message: string) => {
		setError(null);
		setIsChatLoading(true);
		
		// Create a new conversation if needed
		let convId = currentConversationId;
		if (!convId && backendAvailable) {
			try {
				const newConv = await createConversation();
				convId = newConv.id;
				setCurrentConversationId(newConv.id);
				await loadConversations();
			} catch (err) {
				console.error('Failed to create conversation:', err);
				toast.error('Failed to create new conversation');
			}
		}

		// Add user message
		const userMessage: ChatMessage = {
		id: Date.now().toString(),
		role: 'user' as const,
		content: message,
		};

		const updatedMessages = [...messages, userMessage];
		setMessages(updatedMessages);
		
		// Call AI API with streaming
		try {
			const response = await fetch('/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ messages: updatedMessages }),
			});

			if (!response.ok) throw new Error('Failed to get response');
			if (!response.body) throw new Error('No response body');

			// Stream text
			const reader = response.body.getReader();
			const decoder = new TextDecoder();
			let assistantContent = '';
			const assistantId = (Date.now() + 1).toString();

			// Add empty assistant message
			setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '' }]);

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				const chunk = decoder.decode(value, { stream: true });
				assistantContent += chunk;
				setMessages(prev => 
					prev.map(m => 
						m.id === assistantId 
						? { ...m, content: assistantContent }
						: m
					)
				);
			}

			// Save to backend
			if (convId && backendAvailable) {
				await addMessages(convId, [
					{ role: 'user', content: message },
					{ role: 'assistant', content: assistantContent },
					]);
				loadConversations();
			}
		} catch (err) {
			console.error('Chat error:', err);
			setError(err instanceof Error ? err : new Error('An error occurred'));
			setMessages(prev => prev.filter(m => m.content !== ''));
		} finally {
			setIsChatLoading(false);
		}
  	};

	useEffect(() => {
		if (error) {
			toast.error(error.message || 'An error occurred during chat');
		}
	}, [error]);

	useEffect(() => {
		if (!backendAvailable && !isLoadingConversations) {
			toast.error('Backend unavailable. Chat works, but history won\'t be saved.');
		}
	}, [backendAvailable, isLoadingConversations]);

	return (
		<div className="flex h-screen overflow-hidden">
			{/* Sidebar */}
			<ConversationSidebar
				conversations={conversations}
				currentConversationId={currentConversationId}
				onSelectConversation={handleSelectConversation}
				onNewConversation={handleNewConversation}
				onDeleteConversation={handleDeleteConversation}
				isOpen={sidebarOpen}
				onClose={() => setSidebarOpen(false)}
			/>

			{/* chat area */}
			<ChatContainer
				messages={messages}
				isLoading={isChatLoading}
				onSubmit={submitMessage}
				onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
			/>
		</div>
	);
}
