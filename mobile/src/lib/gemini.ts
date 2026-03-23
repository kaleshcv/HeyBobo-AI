import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '')

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT,        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,       threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
]

// Text model (Gemini 1.5 Flash)
export const textModel = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  safetySettings,
})

// Vision model for image analysis
export const visionModel = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  safetySettings,
})

// ─── AI Tutor ──────────────────────────────────────────────
export async function streamTutorMessage(
  history: Array<{ role: 'user' | 'model'; parts: string }>,
  newMessage: string,
  onChunk: (text: string) => void,
) {
  const chat = textModel.startChat({
    history: history.map((h) => ({ role: h.role, parts: [{ text: h.parts }] })),
    generationConfig: { maxOutputTokens: 2048 },
  })

  const result = await chat.sendMessageStream(newMessage)
  let fullText = ''
  for await (const chunk of result.stream) {
    const chunkText = chunk.text()
    fullText += chunkText
    onChunk(chunkText)
  }
  return fullText
}

// ─── Dietary Meal Analysis (image → macros) ────────────────
export async function analyzeMealImage(base64Image: string): Promise<{
  foodName: string
  calories: number
  protein: number
  carbs: number
  fat: number
  servingSize: string
}> {
  const prompt = `Analyze this food image and return a JSON object with:
  foodName, calories (number), protein (grams, number), carbs (grams, number), fat (grams, number), servingSize (string).
  Return only valid JSON, no markdown.`

  const result = await visionModel.generateContent([
    prompt,
    { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
  ])

  const text = result.response.text()
  return JSON.parse(text)
}

// ─── Grooming Visual Analysis ──────────────────────────────
export async function analyzeGroomingImage(base64Image: string): Promise<{
  skinCondition: string
  concerns: string[]
  recommendations: Array<{ category: string; title: string; description: string; priority: string }>
  overallScore: number
}> {
  const prompt = `Analyze this facial/skin image and return a JSON object with:
  skinCondition (string), concerns (string[]), overallScore (1-10 number),
  recommendations (array of {category, title, description, priority: 'high'|'medium'|'low'}).
  Be constructive and professional. Return only valid JSON, no markdown.`

  const result = await visionModel.generateContent([
    prompt,
    { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
  ])

  const text = result.response.text()
  return JSON.parse(text)
}

// ─── Dietary Meal Plan Generation ─────────────────────────
export async function generateMealPlan(profile: {
  goal: string
  dietType: string
  calories: number
  allergies: string[]
}): Promise<string> {
  const prompt = `Create a 7-day meal plan for someone with these goals:
  Goal: ${profile.goal}, Diet type: ${profile.dietType},
  Daily calories: ${profile.calories}, Allergies: ${profile.allergies.join(', ')}.
  Format as a clear, day-by-day plan with breakfast, lunch, dinner, and snacks.`

  const result = await textModel.generateContent(prompt)
  return result.response.text()
}
