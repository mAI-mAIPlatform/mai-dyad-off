"use client";

export interface GreetingMessage {
  id: string;
  content: string;
  role: 'assistant';
  timestamp: Date;
}

export const generateGreetingMessages = (userName: string = 'Utilisateur', language: string = 'fr'): GreetingMessage[] => {
  const greetings: Record<string, string[]> = {
    fr: [
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
    ],
    en: [
      `Hello ${userName}! How can I help you today?`,
      `Hi ${userName}! What do you need?`,
      `Hey ${userName}! What can I do for you?`,
      `Good day ${userName}! How can I assist you?`,
      `Greetings ${userName}! How can I help?`,
      `Hey ${userName}! What would you like to talk about?`,
      `Hello ${userName}! Ready to work together?`,
      `Hi there ${userName}! What brings you here today?`,
      `Hello ${userName}! How are you today?`,
      `Hi ${userName}! What's on your mind?`
    ],
    es: [
      `¡Hola ${userName}! ¿Cómo puedo ayudarte hoy?`,
      `¡Hola ${userName}! ¿Qué necesitas?`,
      `¡Hola ${userName}! ¿Qué puedo hacer por ti?`,
      `¡Buenos días ${userName}! ¿En qué puedo ayudarte?`,
      `¡Saludos ${userName}! ¿Cómo puedo asistirte?`,
      `¡Hola ${userName}! ¿De qué te gustaría hablar?`,
      `¡Hola ${userName}! ¿Listo para trabajar juntos?`,
      `¡Hola ${userName}! ¿Qué te trae por aquí hoy?`,
      `¡Hola ${userName}! ¿Cómo estás hoy?`,
      `¡Hola ${userName}! ¿Qué tienes en mente?`
    ],
    de: [
      `Hallo ${userName}! Wie kann ich Ihnen heute helfen?`,
      `Hallo ${userName}! Was brauchen Sie?`,
      `Hallo ${userName}! Was kann ich für Sie tun?`,
      `Guten Tag ${userName}! Wie kann ich Ihnen behilflich sein?`,
      `Grüße ${userName}! Wie kann ich Ihnen assistieren?`,
      `Hallo ${userName}! Worüber möchten Sie sprechen?`,
      `Hallo ${userName}! Bereit, zusammenzuarbeiten?`,
      `Hallo ${userName}! Was führt Sie heute hierher?`,
      `Hallo ${userName}! Wie geht es Ihnen heute?`,
      `Hallo ${userName}! Was haben Sie im Sinn?`
    ],
    pt: [
      `Olá ${userName}! Como posso ajudá-lo hoje?`,
      `Oi ${userName}! Do que você precisa?`,
      `Olá ${userName}! O que posso fazer por você?`,
      `Bom dia ${userName}! Como posso ser útil?`,
      `Saudações ${userName}! Como posso ajudá-lo?`,
      `Olá ${userName}! Sobre o que gostaria de falar?`,
      `Olá ${userName}! Pronto para trabalharmos juntos?`,
      `Oi ${userName}! O que o traz aqui hoje?`,
      `Olá ${userName}! Como você está hoje?`,
      `Oi ${userName}! O que você tem em mente?`
    ]
  };

  const languageGreetings = greetings[language] || greetings.fr;
  const randomGreeting = languageGreetings[Math.floor(Math.random() * languageGreetings.length)];

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