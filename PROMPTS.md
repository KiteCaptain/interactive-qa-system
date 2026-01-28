# Cloud Advisor - LLM Prompts Documentation

This document describes the prompts used to instruct the Google Gemini LLM in the Cloud Advisor application.

## System Prompt

The system prompt establishes the AI's persona, expertise, and behavioral guidelines.

### Current System Prompt

```
You are a knowledgeable and friendly Cloud Advisor specializing in Google Cloud Platform (GCP) and Google Workspace solutions.

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

Remember: You're helping businesses and individuals make informed decisions about cloud technology. Be professional, helpful, and encouraging.
```

### Design Rationale

1. **Specific Expertise Focus**: The prompt explicitly lists GCP services and Workspace products to ground the AI's responses in relevant domain knowledge.

2. **Actionable Guidelines**: The numbered guidelines ensure consistent response quality and style across interactions.

3. **Edge Case Handling**: Specific sections for pricing, certifications, comparisons, and security handle common query types appropriately.

4. **Professional Tone**: The closing reminder reinforces the business context and expected demeanor.

## Prompt Engineering Decisions

### Why Google Gemini?

- **Free Tier**: Gemini 2.5 Flash offers generous free usage (500 requests/day)
- **Speed**: Flash model provides fast responses ideal for chat interfaces
- **Context Window**: 128K tokens allows for longer conversation history
- **Streaming Support**: Native streaming for real-time response display

### Temperature Setting

```typescript
temperature: 0.7
```

A temperature of 0.7 balances:
- Creativity for engaging explanations
- Consistency for technical accuracy
- Natural language variation

### Max Tokens

```typescript
maxTokens: 2048
```

Allows for comprehensive responses while preventing overly verbose answers.

## Example Interactions

### Example 1: Migration Query

**User**: "What's the best way to migrate my on-premise MySQL database to Google Cloud?"

**Expected Response Pattern**:
1. Overview of migration options (Cloud SQL, AlloyDB)
2. Step-by-step migration approach
3. Tools mention (Database Migration Service)
4. Best practices and considerations
5. Post-migration optimization tips

### Example 2: Product Comparison

**User**: "Should I use Cloud Run or GKE for my containerized application?"

**Expected Response Pattern**:
1. Brief explanation of both services
2. Use case comparison table/list
3. Decision criteria (scale, complexity, cost)
4. Recommendation based on common scenarios
5. Links to documentation (conceptually)

### Example 3: Workspace Query

**User**: "How do I set up Google Workspace for a new company?"

**Expected Response Pattern**:
1. Prerequisites and requirements
2. Sign-up process overview
3. Domain verification steps
4. Initial admin configuration
5. User provisioning guidance
6. Security best practices

## Future Improvements

1. **RAG Integration**: Add retrieval from Google Cloud documentation for up-to-date information
2. **Tool Calling**: Enable the AI to fetch real-time pricing or availability data
3. **Conversation Memory**: Implement context summarization for longer conversations
4. **Multi-modal**: Support image uploads for architecture diagram analysis
