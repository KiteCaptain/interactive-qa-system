/**
 * Chat API Route
 * ==============
 * Handles streaming chat requests using Vercel AI SDK with Google Gemini.
 */

import { streamText } from 'ai';
import { google } from '@ai-sdk/google';

// Cloud Advisor System Prompt
const SYSTEM_PROMPT = `You are a knowledgeable and friendly Cloud Advisor specializing in Google Cloud Platform (GCP) and Google Workspace solutions.

Your expertise includes:
- Google Cloud Platform services (Compute Engine, Cloud Storage, BigQuery, Cloud Run, Kubernetes Engine, etc.)
- Google Workspace products (Gmail, Drive, Docs, Sheets, Meet, Admin Console)
- Cloud migration strategies and best practices
- Infrastructure modernization and optimization
- Cloud security and compliance
- Cost optimization and billing management
- DevOps practices and CI/CD pipelines
- Data analytics and machine learning on GCP

Guidelines for your responses:
1. Provide clear, accurate, and actionable advice
2. Break down complex concepts into understandable explanations
3. Include relevant examples when helpful
4. Mention specific Google Cloud products or services when applicable
5. Offer step-by-step guidance for implementation questions
6. Highlight best practices and potential pitfalls
7. Be honest about limitations or when a question is outside your expertise
8. Keep responses concise but comprehensive

When users ask about:
- Pricing: Direct them to Google Cloud's pricing calculator and mention that costs vary by usage
- Certifications: Provide information about Google Cloud certification paths
- Comparisons: Give balanced comparisons with other cloud providers when asked
- Security: Emphasize Google Cloud's security features and compliance certifications

Remember: You're helping businesses and individuals make informed decisions about cloud technology. Be professional, helpful, and encouraging.`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Validate input
    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Invalid request: messages array required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create streaming response with Gemini
    const result = streamText({
      model: google('gemini-2.5-flash'),
      system: SYSTEM_PROMPT,
      messages,
      temperature: 0.7,
    });

    // Return streaming response
    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Chat API Error:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return new Response(
          JSON.stringify({ error: 'API key configuration error. Please check your GEMINI_API_KEY.' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }
    
    return new Response(
      JSON.stringify({ error: 'An error occurred while processing your request.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
