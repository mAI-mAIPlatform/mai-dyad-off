"use client";

export interface GreetingMessage {
  id: string;
  content: string;
  role: 'assistant';
  timestamp: Date;
}

export const generateGreetingMessages = (userName: string = 'Utilisateur'): GreetingMessage[] => {
  const greetings = [
    `Bonjour ${userName} ! Comment puis-je vous aider aujourd'hui ?`,
    `Salut ${userName} ! De quoi avez-vous besoin ?`,
    `Hello ${userName} ! Que puis-je faire pour vous ?`,
    `Bonjour ${userName} ! En quoi puis-je vous être utile ?`,
    `Salutations ${userName} ! Comment puis-je vous assister ?`,
    `Hey ${userName} ! De quoi aimeriez-vous parler ?`,
    `Bonjour ${userName} ! Prêt à travailler ensemble ?`,
    `Coucou ${userName} ! Qu'est-ce qui vous amène aujourd'hui ?`,
    `Bonjour ${userName} ! Comment allez-vous aujourd'hui ?`,
    `Salut ${userName} ! Qu'avez-vous en tête ?`
  ];

  const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];

  return [
    {
      id: 'greeting-1',
      content: randomGreeting,
      role: 'assistant',
      timestamp: new Date()
    }
  ];
};

export const isGreetingMessage = (message: GreetingMessage): boolean => {
  return message.id.startsWith('greeting-');
};