import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResult } from "../types";

// Initialize Gemini client
// Note: In a real production app, API keys should be proxied via backend. 
// We use a safe check for process.env to prevent "process is not defined" crashes in browser.
const getApiKey = () => {
  try {
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env?.API_KEY) {
      // @ts-ignore
      return process.env.API_KEY;
    }
    // Check for Vite specific env if needed, or other bundler injections
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env?.API_KEY) {
       // @ts-ignore
       return import.meta.env.API_KEY;
    }
  } catch (e) {
    console.warn("Could not read API_KEY from environment.");
  }
  return "";
};

const apiKey = getApiKey();
// Only initialize Gemini if key exists to avoid immediate errors
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const analyzeRepository = async (
  repoName: string,
  description: string,
  language: string,
  readmeContent: string,
  targetLanguage: 'tr' | 'en' | 'de' | 'es' = 'tr'
): Promise<AIAnalysisResult> => {
  
  // Truncate readme to avoid token limits for this demo
  const truncatedReadme = readmeContent.slice(0, 5000);

  let langInstruction = "Please provide all responses in English.";
  if (targetLanguage === 'tr') langInstruction = "Lütfen tüm yanıtları Türkçe olarak ver.";
  else if (targetLanguage === 'de') langInstruction = "Bitte geben Sie alle Antworten auf Deutsch.";
  else if (targetLanguage === 'es') langInstruction = "Por favor, proporcione todas las respuestas en español.";

  let outputInstructions = {
    summary: '2-3 sentences summary of what the repo does.',
    useCases: 'Use Case',
    techStack: 'Brief technical comment on the tech stack used.',
    complexityExpl: 'One sentence explanation of why this complexity score was given.'
  };

  if (targetLanguage === 'tr') {
    outputInstructions = {
      summary: 'Deponun ne yaptığına dair 2-3 cümlelik özet.',
      useCases: 'Senaryo',
      techStack: 'Kullanılan teknolojiler hakkında kısa teknik yorum.',
      complexityExpl: 'Bu karmaşıklık puanının neden verildiğine dair bir cümlelik açıklama.'
    };
  } else if (targetLanguage === 'de') {
    outputInstructions = {
      summary: '2-3 Sätze Zusammenfassung, was das Repo macht.',
      useCases: 'Anwendungsfall',
      techStack: 'Kurzer technischer Kommentar zum verwendeten Tech-Stack.',
      complexityExpl: 'Ein Satz Erklärung, warum diese Komplexitätsbewertung vergeben wurde.'
    };
  } else if (targetLanguage === 'es') {
    outputInstructions = {
      summary: 'Resumen de 2-3 frases sobre lo que hace el repositorio.',
      useCases: 'Caso de uso',
      techStack: 'Breve comentario técnico sobre el stack tecnológico utilizado.',
      complexityExpl: 'Explicación de una frase de por qué se dio esta puntuación de complejidad.'
    };
  }

  const prompt = `
    Analyze the following GitHub repository.
    Repo Name: ${repoName}
    Main Language: ${language}
    Description: ${description}
    Readme Summary (first 5000 chars): ${truncatedReadme}

    ${langInstruction}

    Please provide the output in the following JSON format:
    {
      "summary": "${outputInstructions.summary}",
      "complexityScore": Number between 1-10 (1 very simple, 10 complex enterprise),
      "complexityExplanation": "${outputInstructions.complexityExpl}",
      "suggestedUseCases": ["${outputInstructions.useCases} 1", "${outputInstructions.useCases} 2"],
      "techStackAnalysis": "${outputInstructions.techStack}"
    }
  `;

  // Fallback to Puter.js if API key is missing
  if (!apiKey || !ai) {
    // @ts-ignore
    if (typeof window !== 'undefined' && window.puter) {
      console.log("Using Puter.js fallback for AI analysis");
      try {
        // @ts-ignore
        const response = await window.puter.ai.chat(prompt);
        let text = "";
        
        // Handle Puter response structure which might vary
        if (typeof response === 'string') text = response;
        else if (response?.message?.content) text = response.message.content;
        else text = JSON.stringify(response);

        // Strip markdown code blocks if present
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        
        return JSON.parse(text) as AIAnalysisResult;
      } catch (err) {
        console.error("Puter AI Error:", err);
        throw new Error(targetLanguage === 'tr' ? "Puter AI analizi başarısız." : "Puter AI analysis failed.");
      }
    } else {
        throw new Error(targetLanguage === 'tr' ? "API Anahtarı bulunamadı ve Puter.js yüklenemedi." : "API Key not found and Puter.js not loaded.");
    }
  }

  // Use Gemini if API key exists
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                summary: { type: Type.STRING },
                complexityScore: { type: Type.NUMBER },
                complexityExplanation: { type: Type.STRING },
                suggestedUseCases: { 
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                },
                techStackAnalysis: { type: Type.STRING }
            },
            required: ["summary", "complexityScore", "complexityExplanation", "suggestedUseCases", "techStackAnalysis"]
        }
      },
    });

    const text = response.text;
    if (!text) throw new Error("Empty response");
    
    return JSON.parse(text) as AIAnalysisResult;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error(targetLanguage === 'tr' ? "AI Analizi başarısız oldu." : "AI Analysis failed.");
  }
};