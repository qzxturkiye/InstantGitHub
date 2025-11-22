import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResult } from "../types";

// Initialize Gemini client
// Note: In a real production app, API keys should be proxied via backend. 
// For this demo, we assume process.env.API_KEY is available or injected.
const apiKey = process.env.API_KEY || ""; 
const ai = new GoogleGenAI({ apiKey });

export const analyzeRepository = async (
  repoName: string,
  description: string,
  language: string,
  readmeContent: string,
  targetLanguage: 'tr' | 'en' | 'de' | 'es' = 'tr'
): Promise<AIAnalysisResult> => {
  if (!apiKey) {
    throw new Error(targetLanguage === 'tr' ? "API Key eksik." : "API Key missing.");
  }

  // Truncate readme to avoid token limits for this demo
  const truncatedReadme = readmeContent.slice(0, 5000);

  let langInstruction = "Please provide all responses in English.";
  if (targetLanguage === 'tr') langInstruction = "Lütfen tüm yanıtları Türkçe olarak ver.";
  else if (targetLanguage === 'de') langInstruction = "Bitte geben Sie alle Antworten auf Deutsch.";
  else if (targetLanguage === 'es') langInstruction = "Por favor, proporcione todas las respuestas en español.";

  let outputInstructions = {
    summary: '2-3 sentences summary of what the repo does.',
    useCases: 'Use Case',
    techStack: 'Brief technical comment on the tech stack used.'
  };

  if (targetLanguage === 'tr') {
    outputInstructions = {
      summary: 'Deponun ne yaptığına dair 2-3 cümlelik özet.',
      useCases: 'Senaryo',
      techStack: 'Kullanılan teknolojiler hakkında kısa teknik yorum.'
    };
  } else if (targetLanguage === 'de') {
    outputInstructions = {
      summary: '2-3 Sätze Zusammenfassung, was das Repo macht.',
      useCases: 'Anwendungsfall',
      techStack: 'Kurzer technischer Kommentar zum verwendeten Tech-Stack.'
    };
  } else if (targetLanguage === 'es') {
    outputInstructions = {
      summary: 'Resumen de 2-3 frases sobre lo que hace el repositorio.',
      useCases: 'Caso de uso',
      techStack: 'Breve comentario técnico sobre el stack tecnológico utilizado.'
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
      "suggestedUseCases": ["${outputInstructions.useCases} 1", "${outputInstructions.useCases} 2"],
      "techStackAnalysis": "${outputInstructions.techStack}"
    }
  `;

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
                suggestedUseCases: { 
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                },
                techStackAnalysis: { type: Type.STRING }
            },
            required: ["summary", "complexityScore", "suggestedUseCases", "techStackAnalysis"]
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