import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createUserStorage } from '@/lib/userStorage';

// ─── Enums ──────────────────────────────────────────────
export enum MealType {
  BREAKFAST = 'breakfast',
  LUNCH = 'lunch',
  DINNER = 'dinner',
  SNACK = 'snack',
}

export enum DietGoal {
  LOSE_WEIGHT = 'lose_weight',
  GAIN_WEIGHT = 'gain_weight',
  MAINTAIN = 'maintain',
  BUILD_MUSCLE = 'build_muscle',
  IMPROVE_HEALTH = 'improve_health',
}

export enum DietType {
  STANDARD = 'standard',
  VEGETARIAN = 'vegetarian',
  VEGAN = 'vegan',
  KETO = 'keto',
  PALEO = 'paleo',
  MEDITERRANEAN = 'mediterranean',
  LOW_CARB = 'low_carb',
  HIGH_PROTEIN = 'high_protein',
  GLUTEN_FREE = 'gluten_free',
  DAIRY_FREE = 'dairy_free',
  CUSTOM = 'custom',
}

// ─── Types ──────────────────────────────────────────────
export interface DietaryProfile {
  goal: DietGoal | '';
  dietType: DietType | '';
  dailyCalorieTarget: number;
  dailyProteinTargetG: number;
  dailyCarbsTargetG: number;
  dailyFatTargetG: number;
  dailyWaterTargetMl: number;
  allergies: string[];
  restrictions: string[];
  preferredCuisines: string[];
  mealsPerDay: number;
  onboardingComplete: boolean;
}

interface DietaryProfileState extends DietaryProfile {
  setGoal: (goal: DietGoal) => void;
  setDietType: (type: DietType) => void;
  setCalorieTarget: (cal: number) => void;
  setMacroTargets: (protein: number, carbs: number, fat: number) => void;
  setWaterTarget: (ml: number) => void;
  setAllergies: (allergies: string[]) => void;
  setRestrictions: (restrictions: string[]) => void;
  setPreferredCuisines: (cuisines: string[]) => void;
  setMealsPerDay: (meals: number) => void;
  completeOnboarding: () => void;
  resetProfile: () => void;
}

const defaultProfile: DietaryProfile = {
  goal: '',
  dietType: '',
  dailyCalorieTarget: 2000,
  dailyProteinTargetG: 50,
  dailyCarbsTargetG: 250,
  dailyFatTargetG: 65,
  dailyWaterTargetMl: 2500,
  allergies: [],
  restrictions: [],
  preferredCuisines: [],
  mealsPerDay: 3,
  onboardingComplete: false,
};

export const useDietaryProfileStore = create<DietaryProfileState>()(
  persist(
    (set) => ({
      ...defaultProfile,

      setGoal: (goal) => set({ goal }),
      setDietType: (dietType) => set({ dietType }),
      setCalorieTarget: (dailyCalorieTarget) => set({ dailyCalorieTarget }),
      setMacroTargets: (protein, carbs, fat) =>
        set({ dailyProteinTargetG: protein, dailyCarbsTargetG: carbs, dailyFatTargetG: fat }),
      setWaterTarget: (dailyWaterTargetMl) => set({ dailyWaterTargetMl }),
      setAllergies: (allergies) => set({ allergies }),
      setRestrictions: (restrictions) => set({ restrictions }),
      setPreferredCuisines: (preferredCuisines) => set({ preferredCuisines }),
      setMealsPerDay: (mealsPerDay) => set({ mealsPerDay }),
      completeOnboarding: () => set({ onboardingComplete: true }),
      resetProfile: () => set(defaultProfile),
    }),
    { name: 'eduplatform-dietary-profile', storage: createUserStorage() },
  ),
);
