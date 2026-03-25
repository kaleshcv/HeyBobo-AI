import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

function getModel() {
  if (!genAI) {
    throw new Error('Gemini API key not configured. Add VITE_GEMINI_API_KEY to your .env file.');
  }
  return genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
}

export async function chatWithTutor(
  message: string,
  history: { role: string; content: string }[],
  documentContext: string | null,
): Promise<string> {
  const model = getModel();

  let docSection = '';
  if (documentContext) {
    const truncated = documentContext.substring(0, 100000);
    docSection = `\n\nThe student has uploaded a textbook. Here is its content:\n--- Document Start ---\n${truncated}\n--- Document End ---\n\nFocus your answers on the textbook content. Cite specific sections, chapters, or page concepts when relevant.`;
  }

  const recentHistory = history
    .slice(-20)
    .map((m) => `${m.role === 'user' ? 'Student' : 'Tutor'}: ${m.content}`)
    .join('\n');

  const prompt = `You are Heybobo, an expert university-level AI tutor. You help students understand their textbooks deeply. Explain concepts clearly with examples, analogies, and step-by-step breakdowns. Be encouraging, patient, and thorough.${docSection}

${recentHistory ? `Previous conversation:\n${recentHistory}\n\n` : ''}Student: ${message}

Provide a helpful, educational response. Use markdown formatting for clarity.`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function generateStudyPlan(
  bookTitle: string,
  bookContent: string,
  daysAvailable: number,
  hoursPerDay: number,
): Promise<string> {
  const model = getModel();
  const truncated = bookContent.substring(0, 80000);

  const prompt = `You are an expert university study planner. A student wants to study a textbook and needs a structured study plan.

Textbook: "${bookTitle}"
Content preview:
--- Book Start ---
${truncated}
--- Book End ---

The student has ${daysAvailable} days and can study ${hoursPerDay} hours per day.

Create a detailed, structured study plan in JSON format with this exact structure:
{
  "title": "Study Plan for [Book Title]",
  "totalDays": ${daysAvailable},
  "hoursPerDay": ${hoursPerDay},
  "chapters": [
    {
      "id": "ch1",
      "title": "Chapter/Topic Name",
      "description": "Brief description of what this covers",
      "days": 2,
      "topics": ["Topic 1", "Topic 2", "Topic 3"],
      "objectives": ["By the end, student should understand X", "Be able to Y"]
    }
  ]
}

Identify the actual chapters/sections from the book content. Be realistic about time allocation. Return ONLY valid JSON, no markdown.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  // Strip markdown code fences if present
  return text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
}

export async function generateQuiz(
  bookTitle: string,
  bookContent: string,
  chapterTitle: string,
  numQuestions: number,
): Promise<string> {
  const model = getModel();
  const truncated = bookContent.substring(0, 80000);

  const prompt = `You are a university professor creating a quiz. Generate a quiz based on this textbook.

Textbook: "${bookTitle}"
Chapter/Topic: "${chapterTitle}"
Content:
--- Book Start ---
${truncated}
--- Book End ---

Create ${numQuestions} questions in JSON format with this exact structure:
{
  "title": "Quiz: ${chapterTitle}",
  "questions": [
    {
      "id": "q1",
      "question": "What is...?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "The correct answer is A because..."
    }
  ]
}

Mix question types: conceptual understanding, application, and analysis. Make questions challenging but fair for university students. Return ONLY valid JSON, no markdown.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
}

export async function generateRevisionPlan(
  quizTitle: string,
  questions: { question: string; options: string[]; correctIndex: number; explanation: string; userAnswer: number }[],
): Promise<string> {
  const model = getModel();

  const wrongQs = questions
    .filter((q) => q.userAnswer !== q.correctIndex)
    .map((q, i) => `${i + 1}. Question: ${q.question}\n   User picked: "${q.options[q.userAnswer] ?? 'No answer'}"\n   Correct: "${q.options[q.correctIndex]}"\n   Explanation: ${q.explanation}`)
    .join('\n\n');

  const prompt = `A student just failed a quiz titled "${quizTitle}". Analyze the wrong answers and create a focused revision plan.

Wrong answers:
${wrongQs}

Return JSON with this exact structure:
{
  "summary": "Brief 1-2 sentence overview of the student's weak areas",
  "weakAreas": [
    {
      "topic": "Specific topic name",
      "weakness": "What the student doesn't understand",
      "action": "Specific study action to improve",
      "priority": "high"
    }
  ]
}

Priority: "high" for fundamental gaps, "medium" for partial understanding, "low" for minor errors.
Group related wrong answers into the same topic. Return ONLY valid JSON.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
}

export async function teachContent(
  bookTitle: string,
  bookContent: string,
  topic: string,
): Promise<string> {
  const model = getModel();
  const truncated = bookContent.substring(0, 80000);

  const prompt = `You are an expert university professor teaching from a textbook. Teach the following topic in a clear, engaging way.

Textbook: "${bookTitle}"
Topic to teach: "${topic}"
Book content:
--- Book Start ---
${truncated}
--- Book End ---

Create a comprehensive lesson on "${topic}" that includes:
1. **Introduction** - What this topic is and why it matters
2. **Core Concepts** - Explain each concept clearly with examples
3. **Key Formulas/Definitions** (if applicable)
4. **Real-world Applications** - How this applies in practice
5. **Common Mistakes** - What students often get wrong
6. **Summary** - Key takeaways

Use markdown formatting. Be thorough but clear. Use analogies and examples a university student would relate to.`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

export interface AnalyzedFoodItem {
  name: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  servingSize: number;
  servingUnit: string;
  quantity: number;
}

export async function analyzeFoodImage(imageFile: File): Promise<AnalyzedFoodItem[]> {
  const model = getModel();

  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(imageFile);
  });

  const prompt = `You are a nutrition expert. Analyze this food image and identify every food item visible.

For each food item, estimate realistic nutritional values per serving.

Return ONLY valid JSON with this exact structure — no markdown, no explanation:
{
  "foods": [
    {
      "name": "Food item name",
      "calories": 250,
      "proteinG": 12,
      "carbsG": 30,
      "fatG": 8,
      "fiberG": 3,
      "servingSize": 100,
      "servingUnit": "g",
      "quantity": 1
    }
  ]
}

Be specific with food names (e.g. "Poached Egg on Sourdough Toast" not just "food").
Use realistic nutritional values based on standard serving sizes.
If you cannot identify the food clearly, make your best educated guess.`;

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        mimeType: imageFile.type || 'image/jpeg',
        data: base64,
      },
    },
  ]);

  const text = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const parsed = JSON.parse(text);
  return parsed.foods || [];
}

export interface NutritionLabelData {
  productName: string;
  brand?: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  sugarG: number;
  sodiumMg: number;
  cholesterolMg: number;
  vitaminA: number;
  vitaminC: number;
  calcium: number;
  iron: number;
}

export async function analyzeNutritionLabel(imageFile: File): Promise<NutritionLabelData | null> {
  const model = getModel();

  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(imageFile);
  });

  const prompt = `You are a nutrition expert. Analyze this image. It may be a nutrition label, barcode, food package, or grocery item.

Extract or estimate the nutritional information. Return ONLY valid JSON:
{
  "productName": "Product name",
  "brand": "Brand name or null",
  "servingSize": 100,
  "servingUnit": "g",
  "calories": 250,
  "proteinG": 12,
  "carbsG": 30,
  "fatG": 8,
  "fiberG": 3,
  "sugarG": 5,
  "sodiumMg": 400,
  "cholesterolMg": 20,
  "vitaminA": 10,
  "vitaminC": 15,
  "calcium": 8,
  "iron": 6
}

Vitamins/minerals should be percentage of daily value (0-100).
If you cannot read certain values, estimate based on the product type.
Use realistic values.`;

  const result = await model.generateContent([
    prompt,
    { inlineData: { mimeType: imageFile.type || 'image/jpeg', data: base64 } },
  ]);

  const text = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(text);
}

// ─── Meal Planner AI ────────────────────────────────────

export interface MealPlanInput {
  planType: 'daily' | 'weekly';
  category?: string;
  fitnessGoal?: string;
  activityLevel?: string;
  dietType?: string;
  healthConditions?: string[];
  allergies?: string[];
  preferences?: string[];
  targetCalories?: number;
  targetProteinG?: number;
  targetCarbsG?: number;
  targetFatG?: number;
}

export interface PlannedMealItemAI {
  name: string;
  description: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  portionSize: string;
  ingredients: string[];
  prepTime: string;
  substitutions: string[];
}

export interface DayPlanAI {
  day: string;
  totalCalories: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  breakfast: PlannedMealItemAI[];
  lunch: PlannedMealItemAI[];
  dinner: PlannedMealItemAI[];
  snacks: PlannedMealItemAI[];
}

export interface GeneratedMealPlan {
  title: string;
  days: DayPlanAI[];
  prepGuide: string;
  shoppingList: string[];
  aiNotes: string;
}

export async function generateMealPlan(input: MealPlanInput): Promise<GeneratedMealPlan> {
  const model = getModel();

  const numDays = input.planType === 'daily' ? 1 : 7;
  const dayLabels = input.planType === 'daily'
    ? ['Today']
    : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const categoryDescriptions: Record<string, string> = {
    general: 'a balanced, healthy meal plan',
    health_condition: `a therapeutic meal plan optimized for managing these health conditions: ${input.healthConditions?.join(', ') || 'general health'}`,
    athlete_performance: 'a high-performance athlete nutrition plan focused on peak energy, recovery, and lean mass',
    gym_nutrition: 'a gym-goer nutrition plan focused on muscle gain, pre/post workout nutrition, and body recomposition',
    custom: 'a custom meal plan based on the user\'s specific preferences',
  };

  const categoryDesc = categoryDescriptions[input.category || 'general'] || categoryDescriptions.general;

  const prompt = `You are an expert sports nutritionist and dietitian. Generate ${categoryDesc}.

PERSONALIZATION:
- Fitness Goal: ${input.fitnessGoal || 'maintain health'}
- Activity Level: ${input.activityLevel || 'moderately active'}
- Diet Type: ${input.dietType || 'standard'}
- Health Conditions: ${input.healthConditions?.length ? input.healthConditions.join(', ') : 'None'}
- Allergies: ${input.allergies?.length ? input.allergies.join(', ') : 'None'}
- Food Preferences: ${input.preferences?.length ? input.preferences.join(', ') : 'No specific preferences'}
- Target Calories: ${input.targetCalories || 'Calculate appropriate amount'}
- Target Protein: ${input.targetProteinG ? input.targetProteinG + 'g' : 'Calculate'}
- Target Carbs: ${input.targetCarbsG ? input.targetCarbsG + 'g' : 'Calculate'}
- Target Fat: ${input.targetFatG ? input.targetFatG + 'g' : 'Calculate'}

Generate a ${numDays}-day meal plan. Days: ${dayLabels.join(', ')}.

Return ONLY valid JSON with this exact structure — no markdown, no explanation:
{
  "title": "Descriptive plan title",
  "days": [
    {
      "day": "${dayLabels[0]}",
      "totalCalories": 2200,
      "totalProteinG": 150,
      "totalCarbsG": 220,
      "totalFatG": 80,
      "breakfast": [
        {
          "name": "Meal name",
          "description": "Brief description",
          "calories": 450,
          "proteinG": 30,
          "carbsG": 45,
          "fatG": 15,
          "fiberG": 5,
          "portionSize": "1 bowl (350g)",
          "ingredients": ["ingredient 1", "ingredient 2"],
          "prepTime": "10 min",
          "substitutions": ["Alternative meal 1", "Alternative meal 2"]
        }
      ],
      "lunch": [...],
      "dinner": [...],
      "snacks": [...]
    }
  ],
  "prepGuide": "Detailed meal prep guide with tips for batch cooking, storage instructions, and time-saving strategies. Use markdown formatting.",
  "shoppingList": ["Item 1 (amount)", "Item 2 (amount)"],
  "aiNotes": "Nutritional rationale and adjustments explanation"
}

REQUIREMENTS:
- Each meal must have realistic, accurate nutritional values
- Include 2 substitutions per meal for flexibility
- Include actual ingredients with portions
- Shopping list should cover all days
- Prep guide should include batch cooking strategies
- Every day must have breakfast, lunch, dinner, and at least 1 snack
- Respect ALL allergies and dietary restrictions strictly
- For athlete/gym plans, include pre/post workout nutrition timing notes in aiNotes`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(text);
}

export async function generateMealSubstitution(
  mealName: string,
  reason: string,
  allergies: string[],
  dietType: string,
): Promise<PlannedMealItemAI[]> {
  const model = getModel();

  const prompt = `You are an expert nutritionist. A user needs to substitute a meal.

Current meal: "${mealName}"
Reason for substitution: ${reason || 'preference'}
Allergies: ${allergies.length ? allergies.join(', ') : 'None'}
Diet type: ${dietType || 'standard'}

Provide 3 alternative meals with similar nutritional value. Return ONLY valid JSON:
{
  "alternatives": [
    {
      "name": "Alternative meal name",
      "description": "Brief description",
      "calories": 450,
      "proteinG": 30,
      "carbsG": 45,
      "fatG": 15,
      "fiberG": 5,
      "portionSize": "1 serving (300g)",
      "ingredients": ["ingredient 1", "ingredient 2"],
      "prepTime": "15 min",
      "substitutions": []
    }
  ]
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const parsed = JSON.parse(text);
  return parsed.alternatives || [];
}

export async function adjustMealPlanAI(
  currentPlan: any,
  adjustmentContext: string,
): Promise<string> {
  const model = getModel();

  const prompt = `You are an expert nutritionist. Review this meal plan and suggest adjustments.

Current plan summary:
${JSON.stringify(currentPlan.days?.map((d: any) => ({ day: d.day, calories: d.totalCalories, protein: d.totalProteinG })), null, 2)}

Adjustment context: ${adjustmentContext}

Provide specific, actionable recommendations in markdown format. Include:
1. What to change and why
2. Specific meal swaps
3. Portion adjustments
4. Timing recommendations

Be concise and practical.`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function generateGroceryList(mealPlan: any): Promise<any> {
  const model = getModel();
  const prompt = `You are an expert nutritionist and smart shopping assistant. Generate an optimized grocery list from this meal plan.

Meal Plan:
${JSON.stringify(mealPlan.days?.map((d: any) => ({
  day: d.day,
  meals: d.meals?.map((m: any) => ({ name: m.name, ingredients: m.ingredients, servings: m.servings }))
})), null, 2)}

Generate a consolidated, optimized grocery list. Combine duplicate ingredients, round up quantities.

Return ONLY valid JSON (no markdown, no code fences) in this exact format:
{
  "items": [
    {
      "name": "Chicken Breast",
      "quantity": 2,
      "unit": "lbs",
      "category": "meat",
      "estimatedPrice": 8.99,
      "calories": 990,
      "proteinG": 186,
      "carbsG": 0,
      "fatG": 22
    }
  ],
  "optimizationTips": [
    "Buy chicken in bulk to save 20%",
    "Seasonal produce: peppers are cheapest now"
  ],
  "estimatedTotalCost": 85.50
}

Categories must be one of: produce, dairy, meat, seafood, grains, bakery, frozen, canned, snacks, beverages, condiments, spices, oils, supplements, other.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(text);
}

// ═══════════ GROOMING: SKIN ANALYSIS ════════════════════

export interface SkinAnalysisResult {
  skinScore: number;
  skinType: string;
  concerns: string[];
  detailedAnalysis: string;
  routine: { step: number; name: string; description: string; product: { name: string; brand: string; category: string; description: string; usage: string; priceRange: string; keyIngredients: string }; timeOfDay: string; frequency: string }[];
  tips: string[];
  seasonalAdvice: string;
}

export async function analyzeSkinImage(imageFile: File, profile?: any): Promise<SkinAnalysisResult> {
  const model = getModel();

  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(imageFile);
  });

  const profileContext = profile ? `
User profile:
- Skin type: ${profile.skinType || 'unknown'}
- Concerns: ${(profile.concerns || []).join(', ') || 'none specified'}
- Sun exposure: ${profile.sunExposure || 'unknown'}
- Vegan only: ${profile.veganOnly ? 'yes' : 'no'}
- Budget: ${profile.budget || 'any'}
- Allergies: ${(profile.allergies || []).join(', ') || 'none'}
- Current routine: ${profile.currentRoutine || 'none'}
` : '';

  const prompt = `You are a professional dermatologist and skincare expert. Analyze this selfie/skin image and provide a comprehensive skincare assessment.

${profileContext}

Return ONLY valid JSON:
{
  "skinScore": 75,
  "skinType": "combination",
  "concerns": ["large_pores", "oily_t_zone", "mild_redness"],
  "detailedAnalysis": "Your skin shows signs of...",
  "routine": [
    {
      "step": 1,
      "name": "Gentle Cleanser",
      "description": "A sulfate-free gel cleanser to remove excess oil without stripping moisture",
      "product": {
        "name": "CeraVe Foaming Facial Cleanser",
        "brand": "CeraVe",
        "category": "cleanser",
        "description": "Gentle foaming cleanser with ceramides and niacinamide",
        "usage": "Apply to damp face, massage gently for 60 seconds, rinse",
        "priceRange": "$10-15",
        "keyIngredients": "ceramides, niacinamide, hyaluronic acid"
      },
      "timeOfDay": "both",
      "frequency": "daily"
    }
  ],
  "tips": [
    "Always apply sunscreen as the last step in your morning routine",
    "Consider double cleansing in the evening if you wear makeup"
  ],
  "seasonalAdvice": "In summer, switch to a lighter moisturizer and increase sunscreen reapplication frequency"
}

Include 4-6 routine steps (cleanser, toner/serum, moisturizer, sunscreen, optional treatments).
Rate skin on a 0-100 scale. Be specific and actionable.`;

  const result = await model.generateContent([
    prompt,
    { inlineData: { mimeType: imageFile.type || 'image/jpeg', data: base64 } },
  ]);

  const text = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(text);
}

// ═══════════ GROOMING: SKINCARE FROM PROFILE ═════════════

export async function generateSkincareRoutine(profile: any): Promise<SkinAnalysisResult> {
  const model = getModel();

  const prompt = `You are a professional dermatologist and skincare expert. Based on the user's profile, generate a personalized skincare routine.

User profile:
- Gender: ${profile.gender || 'unspecified'}
- Age: ${profile.age || 'unspecified'}
- Skin type: ${profile.skinType || 'unknown'}
- Concerns: ${(profile.concerns || []).join(', ') || 'none specified'}
- Sun exposure: ${profile.sunExposure || 'moderate'}
- Vegan only: ${profile.veganOnly ? 'yes' : 'no'}
- Budget: ${profile.budget || 'mid-range'}
- Allergies: ${(profile.allergies || []).join(', ') || 'none'}
- Current routine: ${profile.currentRoutine || 'none'}
- Season: ${profile.season || 'not specified'}

Return ONLY valid JSON:
{
  "skinScore": 0,
  "skinType": "${profile.skinType || 'combination'}",
  "concerns": [],
  "detailedAnalysis": "Based on your profile as a [skin type] skin type with [concerns]...",
  "routine": [
    {
      "step": 1,
      "name": "Step name",
      "description": "Why this step",
      "product": {
        "name": "Product Name",
        "brand": "Brand",
        "category": "cleanser",
        "description": "Product description",
        "usage": "How and when to use",
        "priceRange": "$X-Y",
        "keyIngredients": "key ingredients"
      },
      "timeOfDay": "morning|evening|both",
      "frequency": "daily|weekly|as-needed"
    }
  ],
  "tips": ["tip1", "tip2", "tip3"],
  "seasonalAdvice": "Season-specific advice"
}

Include 4-7 routine steps. Tailor products to budget and preferences. Include ingredient education.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(text);
}

// ═══════════ GROOMING: HAIR ANALYSIS ═════════════════════

export interface HairAnalysisResult {
  hairType: string;
  faceShape: string;
  analysis: string;
  haircutSuggestions: { name: string; description: string; suitability: string }[];
  beardCare: { name: string; description: string; product: { name: string; brand: string; category: string; description: string; usage: string; priceRange: string; keyIngredients: string }; frequency: string }[];
  products: { name: string; brand: string; category: string; description: string; usage: string; priceRange: string; keyIngredients: string }[];
  stylingTips: string[];
  tips: string[];
}

export async function analyzeHairImage(imageFile: File, profile?: any): Promise<HairAnalysisResult> {
  const model = getModel();

  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(imageFile);
  });

  const profileContext = profile ? `
User profile:
- Hair type: ${profile.hairType || 'unknown'}
- Face shape: ${profile.faceShape || 'unknown'}
- Has facial hair: ${profile.hasFacialHair ? 'yes' : 'no'}
- Facial hair style: ${profile.facialHairStyle || 'n/a'}
- Hair concerns: ${(profile.hairConcerns || []).join(', ') || 'none'}
- Styling preference: ${profile.stylingPreference || 'any'}
- Gender: ${profile.gender || 'unspecified'}
` : '';

  const prompt = `You are a professional hairstylist and grooming expert. Analyze this photo focusing on hair texture, face shape, and grooming potential.

${profileContext}

Return ONLY valid JSON:
{
  "hairType": "wavy",
  "faceShape": "oval",
  "analysis": "Detailed analysis of hair condition and face shape...",
  "haircutSuggestions": [
    { "name": "Textured Crop", "description": "A short, LayerCut with texture on top", "suitability": "Great for your oval face shape and wavy hair" }
  ],
  "beardCare": [
    {
      "name": "Beard Oil Application",
      "description": "Moisturize and condition facial hair",
      "product": { "name": "Honest Amish Beard Oil", "brand": "Honest Amish", "category": "beard_oil", "description": "All-natural beard conditioning oil", "usage": "Apply 3-5 drops to beard after shower", "priceRange": "$10-15", "keyIngredients": "argan oil, jojoba oil, vitamin E" },
      "frequency": "daily"
    }
  ],
  "products": [
    { "name": "Product Name", "brand": "Brand", "category": "shampoo", "description": "Description", "usage": "How to use", "priceRange": "$X-Y", "keyIngredients": "ingredients" }
  ],
  "stylingTips": ["Use a sea salt spray for natural texture", "Blow dry on medium heat for volume"],
  "tips": ["General grooming tips"]
}

Provide 2-4 haircut suggestions, relevant beard care (if applicable), 3-5 products, and actionable styling tips.`;

  const result = await model.generateContent([
    prompt,
    { inlineData: { mimeType: imageFile.type || 'image/jpeg', data: base64 } },
  ]);

  const text = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(text);
}

// ═══════════ GROOMING: HAIRCARE FROM PROFILE ═════════════

export async function generateHaircareRoutine(profile: any): Promise<HairAnalysisResult> {
  const model = getModel();

  const prompt = `You are a professional hairstylist and grooming expert. Based on the user's profile, recommend haircuts, styling, and products.

User profile:
- Gender: ${profile.gender || 'unspecified'}
- Age: ${profile.age || 'unspecified'}
- Hair type: ${profile.hairType || 'unknown'}
- Face shape: ${profile.faceShape || 'unknown'}
- Has facial hair: ${profile.hasFacialHair ? 'yes' : 'no'}
- Facial hair style: ${profile.facialHairStyle || 'n/a'}
- Hair concerns: ${(profile.hairConcerns || []).join(', ') || 'none'}
- Styling preference: ${profile.stylingPreference || 'any'}

Return ONLY valid JSON:
{
  "hairType": "${profile.hairType || 'straight'}",
  "faceShape": "${profile.faceShape || 'oval'}",
  "analysis": "Based on your profile...",
  "haircutSuggestions": [
    { "name": "Cut name", "description": "Description", "suitability": "Why it suits you" }
  ],
  "beardCare": [],
  "products": [
    { "name": "Product Name", "brand": "Brand", "category": "shampoo", "description": "Description", "usage": "How to use", "priceRange": "$X-Y", "keyIngredients": "ingredients" }
  ],
  "stylingTips": ["tip1"],
  "tips": ["tip1"]
}

Provide 2-4 haircut suggestions, beard care if user has facial hair, 3-5 products, and styling tips.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(text);
}

// ═══════════ GROOMING: OUTFIT STYLING ════════════════════

export interface OutfitAnalysisResult {
  analysis: string;
  bodyType: string;
  colorPalette: { color: string; reason: string }[];
  outfits: { occasion: string; items: { type: string; name: string; color: string; style: string; description: string; priceRange: string }[]; stylingTips: string; colorPaletteReason: string }[];
  capsuleWardrobe: { type: string; name: string; color: string; versatility: string }[];
  accessoryTips: string[];
  tips: string[];
  sustainableTips: string[];
}

export async function analyzeOutfitImage(imageFile: File, profile?: any): Promise<OutfitAnalysisResult> {
  const model = getModel();

  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(imageFile);
  });

  const profileContext = profile ? `
User profile:
- Body type: ${profile.bodyType || 'unknown'}
- Style preferences: ${(profile.stylePreferences || []).join(', ') || 'any'}
- Favorite colors: ${(profile.favoriteColors || []).join(', ') || 'any'}
- Skin tone: ${profile.skinTone || 'unknown'}
- Height: ${profile.height || 'unknown'}
- Sustainable only: ${profile.sustainableOnly ? 'yes' : 'no'}
- Budget: ${profile.budget || 'any'}
- Occasions: ${(profile.occasions || []).join(', ') || 'general'}
- Gender: ${profile.gender || 'unspecified'}
` : '';

  const prompt = `You are a professional fashion stylist and personal shopper. Analyze this photo to provide outfit and styling recommendations.

${profileContext}

Return ONLY valid JSON:
{
  "analysis": "Analysis of body proportions and current style...",
  "bodyType": "athletic",
  "colorPalette": [
    { "color": "Navy Blue", "reason": "Complements your warm skin tone" }
  ],
  "outfits": [
    {
      "occasion": "Smart Casual",
      "items": [
        { "type": "top", "name": "Slim-fit Oxford Shirt", "color": "Light Blue", "style": "classic", "description": "A crisp cotton oxford shirt", "priceRange": "$30-50" }
      ],
      "stylingTips": "Roll sleeves to mid-forearm for a relaxed look",
      "colorPaletteReason": "Blue tones complement your complexion"
    }
  ],
  "capsuleWardrobe": [
    { "type": "top", "name": "White Crew-neck T-shirt", "color": "White", "versatility": "Pairs with everything from jeans to blazers" }
  ],
  "accessoryTips": ["A simple leather watch adds polish", "Match belt color to shoes"],
  "tips": ["General styling advice"],
  "sustainableTips": ["Consider thrift stores for unique finds"]
}

Provide 3-5 outfit combinations for different occasions, a 6-10 piece capsule wardrobe, and accessory advice. Use color theory for skin tone.`;

  const result = await model.generateContent([
    prompt,
    { inlineData: { mimeType: imageFile.type || 'image/jpeg', data: base64 } },
  ]);

  const text = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(text);
}

// ═══════════ GROOMING: OUTFIT FROM PROFILE ═══════════════

export async function generateOutfitRecommendations(profile: any): Promise<OutfitAnalysisResult> {
  const model = getModel();

  const prompt = `You are a professional fashion stylist and personal shopper. Based on the user's profile, create outfit recommendations.

User profile:
- Gender: ${profile.gender || 'unspecified'}
- Age: ${profile.age || 'unspecified'}
- Body type: ${profile.bodyType || 'average'}
- Style preferences: ${(profile.stylePreferences || []).join(', ') || 'smart casual'}
- Favorite colors: ${(profile.favoriteColors || []).join(', ') || 'any'}
- Skin tone: ${profile.skinTone || 'neutral'}
- Height: ${profile.height || 'average'}
- Sustainable only: ${profile.sustainableOnly ? 'yes' : 'no'}
- Budget: ${profile.budget || 'mid-range'}
- Occasions: ${(profile.occasions || []).join(', ') || 'work, casual'}
- Season: ${profile.season || 'not specified'}

Return ONLY valid JSON:
{
  "analysis": "Based on your profile...",
  "bodyType": "${profile.bodyType || 'average'}",
  "colorPalette": [
    { "color": "Color Name", "reason": "Why it suits you" }
  ],
  "outfits": [
    {
      "occasion": "Occasion",
      "items": [
        { "type": "top|bottom|shoes|accessory|outerwear", "name": "Item Name", "color": "Color", "style": "Style", "description": "Description", "priceRange": "$X-Y" }
      ],
      "stylingTips": "How to style",
      "colorPaletteReason": "Why these colors work"
    }
  ],
  "capsuleWardrobe": [
    { "type": "category", "name": "Item", "color": "Color", "versatility": "How it mixes" }
  ],
  "accessoryTips": ["tip1"],
  "tips": ["tip1"],
  "sustainableTips": ["tip1"]
}

Provide 3-5 outfit combos for the user's occasions, a 6-10 piece capsule wardrobe, color palette based on skin tone, and accessory advice.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(text);
}

// ═══════════ VISUAL ANALYSIS INTEGRATION ════════════════

export interface VisualAnalysisMetric {
  name: string;
  score: number;
  description: string;
  severity: string;
  recommendations: string[];
}

export interface DetailedSkinAnalysis {
  overallScore: number;
  summary: string;
  detectedConcerns: string[];
  metrics: VisualAnalysisMetric[];
  recommendations: string[];
  productSuggestions: string[];
  detailedResult: {
    zones: { zone: string; condition: string; score: number }[];
    hydrationLevel: string;
    poreAnalysis: string;
    pigmentation: string;
    textureAssessment: string;
    agingIndicators: string[];
    environmentalDamage: string;
  };
}

export async function performDetailedSkinAnalysis(imageFile: File, profile?: any): Promise<DetailedSkinAnalysis> {
  const model = getModel();

  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(imageFile);
  });

  const profileCtx = profile ? `User: ${profile.gender || ''}, age ${profile.age || 'unknown'}, skin type: ${profile.skincare?.skinType || 'unknown'}, concerns: ${(profile.skincare?.concerns || []).join(', ') || 'none'}, season: ${profile.currentSeason || 'unknown'}` : '';

  const prompt = `You are an advanced AI dermatologist performing a comprehensive skin analysis. Analyze this photo with clinical precision.

${profileCtx}

Analyze ALL of these: hydration, pore size, pigmentation/dark spots, texture, fine lines/wrinkles, redness/inflammation, sun damage, elasticity, and acne/breakouts.

Return ONLY valid JSON:
{
  "overallScore": 72,
  "summary": "Comprehensive assessment paragraph...",
  "detectedConcerns": ["dehydration", "enlarged_pores", "mild_hyperpigmentation"],
  "metrics": [
    { "name": "Hydration", "score": 65, "description": "Skin appears slightly dehydrated", "severity": "mild", "recommendations": ["Hyaluronic acid serum", "Drink more water"] },
    { "name": "Pore Health", "score": 70, "description": "Enlarged pores in T-zone", "severity": "moderate", "recommendations": ["Niacinamide serum", "BHA exfoliant"] },
    { "name": "Texture", "score": 75, "description": "Generally smooth with minor roughness", "severity": "mild", "recommendations": ["AHA exfoliant weekly"] },
    { "name": "Pigmentation", "score": 80, "description": "Mostly even tone", "severity": "mild", "recommendations": ["Vitamin C serum"] },
    { "name": "Elasticity", "score": 85, "description": "Good skin firmness", "severity": "none", "recommendations": ["Retinol for maintenance"] },
    { "name": "Sun Damage", "score": 78, "description": "Minor sun spots detected", "severity": "mild", "recommendations": ["SPF 50 daily"] }
  ],
  "recommendations": ["top priority actions"],
  "productSuggestions": ["Specific product name - Brand - $price"],
  "detailedResult": {
    "zones": [
      { "zone": "Forehead", "condition": "Slightly oily with fine lines", "score": 70 },
      { "zone": "T-Zone", "condition": "Enlarged pores, excess sebum", "score": 65 },
      { "zone": "Cheeks", "condition": "Well-hydrated, clear", "score": 85 },
      { "zone": "Chin/Jaw", "condition": "Mild congestion", "score": 72 },
      { "zone": "Under-eye", "condition": "Slight dark circles", "score": 68 }
    ],
    "hydrationLevel": "Moderately dehydrated",
    "poreAnalysis": "Enlarged in T-zone, normal elsewhere",
    "pigmentation": "Even with minor spots",
    "textureAssessment": "Generally smooth",
    "agingIndicators": ["fine lines around eyes"],
    "environmentalDamage": "Minimal UV damage"
  }
}

Provide 6+ metrics scored 0-100, analyze 5 facial zones, and give 5+ product suggestions with real brand names.`;

  const result = await model.generateContent([
    { inlineData: { mimeType: imageFile.type, data: base64 } },
    { text: prompt },
  ]);
  const text = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(text);
}

export interface DetailedHairFaceAnalysis {
  overallScore: number;
  summary: string;
  detectedConcerns: string[];
  metrics: VisualAnalysisMetric[];
  recommendations: string[];
  productSuggestions: string[];
  detailedResult: {
    faceShape: string;
    faceSymmetry: string;
    hairType: string;
    hairCondition: string;
    hairDensity: string;
    scalpHealth: string;
    bestHairstyles: { name: string; description: string; suitability: string }[];
    facialHairAdvice: string;
    colorRecommendation: string;
  };
}

export async function performDetailedHairFaceAnalysis(imageFile: File, profile?: any): Promise<DetailedHairFaceAnalysis> {
  const model = getModel();

  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(imageFile);
  });

  const profileCtx = profile ? `User: ${profile.gender || ''}, age ${profile.age || 'unknown'}, hair type: ${profile.haircare?.hairType || 'unknown'}, face shape: ${profile.haircare?.faceShape || 'unknown'}, has facial hair: ${profile.haircare?.hasFacialHair ? 'yes' : 'no'}` : '';

  const prompt = `You are an expert hair stylist and face shape analyst. Perform a comprehensive hair and face shape analysis from this photo.

${profileCtx}

Analyze: face shape, facial proportions, hair type/texture, hair thickness, scalp health, hair damage, styling potential, and facial hair grooming.

Return ONLY valid JSON:
{
  "overallScore": 78,
  "summary": "Comprehensive hair & face analysis...",
  "detectedConcerns": ["slight_frizz", "dry_ends", "thinning_temples"],
  "metrics": [
    { "name": "Hair Health", "score": 72, "description": "Moderate condition with dry ends", "severity": "mild", "recommendations": ["Deep conditioning weekly"] },
    { "name": "Scalp Health", "score": 80, "description": "Generally healthy scalp", "severity": "none", "recommendations": ["Scalp massage routine"] },
    { "name": "Hair Density", "score": 75, "description": "Average density, slight thinning", "severity": "mild", "recommendations": ["Biotin supplements"] },
    { "name": "Face Symmetry", "score": 82, "description": "Good facial balance", "severity": "none", "recommendations": ["Current styles complement face well"] },
    { "name": "Style Potential", "score": 85, "description": "Versatile texture for multiple styles", "severity": "none", "recommendations": ["Try textured crop"] }
  ],
  "recommendations": ["top actions"],
  "productSuggestions": ["Product - Brand - $price"],
  "detailedResult": {
    "faceShape": "oval",
    "faceSymmetry": "Balanced, slightly wider forehead",
    "hairType": "Wavy, medium texture",
    "hairCondition": "Fair - moderate dryness at ends",
    "hairDensity": "Medium density",
    "scalpHealth": "Healthy, no visible issues",
    "bestHairstyles": [
      { "name": "Textured Crop", "description": "Short sides with textured top", "suitability": "Excellent for your face shape" },
      { "name": "Side Part", "description": "Classic side-swept style", "suitability": "Complements jawline" },
      { "name": "Quiff", "description": "Volume on top, clean sides", "suitability": "Adds vertical balance" }
    ],
    "facialHairAdvice": "A short stubble beard would complement your face shape well",
    "colorRecommendation": "Natural tones or subtle highlights would enhance your look"
  }
}

Provide 5+ metrics, 3+ hairstyle suggestions with descriptions, and specific product recommendations.`;

  const result = await model.generateContent([
    { inlineData: { mimeType: imageFile.type, data: base64 } },
    { text: prompt },
  ]);
  const text = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(text);
}

export interface DetailedBodyStyleAnalysis {
  overallScore: number;
  summary: string;
  detectedConcerns: string[];
  metrics: VisualAnalysisMetric[];
  recommendations: string[];
  productSuggestions: string[];
  detailedResult: {
    bodyType: string;
    proportions: string;
    skinTone: string;
    colorSeason: string;
    bestColors: string[];
    avoidColors: string[];
    fitRecommendations: { category: string; advice: string }[];
    stylePersonality: string;
    signatureLook: string;
  };
}

export async function performDetailedBodyStyleAnalysis(imageFile: File, profile?: any): Promise<DetailedBodyStyleAnalysis> {
  const model = getModel();

  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(imageFile);
  });

  const profileCtx = profile ? `User: ${profile.gender || ''}, age ${profile.age || 'unknown'}, body type: ${profile.outfit?.bodyType || 'unknown'}, style prefs: ${(profile.outfit?.stylePreferences || []).join(', ') || 'none'}, skin tone: ${profile.outfit?.skinTone || 'unknown'}, height: ${profile.outfit?.height || 'unknown'}` : '';

  const prompt = `You are an expert fashion stylist and color analyst. Analyze this full/half body photo for body proportions, skin tone, and style recommendations.

${profileCtx}

Analyze: body proportions, skin undertones, color season, clothing fit suitability, style personality, and wardrobe strategy.

Return ONLY valid JSON:
{
  "overallScore": 80,
  "summary": "Body and style analysis...",
  "detectedConcerns": ["broad_shoulders_for_fitted_shirts"],
  "metrics": [
    { "name": "Proportion Balance", "score": 82, "description": "Well-balanced torso to leg ratio", "severity": "none", "recommendations": ["Fitted clothing works well"] },
    { "name": "Color Harmony", "score": 78, "description": "Warm undertones detected", "severity": "none", "recommendations": ["Earth tones, warm blues"] },
    { "name": "Current Fit", "score": 70, "description": "Clothing slightly oversized", "severity": "mild", "recommendations": ["Try slim fit options"] },
    { "name": "Style Cohesion", "score": 75, "description": "Good base, room to refine", "severity": "mild", "recommendations": ["Build capsule wardrobe"] },
    { "name": "Posture", "score": 85, "description": "Good natural posture", "severity": "none", "recommendations": ["Structured blazers will look great"] }
  ],
  "recommendations": ["top style actions"],
  "productSuggestions": ["Item - Brand - $price range"],
  "detailedResult": {
    "bodyType": "athletic",
    "proportions": "Broad shoulders, narrow waist, average height",
    "skinTone": "warm medium",
    "colorSeason": "Autumn",
    "bestColors": ["navy", "olive", "burgundy", "camel", "terracotta"],
    "avoidColors": ["neon yellow", "pastel pink", "icy blue"],
    "fitRecommendations": [
      { "category": "Tops", "advice": "Slim-fit or athletic-cut shirts" },
      { "category": "Bottoms", "advice": "Straight or tapered trousers" },
      { "category": "Outerwear", "advice": "Structured blazers, bomber jackets" },
      { "category": "Footwear", "advice": "Chelsea boots, clean sneakers" }
    ],
    "stylePersonality": "Smart casual with athletic influence",
    "signatureLook": "Well-fitted chinos, quality knit, clean sneakers"
  }
}

Provide 5+ metrics, 4+ fit category recommendations, and 5+ best/avoid colors.`;

  const result = await model.generateContent([
    { inlineData: { mimeType: imageFile.type, data: base64 } },
    { text: prompt },
  ]);
  const text = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(text);
}

export interface ProgressComparisonResult {
  overallImprovement: number;
  summary: string;
  metricComparisons: { name: string; before: number; after: number; change: number; insight: string }[];
  improvements: string[];
  areasToWatch: string[];
  nextSteps: string[];
}

export async function compareProgressPhotos(beforeFile: File, afterFile: File, analysisType: string): Promise<ProgressComparisonResult> {
  const model = getModel();

  const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const [beforeBase64, afterBase64] = await Promise.all([toBase64(beforeFile), toBase64(afterFile)]);

  const typeLabel = analysisType === 'skin' ? 'skin/complexion' : analysisType === 'hair_face' ? 'hair and face' : 'body and style';

  const prompt = `You are an expert analyst comparing before-and-after ${typeLabel} photos. The FIRST image is BEFORE and the SECOND image is AFTER.

Compare and identify improvements, regressions, and areas to continue working on.

Return ONLY valid JSON:
{
  "overallImprovement": 15,
  "summary": "Noticeable improvements in... Areas to continue working on...",
  "metricComparisons": [
    { "name": "Metric Name", "before": 65, "after": 78, "change": 13, "insight": "Significant improvement due to..." }
  ],
  "improvements": ["Clear improvement in x", "Better y"],
  "areasToWatch": ["Continue working on z"],
  "nextSteps": ["Recommended next actions"]
}

Provide honest, detailed comparison with 4+ metric comparisons scored 0-100.`;

  const result = await model.generateContent([
    { inlineData: { mimeType: beforeFile.type, data: beforeBase64 } },
    { inlineData: { mimeType: afterFile.type, data: afterBase64 } },
    { text: prompt },
  ]);
  const text = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(text);
}

export interface VirtualTryOnResult {
  suitabilityScore: number;
  analysis: string;
  pros: string[];
  cons: string[];
  alternatives: { name: string; reason: string }[];
  colorCompatibility: string;
  overallVerdict: string;
}

export async function virtualStyleTryOn(personFile: File, description: string, profile?: any): Promise<VirtualTryOnResult> {
  const model = getModel();

  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(personFile);
  });

  const profileCtx = profile ? `User: ${profile.gender || ''}, age ${profile.age || 'unknown'}, body type: ${profile.outfit?.bodyType || 'unknown'}, style: ${(profile.outfit?.stylePreferences || []).join(', ') || 'any'}` : '';

  const prompt = `You are an expert fashion consultant. The user wants to try on this look/style: "${description}"

Analyze the person's photo and determine how well this style would suit them.

${profileCtx}

Return ONLY valid JSON:
{
  "suitabilityScore": 78,
  "analysis": "Detailed assessment of how this style would look...",
  "pros": ["Would complement your frame", "Color works with skin tone"],
  "cons": ["May be too tight in shoulders"],
  "alternatives": [
    { "name": "Alternative option", "reason": "Would suit better because..." }
  ],
  "colorCompatibility": "The colors would harmonize well with your warm undertones",
  "overallVerdict": "Summary recommendation"
}

Be honest and constructive. Provide 3+ pros, 1-3 cons, and 2+ alternatives.`;

  const result = await model.generateContent([
    { inlineData: { mimeType: personFile.type, data: base64 } },
    { text: prompt },
  ]);
  const text = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(text);
}

// ─── AI Brain Dashboard Intelligence ─────────────────────────────────────────

export interface AIBrainInput {
  userName: string;
  currentTime: string;
  dayOfWeek: string;
  weather: {
    condition: string;
    tempC: number;
    feelsLikeC: number;
    humidity: number;
    isRaining: boolean;
    isHot: boolean;
    location: string;
  };
  context: {
    sleepHoursLastNight: number;    // 0 if unknown
    hrv: number;                    // 0 if unknown
    fitnessGoal: string;
    recentWorkoutCategories: string[];
    workoutsCompletedToday: number;
  };
  education: {
    enrolledCourses: number;
    completedCourses: number;
    pendingAssignments: number;
    upcomingQuizzes: number;
    recentQuizScores: number[];
    studyPlansActive: number;
    textbooksUploaded: number;
    lecturesCompleted: number;
    lecturesMissed: number;
    groupsJoined: number;
    meetingsScheduled: number;
  };
  fitness: {
    workoutsThisWeek: number;
    weeklyGoal: number;
    totalMinutesThisWeek: number;
    avgFormScore: number;
    activePlan: string | null;
    lastWorkoutDate: string | null;
    streakDays: number;
    customWorkouts: number;
  };
  health: {
    sleepScore: number;
    avgHeartRate: number;
    stressScore: number;
    readinessScore: number;
    stepsToday: number;
    caloriesBurned: number;
    hydrationLevel: number;
    hasWearable: boolean;
  };
  dietary: {
    caloriesConsumed: number;
    calorieTarget: number;
    proteinConsumed: number;
    proteinTarget: number;
    carbsConsumed: number;
    carbsTarget: number;
    fatConsumed: number;
    fatTarget: number;
    mealsLogged: number;
    mealsPerDayTarget: number;
    adherenceRate: number;
    activeMealPlan: boolean;
    groceryItemsPending: number;
    supplementsDue: number;
  };
  injury: {
    activeInjuries: { bodyPart: string; painScore: number; daysSinceOnset: number }[];
    rehabAdherence: number;
    movementRestrictions: string[];
  };
  shopping: {
    pendingItems: number;
    totalLists: number;
    checkedItems: number;
    upcomingDeliveries: number;
    lowStockItems: string[];
  };
  groups: {
    activeGroups: number;
    pendingTasks: number;
    upcomingMeetings: number;
    missedSessions: number;
    totalAssignments: number;
    totalMembers: number;
  };
}

export async function generateAIBrainDashboard(input: AIBrainInput): Promise<string> {
  const model = getModel();

  // Derive human-readable energy context from real data
  const sleepContext = input.context.sleepHoursLastNight >= 7
    ? `good sleep (${input.context.sleepHoursLastNight}h)`
    : input.context.sleepHoursLastNight >= 5
    ? `mediocre sleep (${input.context.sleepHoursLastNight}h — below ideal)`
    : input.context.sleepHoursLastNight > 0
    ? `poor sleep (only ${input.context.sleepHoursLastNight}h — significant deficit)`
    : 'sleep unknown (no wearable)';

  const readinessContext = input.health.readinessScore >= 75
    ? 'high readiness — body is ready for training'
    : input.health.readinessScore >= 50
    ? 'moderate readiness — moderate effort only'
    : input.health.readinessScore > 0
    ? 'low readiness — prioritise recovery today'
    : 'readiness unknown';

  const weatherContext = input.weather.isRaining
    ? `rainy / wet conditions outside in ${input.weather.location}`
    : input.weather.isHot
    ? `very hot (${input.weather.tempC}\u00b0C feels like ${input.weather.feelsLikeC}\u00b0C) — outdoor exertion risky`
    : `${input.weather.condition}, ${input.weather.tempC}\u00b0C feels like ${input.weather.feelsLikeC}\u00b0C in ${input.weather.location}`;

  const injuryContext = input.injury.activeInjuries.length > 0
    ? input.injury.activeInjuries.map(i => `${i.bodyPart} (pain ${i.painScore}/10, ${i.daysSinceOnset}d)`).join(', ')
    : 'none';

  const recentCatsContext = input.context.recentWorkoutCategories.length > 0
    ? input.context.recentWorkoutCategories.join(', ')
    : 'none logged';

  const prompt = `You are the AI Brain of Heybobo — a deeply personal, context-aware intelligence layer that truly knows this user. You are NOT a generic assistant. You synthesise real biometric, behavioural, and environmental data into a highly personalised daily plan.

Current time: ${input.currentTime}
Day: ${input.dayOfWeek}
User: ${input.userName}

=== LIVE CONTEXT (use ALL of this to personalise every output) ===

SLEEP & RECOVERY:
- Last night: ${sleepContext}
- Readiness: ${readinessContext}
- HRV: ${input.context.hrv > 0 ? input.context.hrv + ' ms' : 'unknown'}
- Stress score: ${input.health.stressScore > 0 ? input.health.stressScore + '/100' : 'unknown'}
- Sleep score: ${input.health.sleepScore > 0 ? input.health.sleepScore + '/100' : 'unknown'}

WEATHER — ${weatherContext}
- Humidity: ${input.weather.humidity}%
- Raining: ${input.weather.isRaining ? 'YES — outdoor activity not ideal' : 'No'}
- Hot: ${input.weather.isHot ? 'YES — avoid intense outdoor exertion' : 'No'}

FITNESS STATE:
- Weekly workouts: ${input.fitness.workoutsThisWeek}/${input.fitness.weeklyGoal} (${input.fitness.totalMinutesThisWeek} min total)
- Streak: ${input.fitness.streakDays} days
- Active plan: ${input.fitness.activePlan ?? 'None selected'}
- Goal: ${input.context.fitnessGoal}
- Last workout: ${input.fitness.lastWorkoutDate ?? 'never'}
- Recent categories trained: ${recentCatsContext}
- Avg form score: ${input.fitness.avgFormScore}%
- Workouts done today: ${input.context.workoutsCompletedToday}

INJURIES & RESTRICTIONS:
- Active injuries: ${injuryContext}
- Rehab adherence: ${input.injury.rehabAdherence}%
- Movement restrictions: ${input.injury.movementRestrictions.length > 0 ? input.injury.movementRestrictions.join(', ') : 'none'}

DIETARY (today):
- Calories: ${input.dietary.caloriesConsumed}/${input.dietary.calorieTarget} kcal (${input.dietary.adherenceRate}%)
- Protein: ${input.dietary.proteinConsumed}/${input.dietary.proteinTarget}g
- Carbs: ${input.dietary.carbsConsumed}/${input.dietary.carbsTarget}g | Fat: ${input.dietary.fatConsumed}/${input.dietary.fatTarget}g
- Meals logged: ${input.dietary.mealsLogged}/${input.dietary.mealsPerDayTarget}
- Supplements due: ${input.dietary.supplementsDue}
- Grocery items pending: ${input.dietary.groceryItemsPending}

HEALTH VITALS:
- Heart rate: ${input.health.avgHeartRate > 0 ? input.health.avgHeartRate + ' bpm' : 'unknown'}
- Steps today: ${input.health.stepsToday}
- Calories burned: ${input.health.caloriesBurned}
- Wearable: ${input.health.hasWearable ? 'connected' : 'not connected'}

EDUCATION:
- Enrolled: ${input.education.enrolledCourses} courses, ${input.education.completedCourses} completed
- Pending assignments: ${input.education.pendingAssignments}
- Lectures: ${input.education.lecturesCompleted} done, ${input.education.lecturesMissed} missed
- Recent quiz scores: ${input.education.recentQuizScores.length > 0 ? input.education.recentQuizScores.join(', ') + '%' : 'none'}
- Study plans active: ${input.education.studyPlansActive}

SHOPPING / RESOURCES:
- Pending shopping items: ${input.shopping.pendingItems}
- Total lists: ${input.shopping.totalLists}
- Low stock items: ${input.shopping.lowStockItems.length > 0 ? input.shopping.lowStockItems.join(', ') : 'none flagged'}

GROUPS / COMMUNITY:
- Active groups: ${input.groups.activeGroups}
- Pending tasks: ${input.groups.pendingTasks}
- Upcoming meetings: ${input.groups.upcomingMeetings}

=== INTELLIGENCE RULES (apply strictly) ===

1. SLEEP-FIRST LOGIC:
   - Sleep < 6h OR readiness < 50: Set energyLevel="low". Recommend restorative yoga or walk instead of HIIT/strength. Reduce study sessions to 25-min Pomodoros. Flag rest as critical priority.
   - Sleep 6-7h OR readiness 50-74: Set energyLevel="medium". Moderate workout (not max effort). Normal study.
   - Sleep >= 7h AND readiness >= 75: Set energyLevel="high". Full training session fine.

2. WEATHER-AWARE PLANNING:
   - Raining: Recommend indoor workout alternatives. Note "great day to study" or "catch up on courses".
   - Very hot (>35°C): Warn against outdoor exercise. Suggest indoor gym or early morning activity. Remind to hydrate extra.
   - Normal: Suggest outdoor run/walk if steps are low.

3. INJURY-ADAPTIVE:
   - Any active injury: NEVER suggest movements that use the injured body part. Suggest rehab first, then non-conflicting workout.
   - High pain score (>6/10): Flag as critical. Suggest rest, ice, rehab only.
   - Shopping nudge: If injured, suggest relevant recovery items (e.g., foam roller, compression sleeve, protein for tissue repair).

4. DIETARY SMART NUDGES:
   - Protein deficit (consumed < 60% of target): Alert + recommend high-protein meal AND proactively suggest buying protein-rich foods or supplements via shopping nudge.
   - No meals logged by midday: Push alert to log meals.
   - Supplements due: Remind in priorities.

5. FITNESS MOMENTUM:
   - If streak >= 3 days: Acknowledge it in todayFocus. Encourage continuation.
   - If last workout was >3 days ago: Gentle nudge to get back on track.
   - If weekly goal almost met (e.g., 3/4): Motivate to complete.
   - Suggest workout category NOT recently trained (e.g., if only strength logged, suggest cardio).

6. PROACTIVE SHOPPING NUDGES (not generic — must be based on actual data):
   - Low protein intake consistently → “Pick up protein powder or Greek yoghurt”
   - Active injury → “Consider a foam roller / compression sleeve for recovery”
   - Very hot weather → “Stock up on electrolyte drinks for hydration”
   - Steps low + raining → “A resistance band set for indoor training might help”
   - Grocery items pending > 3 → Include shopping list reminder

7. CROSS-MODULE INTELLIGENCE:
   - Low sleep + heavy study + workout = burnout risk — flag as risk cross-insight
   - Good sleep + protein on track + workout = performance opportunity — flag as opportunity
   - Injury + continuing hard workouts = serious risk — flag as critical

8. TODAY’S FOCUS is the most important output — it must be specific, personal, and NOT generic:
   - Use the person’s name
   - Reference actual data (e.g., “you slept 5.5h”, “it’s raining in London”, “your protein is at 40%”)
   - Give 3-5 focused, ordered bullets for what to do today
   - Keep the tone warm, human, and motivating

=== OUTPUT JSON SCHEMA ===

{
  "todayFocus": {
    "headline": "Short title capturing today’s situation (8-12 words)",
    "body": "2-3 sentences using real data to explain today’s recommended energy level and why. Reference sleep, weather, or injury specifically.",
    "energyLevel": "low|medium|high",
    "suggestedFocus": [
      "Specific bullet 1 — what to do first and why",
      "Specific bullet 2",
      "Specific bullet 3"
    ],
    "weatherNote": "One sentence about how weather affects today’s plan",
    "shoppingNudge": "One specific item or category to buy based on a real need today (null if no genuine need)"
  },
  "nudge": "Single 12-20 word proactive push message the user should see right now — most urgent thing",
  "priorities": [
    {
      "id": "p1",
      "title": "Short action title",
      "description": "Specific, data-driven description referencing actual numbers",
      "module": "education|fitness|health|dietary|injury|shopping|groups",
      "level": "critical|high|medium|low",
      "icon": "Assignment|FitnessCenter|Healing|Restaurant|ShoppingCart|Groups|MonitorHeart"
    }
  ],
  "alerts": [
    {
      "id": "a1",
      "title": "Alert title",
      "description": "What’s happening and the specific implication",
      "module": "education|fitness|health|dietary|injury|shopping|groups",
      "severity": "error|warning|info|success",
      "icon": "Warning|Error|Info|CheckCircle"
    }
  ],
  "schedule": [
    {
      "id": "s1",
      "title": "Event name",
      "time": "HH:MM AM/PM",
      "module": "education|fitness|health|dietary|groups",
      "icon": "School|FitnessCenter|Restaurant|Groups|MonitorHeart",
      "color": "#hex"
    }
  ],
  "moduleInsights": [
    {
      "module": "education",
      "label": "Education",
      "score": 75,
      "trend": "up|down|stable",
      "summary": "One-line summary with actual numbers",
      "details": ["Detail 1 with data", "Detail 2 with data"]
    }
  ],
  "crossInsights": [
    {
      "id": "ci1",
      "title": "Cross-module insight title",
      "description": "Specific cross-module connection with data points",
      "modules": ["fitness", "dietary"],
      "type": "pattern|risk|opportunity|sync"
    }
  ],
  "recommendations": [
    {
      "id": "r1",
      "title": "Recommendation title",
      "description": "Specific, data-driven recommendation with reason",
      "type": "do-now|recover|learn|buy|plan|monitor",
      "module": "education|fitness|health|dietary|injury|shopping|groups"
    }
  ],
  "weeklySummary": {
    "wins": ["Specific win with data"],
    "risks": ["Specific risk with data"],
    "missedItems": ["Missed item"],
    "adherence": { "education": 80, "fitness": 65, "dietary": 70, "health": 90 },
    "predictedPriorities": ["Next week priority"]
  }
}

CRITICAL: Every output must reference actual numbers from the data. Never be vague. Never give generic advice. Return ONLY valid JSON — no markdown.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return text;
}

// ─── AI Brain Chatbot ────────────────────────────────────────────────────────

export interface ChatWithBrainResult {
  text?: string;
  functionCall?: { name: string; args: Record<string, any> };
}

export async function chatWithBrain(
  message: string,
  history: { role: 'user' | 'assistant'; content: string }[],
  moduleData: AIBrainInput,
  tools?: object[],
  functionResult?: { name: string; result: Record<string, any> },
): Promise<ChatWithBrainResult> {
  const model = getModel();

  const recentHistory = history
    .slice(-16)
    .map((m) => `${m.role === 'user' ? 'User' : 'Bobo'}: ${m.content}`)
    .join('\n');

  // Detect which modules the user is asking about
  const msg = message.toLowerCase();
  const wantsEducation = /education|course|quiz|study|textbook|lecture|assignment|enroll|lesson|group|meeting/i.test(msg);
  const wantsFitness = /fitness|workout|exercise|gym|training|form score|streak|active plan/i.test(msg);
  const wantsHealth = /health|sleep|heart rate|stress|readiness|steps|wearable|calories burned|vitals/i.test(msg);
  const wantsDietary = /diet|dietary|calorie|protein|carb|fat|meal|nutrition|supplement|grocery|food|macro/i.test(msg);
  const wantsInjury = /injury|injuries|pain|rehab|rehabilitation|body part/i.test(msg);
  const wantsShopping = /shopping|shop|list|grocery list|pending items/i.test(msg);
  const wantsGroups = /group|team|task|meeting|assignment|member/i.test(msg);
  const wantsAll = /everything|all module|overall|summary|overview|how am i doing|full report|all data/i.test(msg);

  const needsData = wantsEducation || wantsFitness || wantsHealth || wantsDietary || wantsInjury || wantsShopping || wantsGroups || wantsAll;

  // Build module data sections only for what's relevant
  let dataBlock = '';
  if (needsData) {
    dataBlock += '\n=== RELEVANT MODULE DATA ===\n';

    if (wantsEducation || wantsAll) {
      dataBlock += `\nEDUCATION:
- Enrolled courses: ${moduleData.education.enrolledCourses}, Completed: ${moduleData.education.completedCourses}
- Pending assignments: ${moduleData.education.pendingAssignments}, Upcoming quizzes: ${moduleData.education.upcomingQuizzes}
- Recent quiz scores: ${moduleData.education.recentQuizScores.length > 0 ? moduleData.education.recentQuizScores.join(', ') + '%' : 'None'}
- Active study plans: ${moduleData.education.studyPlansActive}, Textbooks: ${moduleData.education.textbooksUploaded}
- Lectures completed: ${moduleData.education.lecturesCompleted}, Missed: ${moduleData.education.lecturesMissed}
- Groups: ${moduleData.education.groupsJoined}, Meetings scheduled: ${moduleData.education.meetingsScheduled}\n`;
    }

    if (wantsFitness || wantsAll) {
      dataBlock += `\nFITNESS:
- Workouts this week: ${moduleData.fitness.workoutsThisWeek}/${moduleData.fitness.weeklyGoal}
- Minutes this week: ${moduleData.fitness.totalMinutesThisWeek}
- Avg form score: ${moduleData.fitness.avgFormScore}%
- Active plan: ${moduleData.fitness.activePlan ?? 'None'}
- Last workout: ${moduleData.fitness.lastWorkoutDate ?? 'Never'}
- Streak: ${moduleData.fitness.streakDays} days
- Custom workouts: ${moduleData.fitness.customWorkouts}\n`;
    }

    if (wantsHealth || wantsAll) {
      dataBlock += `\nHEALTH:
- Sleep score: ${moduleData.health.sleepScore}/100
- Avg heart rate: ${moduleData.health.avgHeartRate} bpm
- Stress score: ${moduleData.health.stressScore}/100
- Readiness score: ${moduleData.health.readinessScore}/100
- Steps today: ${moduleData.health.stepsToday}
- Calories burned: ${moduleData.health.caloriesBurned}
- Wearable connected: ${moduleData.health.hasWearable ? 'Yes' : 'No'}\n`;
    }

    if (wantsDietary || wantsAll) {
      dataBlock += `\nDIETARY:
- Calories: ${moduleData.dietary.caloriesConsumed}/${moduleData.dietary.calorieTarget} kcal
- Protein: ${moduleData.dietary.proteinConsumed}/${moduleData.dietary.proteinTarget}g
- Carbs: ${moduleData.dietary.carbsConsumed}/${moduleData.dietary.carbsTarget}g
- Fat: ${moduleData.dietary.fatConsumed}/${moduleData.dietary.fatTarget}g
- Meals logged: ${moduleData.dietary.mealsLogged}/${moduleData.dietary.mealsPerDayTarget}
- Grocery items pending: ${moduleData.dietary.groceryItemsPending}
- Supplements due: ${moduleData.dietary.supplementsDue}\n`;
    }

    if (wantsInjury || wantsAll) {
      dataBlock += `\nINJURIES:
${moduleData.injury.activeInjuries.length > 0
        ? moduleData.injury.activeInjuries.map(i => `- ${i.bodyPart}: pain ${i.painScore}/10, ${i.daysSinceOnset} days`).join('\n')
        : '- No active injuries'}
- Rehab adherence: ${moduleData.injury.rehabAdherence}%\n`;
    }

    if (wantsShopping || wantsAll) {
      dataBlock += `\nSHOPPING:
- Pending items: ${moduleData.shopping.pendingItems}
- Total lists: ${moduleData.shopping.totalLists}, Checked: ${moduleData.shopping.checkedItems}\n`;
    }

    if (wantsGroups || wantsAll) {
      dataBlock += `\nGROUPS:
- Active groups: ${moduleData.groups.activeGroups}
- Pending tasks: ${moduleData.groups.pendingTasks}
- Upcoming meetings: ${moduleData.groups.upcomingMeetings}
- Total assignments: ${moduleData.groups.totalAssignments}\n`;
    }
  }

  const prompt = `You are Bobo, a friendly and conversational AI assistant on the Heybobo platform. The user's name is ${moduleData.userName}.

BEHAVIOR:
- For casual conversation (greetings, jokes, general questions, chitchat), just be friendly and conversational. Do NOT dump module data or statistics.
- Only reference module data when the user specifically asks about a module (education, fitness, health, dietary, injuries, shopping, groups).
- Keep responses natural and concise. Don't over-explain.
- Use markdown sparingly — only for lists or emphasis when it helps readability.
${dataBlock}
${recentHistory ? `=== CONVERSATION ===\n${recentHistory}\n` : ''}
${functionResult
    ? `=== ACTION COMPLETED ===\nYou just executed the action "${functionResult.name}" on behalf of the user.\nResult: ${JSON.stringify(functionResult.result)}\nNow confirm this to the user in a friendly, concise way. Mention any key details (e.g. quiz title, meeting code, workout logged). Do NOT say you cannot do things — the action is already done.\n`
    : `User: ${message}

RULES:
1. If this is casual conversation, respond naturally without referencing any data.
2. If the user asks about specific modules, use ONLY the data provided above — never invent numbers.
3. If data is zero or empty, mention the user hasn't used that module yet.
4. Be warm and brief. No walls of text for simple questions.
5. If the user asks you to CREATE, ADD, LOG, SCHEDULE, or SET something — use the available tools. Never say you cannot do it.`}

Respond as Bobo:`;

  // If tools are provided and this isn't a follow-up after function execution,
  // use function calling mode
  if (tools && tools.length > 0 && !functionResult) {
    const requestOptions: any = {
      tools,
    };

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      ...requestOptions,
    });

    const candidate = result.response.candidates?.[0];
    const part = candidate?.content?.parts?.[0];

    if (part && 'functionCall' in part && part.functionCall) {
      return {
        functionCall: {
          name: part.functionCall.name,
          args: part.functionCall.args as Record<string, any>,
        },
      };
    }

    return { text: result.response.text() };
  }

  // Plain text mode (no tools or follow-up after function execution)
  const result = await model.generateContent(prompt);
  return { text: result.response.text() };
}
