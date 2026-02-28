import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface MathQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  topic: string;
}

export const generateQuestion = async (
  studentClass: number,
  difficulty: number,
  weakTopics: string[]
): Promise<MathQuestion> => {
  const syllabus: Record<string, string[]> = {
    "1-3": ["Addition", "Subtraction", "Tables", "Basic shapes", "Word problems"],
    "4-5": ["Multiplication", "Division", "Fractions", "Decimals", "LCM/HCF basics"],
    "6-8": ["Algebra basics", "Ratio & proportion", "Percentages", "Integers", "Linear equations", "Geometry basics"],
    "9-10": ["Quadratic equations", "Polynomials", "Trigonometry basics", "Coordinate geometry", "Probability", "Surface area & volume"],
  };

  let range = "1-3";
  if (studentClass >= 4 && studentClass <= 5) range = "4-5";
  else if (studentClass >= 6 && studentClass <= 8) range = "6-8";
  else if (studentClass >= 9) range = "9-10";

  const topics = syllabus[range];
  const preferredTopic = weakTopics.length > 0 && Math.random() > 0.5 
    ? weakTopics[Math.floor(Math.random() * weakTopics.length)]
    : topics[Math.floor(Math.random() * topics.length)];

  const prompt = `Generate a simple numerical math question for a Class ${studentClass} student. 
  Topic: ${preferredTopic}. 
  Difficulty Level: ${difficulty} (on a scale of 1-10). 
  IMPORTANT: Use numbers and symbols (e.g., 12 + 5 = ?) instead of word problems. 
  Keep the question direct and simple.
  Provide 4 options and a short step-by-step explanation.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { 
              type: Type.ARRAY,
              items: { type: Type.STRING },
              minItems: 4,
              maxItems: 4
            },
            correctAnswer: { type: Type.STRING },
            explanation: { type: Type.STRING },
            topic: { type: Type.STRING }
          },
          required: ["question", "options", "correctAnswer", "explanation", "topic"]
        }
      }
    });

    return JSON.parse(response.text || "{}") as MathQuestion;
  } catch (error) {
    console.error("Error generating question:", error);
    // Fallback question
    return {
      question: "What is 5 + 7?",
      options: ["10", "11", "12", "13"],
      correctAnswer: "12",
      explanation: "5 plus 7 equals 12.",
      topic: "Addition"
    };
  }
};
