import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

const makeAssistantReply = (prompt: string): string => {
  const lower = prompt.toLowerCase();
  if (lower.includes('cancel') || lower.includes('refund')) {
    return 'You can request a cancellation from your booking history. If payment was captured, refunds follow operator policy.';
  }
  if (lower.includes('seat') || lower.includes('map')) {
    return 'Seat maps show real-time availability. Pick your seats, then proceed to passenger details to lock them.';
  }
  if (lower.includes('payment') || lower.includes('pay')) {
    return 'We support card and wallet payments. If a payment fails, you can retry from the booking summary page.';
  }
  if (lower.includes('lookup') || lower.includes('guest')) {
    return 'Guests can retrieve bookings with a reference code plus email or phone on the Guest Lookup page.';
  }
  return 'I can help with search, seats, payments, and policies. Ask a question or pick a quick suggestion below.';
};

const starterMessages: ChatMessage[] = [
  {
    id: 'welcome',
    role: 'assistant',
    text: 'Hi! I am your trip assistant. Ask me about searching routes, seats, or payments.',
    timestamp: new Date().toISOString(),
  },
];

export const AiAssistantWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(starterMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const viewportRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!viewportRef.current) return;
    viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
  }, [messages, isOpen]);

  const sendMessage = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    window.setTimeout(() => {
      const reply: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: makeAssistantReply(trimmed),
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, reply]);
      setIsTyping(false);
    }, 600);
  };

  const handleSuggestion = (text: string) => {
    setInput(text);
    window.setTimeout(sendMessage, 50);
  };

  const quickSuggestions = [
    'How do I change seats?',
    'What if payment fails?',
    'Can I cancel my booking?',
    'How to lookup a guest booking?',
  ];

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-40 flex flex-col gap-3 md:bottom-8 md:right-8">
      <div className={`pointer-events-auto w-[340px] max-w-[90vw] overflow-hidden rounded-2xl border bg-white/95 shadow-2xl backdrop-blur transition-all duration-200 ${isOpen ? 'opacity-100 translate-y-0' : 'pointer-events-none translate-y-4 opacity-0'}`}>
        <div className="flex items-center justify-between border-b bg-primary/10 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-primary">Trip Assistant (preview)</p>
            <p className="text-xs text-muted-foreground">Simulated replies. Real AI coming soon.</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </div>

        <div ref={viewportRef} className="h-64 space-y-3 overflow-y-auto px-4 py-3">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-center gap-1 rounded-2xl bg-muted px-3 py-2 text-xs text-muted-foreground">
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/80" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60" style={{ animationDelay: '80ms' }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40" style={{ animationDelay: '160ms' }} />
              </div>
            </div>
          )}
        </div>

        <div className="border-t bg-white px-4 py-3">
          <div className="mb-2 flex flex-wrap gap-2">
            {quickSuggestions.map((suggestion) => (
              <Button
                key={suggestion}
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleSuggestion(suggestion)}
              >
                {suggestion}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about trips, seats, or payments"
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  sendMessage();
                }
              }}
            />
            <Button onClick={sendMessage} disabled={!input.trim()}>
              Send
            </Button>
          </div>
        </div>
      </div>

      <div className="pointer-events-auto flex justify-end">
        <Button
          size="lg"
          className="shadow-lg shadow-primary/30"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          {isOpen ? 'Hide Assistant' : 'Chat with AI (demo)'}
        </Button>
      </div>
    </div>
  );
};
