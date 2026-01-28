'use client';

import { Cloud, Rocket, DollarSign, Shield, Mail } from 'lucide-react';

interface WelcomeScreenProps {
    onExampleClick: (question: string) => void;
}

const exampleQuestions = [
    {
        icon: Rocket,
        title: 'Cloud Migration',
        question: 'What are the best practices for migrating an on-premise application to Google Cloud?',
    },
    {
        icon: DollarSign,
        title: 'Cost Optimization',
        question: 'How can I reduce my Google Cloud costs while maintaining performance?',
    },
    {
        icon: Shield,
        title: 'Security',
        question: 'What security features does Google Cloud offer for enterprise applications?',
    },
    {
        icon: Mail,
        title: 'Google Workspace',
        question: 'How do I set up Google Workspace for a new organization?',
    },
];

export default function WelcomeScreen({ onExampleClick }: WelcomeScreenProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        {/* Logo */}
        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 shadow-2xl shadow-primary/30">
            <Cloud className="w-10 h-10 text-primary" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-foreground mb-2">
            Cloud Advisor
        </h1>
        <p className="text-muted-foreground mb-8 max-w-md">
            Your AI-powered guide to Google Cloud Platform and Google Workspace. 
            Ask me anything about cloud services, migration, security, or best practices.
        </p>

        {/* Example questions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
            {exampleQuestions.map((example, index) => {
                const IconComponent = example.icon;
                return (
                    <button
                        key={index}
                        onClick={() => onExampleClick(example.question)}
                        className=" flex items-start gap-3 p-4 text-left bg-card border border-border rounded-xl hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-200 group"
                    >
                        <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            <IconComponent className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                                {example.title}
                            </p>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                                {example.question}
                            </p>
                        </div>
                    </button>
                );
            })}
        </div>
    </div>
  );
}
