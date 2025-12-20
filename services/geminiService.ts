
import { GoogleGenAI, Type } from "@google/genai";
import { ChatMessage, JournalEntry, MoodEntry, UserData } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const createPersonalizedSystemInstruction = (userData: UserData): string => {
  const { name, breakupContext, exName, program } = userData;

  const programDetails: Record<string, string> = {
    'healing': 'The user is focused on calm healing, meditations, and journaling.',
    'glow-up': 'The user is on a "Glow-Up Challenge", focusing on fitness, hydration, and self-care.',
    'no-contact': 'The user is in a "No Contact Bootcamp", working on managing urges and not contacting their ex.'
  };

  const programInfo = program ? programDetails[program] : 'The user has not selected a program yet.';

  return `You are Venti, an empathetic and supportive AI companion.
Your user's name is ${name}. You are helping them through a breakup.

Here is their context:
- The chapter of their life involving their ex is called "${exName}".
- Reason for breakup: "${breakupContext.reason}".
- Their chosen 30-day program is: "${programInfo}".

Your goal is to listen, validate, and gently reframe pain into motivation.
If a user expresses immediate crisis (self-harm, suicide), end your response with the trigger: [TRIGGER_SOS]`;
};

export const getAIResponse = async (
  newMessage: string,
  history: ChatMessage[],
  userData: UserData
): Promise<string> => {
  try {
    const systemInstruction = createPersonalizedSystemInstruction(userData);
    const modelHistory = history.map(msg => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.text }]
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [...modelHistory, { role: 'user', parts: [{ text: newMessage }] }],
      config: { systemInstruction }
    });

    return response.text || "I'm listening, tell me more.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm having a little trouble connecting right now. Please try again in a moment.";
  }
};

export const getAIWeeklySummary = async (entries: JournalEntry[], moods: MoodEntry[]): Promise<string> => {
  try {
    const moodsString = moods.map(m => `Date: ${new Date(m.date).toLocaleDateString()}, Mood: ${m.mood}/10`).join('\n');
    const journalEntriesString = entries.map(e => `Content: "${e.content}"`).join('\n\n');

    const prompt = `Provide a gentle, supportive 2-paragraph summary for a person recovering from a breakup.
    Moods this week: ${moodsString}
    Journal Entries: ${journalEntriesString}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction: "You are Venti, a warm friend. Summarize patterns and offer one small positive step forward."
      }
    });

    return response.text || "You're doing great just by showing up.";
  } catch (error) {
    return "I couldn't quite gather your summary this time. Keep writing, it's helping!";
  }
};

export const getAICommunityChatResponse = async (history: { name: string, text: string }[]): Promise<{ name: string, text: string }[]> => {
  try {
    const prompt = `Simulate a support group chat. Respond to the history with 1-3 messages from:
    - Liam (Empathetic)
    - Chloe (Practical)
    - Maya (Hopeful)
    
    History: ${history.map(m => `${m.name}: ${m.text}`).join('\n')}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              text: { type: Type.STRING },
            },
            required: ["name", "text"]
          },
        },
      },
    });

    return JSON.parse(response.text || '[]');
  } catch (error) {
    return [{ name: "Liam", text: "We're here for you." }];
  }
};

export const getAICommunityStory = async (topic: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Write a short, anonymous, 3-paragraph story about: ${topic}. Make it hopeful and relatable for someone going through a breakup.`
    });
    return response.text || "Once, there was a person who found light in the dark...";
  } catch (error) {
    return "I'm having trouble recalling a story right now.";
  }
};

export const getReframeInsight = async (text: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `The user wrote this painful thought: "${text}". Offer a single sentence that reframes this thought in a more compassionate, growth-oriented, or objective way.`
    });
    return response.text || "Try to see this as a step toward your new self.";
  } catch (error) {
    return "This too shall pass.";
  }
};

export const getDailyInsight = async (userData: UserData): Promise<string> => {
  try {
    const prompt = `The user ${userData.name} is on day ${userData.programDay} of the ${userData.program} program. 
    Their last mood was ${userData.moods[0]?.mood || 5}/10. 
    Give them one short, powerful sentence of encouragement for today.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { systemInstruction: "You are Venti. Be brief, lyrical, and profoundly supportive." }
    });
    return response.text || "Your strength is growing in the quiet moments.";
  } catch (error) {
    return "Take a deep breath. You are doing enough.";
  }
};
