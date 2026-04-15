/**
 * Bobo Agent Tools
 *
 * Defines Gemini function declarations + executor that runs them against
 * the app's Zustand stores. This enables Bobo to create quizzes, log
 * workouts, add shopping items, schedule meetings, log injuries, etc.
 * on behalf of the user.
 */

import { useAITutorStore } from '@/store/aiTutorStore';
import { useWorkoutSystemStore, EXERCISE_DATABASE, PRESET_PLANS } from '@/store/workoutSystemStore';
import { useActivityTrackingStore } from '@/store/activityTrackingStore';
import { useShoppingListStore } from '@/store/shoppingListStore';
import { useMeetingStore } from '@/store/meetingStore';
import { useInjuryStore } from '@/store/injuryStore';
import { useAIBrainStore } from '@/store/aiBrainStore';
import { useBudgetStore } from '@/store/budgetStore';
import { useGroupStore } from '@/store/groupStore';
import { useCampusMarketplaceStore } from '@/store/campusMarketplaceStore';
import { useDietaryProfileStore } from '@/store/dietaryProfileStore';
import { useUIStore } from '@/store/uiStore';

// ─── Gemini-compatible tool declarations ─────────────────────────────────────

export const AGENT_TOOLS = [
  {
    functionDeclarations: [
      {
        name: 'create_quiz',
        description:
          'Creates a new quiz and saves it in the AI Tutor module. Use when the user asks to create, generate, or make a quiz on any topic.',
        parameters: {
          type: 'OBJECT',
          properties: {
            title: { type: 'STRING', description: 'The quiz title, e.g. "Biology Quiz: Cell Division"' },
            topic: { type: 'STRING', description: 'The topic or subject of the quiz' },
            questions: {
              type: 'ARRAY',
              description: 'List of quiz questions',
              items: {
                type: 'OBJECT',
                properties: {
                  question: { type: 'STRING' },
                  options: { type: 'ARRAY', items: { type: 'STRING' } },
                  correctIndex: { type: 'NUMBER', description: '0-based index of the correct option' },
                  explanation: { type: 'STRING', description: 'Why the answer is correct' },
                },
                required: ['question', 'options', 'correctIndex', 'explanation'],
              },
            },
          },
          required: ['title', 'topic', 'questions'],
        },
      },

      {
        name: 'create_study_plan',
        description:
          'Creates a study plan and saves it in the AI Tutor module. Use when the user asks to create or schedule a study plan for any subject.',
        parameters: {
          type: 'OBJECT',
          properties: {
            title: { type: 'STRING', description: 'The study plan title, e.g. "30-Day Python Mastery"' },
            subject: { type: 'STRING', description: 'The subject or topic to study' },
            totalDays: { type: 'NUMBER', description: 'Total number of days for the plan' },
            hoursPerDay: { type: 'NUMBER', description: 'Study hours per day' },
            chapters: {
              type: 'ARRAY',
              description: 'List of chapters or topics to cover',
              items: {
                type: 'OBJECT',
                properties: {
                  title: { type: 'STRING' },
                  day: { type: 'NUMBER' },
                  durationHours: { type: 'NUMBER' },
                  notes: { type: 'STRING' },
                },
                required: ['title', 'day', 'durationHours'],
              },
            },
          },
          required: ['title', 'subject', 'totalDays', 'hoursPerDay', 'chapters'],
        },
      },

      {
        name: 'create_custom_workout',
        description:
          'Creates and saves a custom workout in the Fitness module. Use when the user asks to create, build, design, or generate a custom workout plan with specific exercises.',
        parameters: {
          type: 'OBJECT',
          properties: {
            name: { type: 'STRING', description: 'Name of the custom workout, e.g. "Full Body Blast" or "Morning HIIT"' },
            description: { type: 'STRING', description: 'Brief description of the workout' },
            exercises: {
              type: 'ARRAY',
              description: 'List of exercises to include in the workout',
              items: {
                type: 'OBJECT',
                properties: {
                  name: { type: 'STRING', description: 'Exercise name, e.g. "Push-ups", "Burpees", "Squats"' },
                  sets: { type: 'NUMBER', description: 'Number of sets' },
                  reps: { type: 'NUMBER', description: 'Reps per set (omit for duration-based exercises)' },
                  durationSeconds: { type: 'NUMBER', description: 'Duration in seconds for timed exercises (omit for rep-based)' },
                  restSeconds: { type: 'NUMBER', description: 'Rest time between sets in seconds' },
                },
                required: ['name', 'sets'],
              },
            },
          },
          required: ['name', 'exercises'],
        },
      },

      {
        name: 'log_workout',
        description:
          'Logs a completed workout session in the Fitness module. Use when the user asks to log, record, save, or add a workout they already did.',
        parameters: {
          type: 'OBJECT',
          properties: {
            workoutName: { type: 'STRING', description: 'Name of the workout, e.g. "Upper Body Strength"' },
            durationMinutes: { type: 'NUMBER', description: 'Duration of the workout in minutes' },
            feeling: {
              type: 'STRING',
              enum: ['great', 'good', 'okay', 'tired', 'exhausted'],
              description: 'How the user felt after the workout',
            },
            exercises: {
              type: 'ARRAY',
              description: 'List of exercises performed (optional)',
              items: {
                type: 'OBJECT',
                properties: {
                  name: { type: 'STRING' },
                  sets: { type: 'NUMBER' },
                  reps: { type: 'NUMBER' },
                },
                required: ['name'],
              },
            },
          },
          required: ['workoutName', 'durationMinutes', 'feeling'],
        },
      },

      {
        name: 'add_shopping_item',
        description:
          'Adds an item to the shopping list. Creates a new list if none exists. Use when user asks to add, buy, or shop for something.',
        parameters: {
          type: 'OBJECT',
          properties: {
            itemName: { type: 'STRING', description: 'Name of the item to add' },
            quantity: { type: 'NUMBER', description: 'Quantity needed' },
            unit: { type: 'STRING', description: 'Unit of measurement, e.g. kg, pcs, bottles' },
            category: {
              type: 'STRING',
              enum: ['produce', 'dairy', 'meat', 'seafood', 'grains', 'beverages', 'snacks', 'supplements', 'fitness-gear', 'other'],
              description: 'Category of the item',
            },
            listName: { type: 'STRING', description: 'Optional: name of the list to add to (uses first list if omitted)' },
          },
          required: ['itemName'],
        },
      },

      {
        name: 'schedule_meeting',
        description:
          'Schedules a new meeting. Use when the user asks to schedule, book, or create a meeting.',
        parameters: {
          type: 'OBJECT',
          properties: {
            title: { type: 'STRING', description: 'Meeting title' },
            description: { type: 'STRING', description: 'Meeting description or agenda' },
            scheduledAt: { type: 'STRING', description: 'ISO 8601 datetime, e.g. 2026-03-25T10:00:00.000Z' },
            durationMinutes: { type: 'NUMBER', description: 'Duration in minutes' },
          },
          required: ['title', 'scheduledAt', 'durationMinutes'],
        },
      },

      {
        name: 'log_injury',
        description:
          'Logs a new injury in the Health/Injury module. Use when the user reports an injury, pain, or physical issue.',
        parameters: {
          type: 'OBJECT',
          properties: {
            name: { type: 'STRING', description: 'Name/label for the injury, e.g. "Left Knee Strain"' },
            bodyPart: {
              type: 'STRING',
              description: 'Affected body part, e.g. knee, shoulder, back, ankle',
            },
            painScale: { type: 'NUMBER', description: 'Pain level from 1 (mild) to 10 (severe)' },
            cause: { type: 'STRING', description: 'How the injury happened' },
            notes: { type: 'STRING', description: 'Any additional notes' },
          },
          required: ['name', 'bodyPart', 'painScale'],
        },
      },

      {
        name: 'add_brain_priority',
        description:
          'Adds a custom priority or reminder to the AI Brain dashboard. Use when the user wants to set a goal, priority, or reminder.',
        parameters: {
          type: 'OBJECT',
          properties: {
            title: { type: 'STRING', description: 'Priority title' },
            description: { type: 'STRING', description: 'What this priority is about' },
            module: {
              type: 'STRING',
              enum: ['education', 'fitness', 'health', 'dietary', 'injury', 'shopping', 'groups'],
            },
            level: {
              type: 'STRING',
              enum: ['critical', 'high', 'medium', 'low'],
            },
          },
          required: ['title', 'description', 'module', 'level'],
        },
      },

      // ── Fitness / Activity ──────────────────────────────────────────────────
      {
        name: 'log_activity',
        description:
          'Logs a cardio or custom activity (run, walk, swim, cycling, yoga, etc.) in the Activity Tracking module. Use when the user says they ran, walked, swam, or did any physical activity today.',
        parameters: {
          type: 'OBJECT',
          properties: {
            type: {
              type: 'STRING',
              enum: ['running', 'walking', 'cycling', 'swimming', 'strength', 'yoga', 'hiit', 'sports', 'dance', 'other'],
              description: 'Type of activity',
            },
            name: { type: 'STRING', description: 'Activity name, e.g. "Morning Run", "Evening Walk"' },
            durationMinutes: { type: 'NUMBER', description: 'Duration in minutes' },
            caloriesBurned: { type: 'NUMBER', description: 'Estimated calories burned' },
            notes: { type: 'STRING', description: 'Any additional notes' },
          },
          required: ['type', 'durationMinutes'],
        },
      },

      {
        name: 'set_fitness_goals',
        description:
          'Sets the user\'s daily fitness goals (steps, distance, calories burned, active minutes). Use when the user wants to change or set fitness targets.',
        parameters: {
          type: 'OBJECT',
          properties: {
            steps: { type: 'NUMBER', description: 'Daily step goal' },
            distanceKm: { type: 'NUMBER', description: 'Daily distance goal in kilometres' },
            caloriesBurned: { type: 'NUMBER', description: 'Daily calories burned goal' },
            activeMinutes: { type: 'NUMBER', description: 'Daily active minutes goal' },
          },
        },
      },

      {
        name: 'set_active_plan',
        description:
          'Sets one of the preset workout plans as the user\'s active plan. Use when the user asks to start, activate, or switch to a preset workout program like "Fat Burner", "Muscle Gain", "Flexibility", etc.',
        parameters: {
          type: 'OBJECT',
          properties: {
            planName: { type: 'STRING', description: 'Name or keyword of the plan, e.g. "Fat Burner", "Muscle Gain", "Flexibility", "Athletic Performance"' },
          },
          required: ['planName'],
        },
      },

      // ── Dietary ───────────────────────────────────────────────────────────────
      {
        name: 'set_dietary_goal',
        description:
          'Updates the user\'s dietary goal, calorie target, and/or macro targets. Use when the user wants to set or change their diet goal (e.g. lose weight, build muscle).',
        parameters: {
          type: 'OBJECT',
          properties: {
            goal: {
              type: 'STRING',
              enum: ['lose_weight', 'gain_weight', 'maintain', 'build_muscle', 'improve_health'],
              description: 'The primary diet goal',
            },
            calorieTarget: { type: 'NUMBER', description: 'Daily calorie target' },
            proteinGrams: { type: 'NUMBER', description: 'Daily protein target in grams' },
            carbsGrams: { type: 'NUMBER', description: 'Daily carbs target in grams' },
            fatGrams: { type: 'NUMBER', description: 'Daily fat target in grams' },
            dietType: {
              type: 'STRING',
              enum: ['standard', 'vegetarian', 'vegan', 'keto', 'paleo', 'mediterranean', 'low_carb', 'high_protein'],
              description: 'The diet type or pattern',
            },
          },
        },
      },

      {
        name: 'set_water_target',
        description:
          'Sets the user\'s daily water intake target. Use when the user wants to set a hydration goal.',
        parameters: {
          type: 'OBJECT',
          properties: {
            millilitres: { type: 'NUMBER', description: 'Daily water target in millilitres, e.g. 2500 for 2.5 litres' },
          },
          required: ['millilitres'],
        },
      },

      // ── Injury / Health ───────────────────────────────────────────────────────
      {
        name: 'log_daily_pain',
        description:
          'Logs today\'s pain level for an existing injury. Use when the user says their injury hurts at a certain level today, or wants to update their pain score.',
        parameters: {
          type: 'OBJECT',
          properties: {
            injuryName: { type: 'STRING', description: 'Name or description of the injury to match (will find the first active matching injury)' },
            painLevel: { type: 'NUMBER', description: 'Pain level 1–10' },
            stiffness: { type: 'NUMBER', description: 'Stiffness level 1–10' },
            mobilityLevel: { type: 'NUMBER', description: 'Mobility level 1–10 where 10 is full mobility' },
            mood: { type: 'NUMBER', description: 'Mood 1–5' },
            notes: { type: 'STRING', description: 'Any notes about how you feel' },
          },
          required: ['painLevel'],
        },
      },

      {
        name: 'mark_injury_healed',
        description:
          'Marks an existing injury as fully healed. Use when the user says their injury is healed, better, or recovered.',
        parameters: {
          type: 'OBJECT',
          properties: {
            injuryName: { type: 'STRING', description: 'Name or body part of the injury to mark as healed' },
          },
          required: ['injuryName'],
        },
      },

      {
        name: 'create_rehab_program',
        description:
          'Creates a rehabilitation program for an injury. Use when the user asks to create or start a rehab or recovery program.',
        parameters: {
          type: 'OBJECT',
          properties: {
            name: { type: 'STRING', description: 'Name of the rehab program, e.g. "Knee Recovery Protocol"' },
            injuryName: { type: 'STRING', description: 'Name or body part of the related injury' },
            frequency: { type: 'STRING', description: 'How often to do the sessions, e.g. "3x per week", "Daily"' },
            durationWeeks: { type: 'NUMBER', description: 'How many weeks the program should last' },
            notes: { type: 'STRING', description: 'Additional notes or instructions' },
          },
          required: ['name', 'frequency'],
        },
      },

      {
        name: 'schedule_expert_consult',
        description:
          'Schedules an expert consultation (physio, sports medicine, dietitian, etc.) for an injury. Use when the user wants to book or schedule a medical or expert appointment.',
        parameters: {
          type: 'OBJECT',
          properties: {
            expertName: { type: 'STRING', description: 'Name of the expert or specialist' },
            specialty: { type: 'STRING', description: 'Specialty, e.g. "Physiotherapy", "Sports Medicine", "Orthopaedics"' },
            scheduledAt: { type: 'STRING', description: 'ISO 8601 datetime for the appointment' },
            injuryName: { type: 'STRING', description: 'The related injury name or body part (optional)' },
            notes: { type: 'STRING', description: 'Any notes for the appointment' },
          },
          required: ['expertName', 'specialty', 'scheduledAt'],
        },
      },

      // ── Shopping ──────────────────────────────────────────────────────────────
      {
        name: 'create_shopping_list',
        description:
          'Creates a new empty shopping list. Use when the user asks to create or start a new shopping list.',
        parameters: {
          type: 'OBJECT',
          properties: {
            name: { type: 'STRING', description: 'Name of the shopping list, e.g. "Weekly Groceries"' },
            emoji: { type: 'STRING', description: 'An emoji for the list, e.g. "🛒"' },
          },
          required: ['name'],
        },
      },

      {
        name: 'generate_diet_shopping_list',
        description:
          'Generates a shopping list based on the user\'s diet type. Use when the user asks for a grocery list for their diet (keto, vegan, etc.).',
        parameters: {
          type: 'OBJECT',
          properties: {
            dietType: {
              type: 'STRING',
              enum: ['standard', 'vegetarian', 'vegan', 'keto', 'paleo', 'mediterranean', 'low_carb', 'high_protein'],
              description: 'The diet type to generate a list for',
            },
          },
          required: ['dietType'],
        },
      },

      {
        name: 'generate_workout_shopping_list',
        description:
          'Generates a shopping list with equipment needed for workouts. Use when the user wants to buy gym equipment or workout gear.',
        parameters: {
          type: 'OBJECT',
          properties: {
            equipment: {
              type: 'ARRAY',
              description: 'List of equipment items needed',
              items: { type: 'STRING' },
            },
          },
          required: ['equipment'],
        },
      },

      // ── Budget ────────────────────────────────────────────────────────────────
      {
        name: 'set_monthly_budget',
        description:
          'Sets the user\'s monthly spending budget. Use when the user wants to change or set their monthly budget.',
        parameters: {
          type: 'OBJECT',
          properties: {
            amount: { type: 'NUMBER', description: 'The monthly budget amount in dollars' },
          },
          required: ['amount'],
        },
      },

      {
        name: 'add_expense',
        description:
          'Adds an expense entry to track spending. Use when the user says they spent money on something.',
        parameters: {
          type: 'OBJECT',
          properties: {
            description: { type: 'STRING', description: 'What the expense was for, e.g. "Textbooks", "Gym membership"' },
            amount: { type: 'NUMBER', description: 'Amount spent in dollars' },
            category: {
              type: 'STRING',
              enum: ['education', 'fitness', 'food', 'grooming', 'health', 'transport', 'entertainment', 'other'],
              description: 'Category of the expense',
            },
          },
          required: ['description', 'amount', 'category'],
        },
      },

      {
        name: 'add_price_alert',
        description:
          'Sets a price alert to notify when a product price drops. Use when the user wants to be notified when something goes on sale or drops in price.',
        parameters: {
          type: 'OBJECT',
          properties: {
            productName: { type: 'STRING', description: 'Name of the product to track, e.g. "Whey Protein 2lb"' },
            currentPrice: { type: 'NUMBER', description: 'Current price of the product' },
            targetPrice: { type: 'NUMBER', description: 'Price threshold to be alerted at' },
          },
          required: ['productName', 'currentPrice', 'targetPrice'],
        },
      },

      // ── Groups ────────────────────────────────────────────────────────────────
      {
        name: 'create_group',
        description:
          'Creates a new study group. Use when the user asks to create a study group, project group, or any learning community.',
        parameters: {
          type: 'OBJECT',
          properties: {
            name: { type: 'STRING', description: 'Group name, e.g. "Calculus Study Group"' },
            description: { type: 'STRING', description: 'What the group is about' },
            category: {
              type: 'STRING',
              enum: ['course-based', 'subject-based', 'college-based', 'study-group', 'project-group'],
              description: 'Type of group',
            },
            groupType: {
              type: 'STRING',
              enum: ['public', 'private', 'restricted'],
              description: 'Who can join: public (anyone), private (invite only), restricted (request to join)',
            },
            maxMembers: { type: 'NUMBER', description: 'Maximum number of members (default 50)' },
          },
          required: ['name', 'description', 'category'],
        },
      },

      {
        name: 'create_group_discussion',
        description:
          'Starts a discussion thread in a group. Use when the user wants to post a question, topic, or discussion in a group.',
        parameters: {
          type: 'OBJECT',
          properties: {
            groupName: { type: 'STRING', description: 'Name of the group to post in (will match the first group with this name)' },
            title: { type: 'STRING', description: 'Discussion title' },
            content: { type: 'STRING', description: 'The discussion content or message' },
            type: {
              type: 'STRING',
              enum: ['general', 'topic', 'doubt'],
              description: 'Type of discussion: general, topic, or doubt/question',
            },
          },
          required: ['groupName', 'title', 'content', 'type'],
        },
      },

      {
        name: 'create_group_poll',
        description:
          'Creates a poll in a group. Use when the user wants to vote on something or ask the group a question with options.',
        parameters: {
          type: 'OBJECT',
          properties: {
            groupName: { type: 'STRING', description: 'Name of the group to create the poll in' },
            question: { type: 'STRING', description: 'The poll question' },
            options: {
              type: 'ARRAY',
              description: 'List of poll options',
              items: { type: 'STRING' },
            },
            endsAt: { type: 'STRING', description: 'ISO 8601 datetime when the poll ends (optional)' },
          },
          required: ['groupName', 'question', 'options'],
        },
      },

      {
        name: 'create_group_assignment',
        description:
          'Creates an assignment for a study group. Use when the user wants to assign work or a task to their group members.',
        parameters: {
          type: 'OBJECT',
          properties: {
            groupName: { type: 'STRING', description: 'Name of the group to create the assignment in' },
            title: { type: 'STRING', description: 'Assignment title' },
            description: { type: 'STRING', description: 'What the assignment is about' },
            instructions: { type: 'STRING', description: 'Detailed instructions for completing the assignment' },
            deadline: { type: 'STRING', description: 'ISO 8601 deadline datetime' },
          },
          required: ['groupName', 'title', 'description', 'deadline'],
        },
      },

      {
        name: 'schedule_group_meeting',
        description:
          'Schedules a meeting within a study group. Use when the user wants to organise or book a group session.',
        parameters: {
          type: 'OBJECT',
          properties: {
            groupName: { type: 'STRING', description: 'Name of the group to schedule the meeting in' },
            title: { type: 'STRING', description: 'Meeting title' },
            description: { type: 'STRING', description: 'Meeting agenda or description' },
            date: { type: 'STRING', description: 'ISO 8601 datetime for the meeting' },
            durationMinutes: { type: 'NUMBER', description: 'Duration in minutes' },
            platform: {
              type: 'STRING',
              enum: ['jitsi', 'zoom', 'google-meet'],
              description: 'The meeting platform',
            },
          },
          required: ['groupName', 'title', 'date', 'durationMinutes'],
        },
      },

      // ── Marketplace ───────────────────────────────────────────────────────────
      {
        name: 'create_marketplace_listing',
        description:
          'Creates a listing on the campus marketplace to sell an item. Use when the user wants to sell something (textbook, electronics, equipment, etc.).',
        parameters: {
          type: 'OBJECT',
          properties: {
            title: { type: 'STRING', description: 'Listing title, e.g. "Calculus Textbook 5th Edition"' },
            description: { type: 'STRING', description: 'Description of the item' },
            price: { type: 'NUMBER', description: 'Asking price in dollars' },
            originalPrice: { type: 'NUMBER', description: 'Original price (optional, for showing discount)' },
            category: {
              type: 'STRING',
              enum: ['textbooks', 'electronics', 'fitness-equipment', 'study-supplies', 'lab-materials', 'other'],
              description: 'Category of the item',
            },
            condition: {
              type: 'STRING',
              enum: ['new', 'like-new', 'good', 'fair'],
              description: 'Condition of the item',
            },
            location: { type: 'STRING', description: 'Where the item is located on campus' },
          },
          required: ['title', 'price', 'category', 'condition'],
        },
      },

      // ── Meetings ──────────────────────────────────────────────────────────────
      {
        name: 'cancel_meeting',
        description:
          'Cancels an existing meeting. Use when the user wants to cancel a scheduled meeting.',
        parameters: {
          type: 'OBJECT',
          properties: {
            meetingTitle: { type: 'STRING', description: 'Title or keyword of the meeting to cancel' },
          },
          required: ['meetingTitle'],
        },
      },

      {
        name: 'send_meeting_invite',
        description:
          'Sends a meeting invite to someone by email. Use when the user wants to invite someone to an existing meeting.',
        parameters: {
          type: 'OBJECT',
          properties: {
            meetingTitle: { type: 'STRING', description: 'Title of the meeting to send the invite for' },
            inviteeName: { type: 'STRING', description: 'Name of the person to invite' },
            inviteeEmail: { type: 'STRING', description: 'Email address of the person to invite' },
          },
          required: ['meetingTitle', 'inviteeName', 'inviteeEmail'],
        },
      },

      // ── UI Preferences ────────────────────────────────────────────────────────
      {
        name: 'set_language',
        description:
          'Switches the app language between English and Arabic. Use when the user asks to change language, switch to Arabic, or switch to English.',
        parameters: {
          type: 'OBJECT',
          properties: {
            language: {
              type: 'STRING',
              enum: ['en', 'ar'],
              description: '"en" for English, "ar" for Arabic',
            },
          },
          required: ['language'],
        },
      },
    ],
  },
];

// ─── Agent tool executor ──────────────────────────────────────────────────────

export interface ToolResult {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}

export async function executeAgentTool(
  toolName: string,
  args: Record<string, any>,
  userContext: { email?: string; name?: string },
): Promise<ToolResult> {
  try {
    switch (toolName) {
      // ── Create Quiz ───────────────────────────────────────────────────────
      case 'create_quiz': {
        const { addQuiz } = useAITutorStore.getState();
        const quizId = `quiz-agent-${Date.now()}`;
        addQuiz({
          id: quizId,
          textbookId: 'agent-created',
          title: args.title,
          questions: (args.questions as any[]).map((q, i) => ({
            id: `q-${i}`,
            question: q.question,
            options: q.options,
            correctIndex: q.correctIndex,
            explanation: q.explanation ?? '',
          })),
          createdAt: new Date().toISOString(),
        });
        return {
          success: true,
          message: `Quiz "${args.title}" created with ${args.questions.length} questions.`,
          data: { quizId, title: args.title, questionCount: args.questions.length },
        };
      }

      // ── Create Study Plan ─────────────────────────────────────────────────
      case 'create_study_plan': {
        const { addStudyPlan } = useAITutorStore.getState();
        const planId = `plan-agent-${Date.now()}`;
        addStudyPlan({
          id: planId,
          textbookId: 'agent-created',
          title: args.title,
          totalDays: args.totalDays,
          hoursPerDay: args.hoursPerDay,
          chapters: (args.chapters as any[]).map((c, i) => ({
            id: `ch-${planId}-${i}`,
            title: c.title,
            description: c.notes ?? '',
            days: c.durationHours ?? 1,
            topics: [],
            objectives: [],
            completed: false,
          })),
          createdAt: new Date().toISOString(),
        });
        return {
          success: true,
          message: `Study plan "${args.title}" created: ${args.totalDays} days, ${args.hoursPerDay}h/day.`,
          data: { planId, title: args.title, totalDays: args.totalDays },
        };
      }

      // ── Create Custom Workout ─────────────────────────────────────────────
      case 'create_custom_workout': {
        const { createCustomWorkout } = useWorkoutSystemStore.getState();

        // Map exercise names to IDs from the built-in exercise database
        const exercises = (args.exercises as any[]).map((e: any) => {
          const nameLower = (e.name as string).toLowerCase();
          const matched = EXERCISE_DATABASE.find(
            (ex) =>
              ex.name.toLowerCase().includes(nameLower) ||
              nameLower.includes(ex.name.toLowerCase()) ||
              ex.name.toLowerCase().split(' ').some((word) => nameLower.includes(word) && word.length > 3),
          );
          return {
            exerciseId: matched?.id ?? 'ex-6', // fallback: Push-ups
            sets: e.sets ?? matched?.defaultSets ?? 3,
            reps: e.reps ?? matched?.defaultReps ?? null,
            durationSeconds: e.durationSeconds ?? matched?.durationSeconds ?? null,
            restSeconds: e.restSeconds ?? 60,
          };
        });

        createCustomWorkout(args.name, args.description ?? 'Custom workout', exercises);
        return {
          success: true,
          message: `Custom workout "${args.name}" created with ${exercises.length} exercise${exercises.length !== 1 ? 's' : ''}. You can find it in the Fitness → Custom Workouts tab.`,
          data: { name: args.name, exerciseCount: exercises.length },
        };
      }

      // ── Log Workout ───────────────────────────────────────────────────────
      case 'log_workout': {
        const { logWorkout } = useWorkoutSystemStore.getState();
        const today = new Date().toISOString().slice(0, 10);
        logWorkout({
          date: today,
          workoutName: args.workoutName,
          exercises: (args.exercises ?? []).map((e: any, i: number) => ({
            exerciseId: `agent-ex-${i}`,
            sets: e.sets ?? 3,
            reps: e.reps ?? 10,
            note: e.name ?? '',
          })),
          durationMinutes: args.durationMinutes,
          feeling: args.feeling ?? 'good',
        });
        return {
          success: true,
          message: `Workout "${args.workoutName}" (${args.durationMinutes} min, felt ${args.feeling}) logged for today.`,
          data: { workoutName: args.workoutName, durationMinutes: args.durationMinutes },
        };
      }

      // ── Add Shopping Item ────────────────────────────────────────────────
      case 'add_shopping_item': {
        const store = useShoppingListStore.getState();
        let targetListId: string;

        // Find matching list by name, or first list, or create one
        const existingList = args.listName
          ? store.lists.find((l) => l.name.toLowerCase().includes(args.listName.toLowerCase()))
          : store.lists[0];

        if (existingList) {
          targetListId = existingList.id;
        } else {
          targetListId = store.createList(args.listName ?? 'My List', 'custom', '🛒');
        }

        store.addItem(targetListId, {
          name: args.itemName,
          quantity: args.quantity ?? 1,
          unit: args.unit ?? 'pcs',
          category: args.category ?? 'other',
          checked: false,
          source: 'manual',
          sourceDetail: 'Added by Bobo',
          estimatedPrice: 0,
          note: '',
        });

        return {
          success: true,
          message: `"${args.itemName}" added to shopping list.`,
          data: { itemName: args.itemName, listId: targetListId },
        };
      }

      // ── Schedule Meeting ──────────────────────────────────────────────────
      case 'schedule_meeting': {
        const { createMeeting } = useMeetingStore.getState();
        const meeting = createMeeting({
          title: args.title,
          description: args.description ?? '',
          hostEmail: userContext.email ?? 'user@heybobo.ai',
          hostName: userContext.name ?? 'User',
          scheduledAt: args.scheduledAt,
          duration: args.durationMinutes,
        });
        return {
          success: true,
          message: `Meeting "${args.title}" scheduled for ${new Date(args.scheduledAt).toLocaleString()}. Code: ${meeting.meetingCode}`,
          data: { meetingId: meeting.id, meetingCode: meeting.meetingCode, title: args.title },
        };
      }

      // ── Log Injury ────────────────────────────────────────────────────────
      case 'log_injury': {
        const { logInjury } = useInjuryStore.getState();
        const injury = logInjury({
          name: args.name,
          type: 'muscle-strain' as const,
          bodyPart: args.bodyPart,
          severity: args.painScale >= 8 ? 'severe' : args.painScale >= 5 ? 'moderate' : 'mild',
          painScale: args.painScale,
          dateOfOccurrence: new Date().toISOString().slice(0, 10),
          cause: args.cause ?? 'Not specified',
          status: 'active',
          notes: args.notes ?? '',
        });
        return {
          success: true,
          message: `Injury "${args.name}" logged. Pain: ${args.painScale}/10. Please monitor and seek medical advice if needed.`,
          data: { injuryId: injury.id, bodyPart: args.bodyPart, painScale: args.painScale },
        };
      }

      // ── Add Brain Priority ────────────────────────────────────────────────
      case 'add_brain_priority': {
        const { priorities, setBrainData, alerts, schedule, moduleInsights, crossInsights, recommendations, weeklySummary } = useAIBrainStore.getState();
        const newPriority = {
          id: `p-agent-${Date.now()}`,
          title: args.title,
          description: args.description,
          module: args.module,
          level: args.level,
          icon: 'Assignment',
        };
        setBrainData({
          priorities: [newPriority, ...priorities],
          alerts,
          schedule,
          moduleInsights,
          crossInsights,
          recommendations,
          weeklySummary,
        });
        return {
          success: true,
          message: `Priority "${args.title}" added to your AI Brain dashboard.`,
          data: { priorityId: newPriority.id },
        };
      }

      // ── Fitness / Activity ────────────────────────────────────────────────────

      case 'log_activity': {
        const today = new Date().toISOString().split('T')[0];
        const { addWorkout } = useActivityTrackingStore.getState();
        addWorkout({
          date: today,
          type: args.type,
          name: args.name ?? args.type,
          durationMinutes: args.durationMinutes,
          caloriesBurned: args.caloriesBurned ?? 0,
          notes: args.notes ?? '',
        });
        return {
          success: true,
          message: `Logged ${args.durationMinutes} minutes of ${args.name ?? args.type}. Great work!`,
        };
      }

      case 'set_fitness_goals': {
        const { setGoals } = useActivityTrackingStore.getState();
        const goals: Record<string, number> = {};
        if (args.steps !== undefined) goals.steps = args.steps;
        if (args.distanceKm !== undefined) goals.distanceKm = args.distanceKm;
        if (args.caloriesBurned !== undefined) goals.caloriesBurned = args.caloriesBurned;
        if (args.activeMinutes !== undefined) goals.activeMinutes = args.activeMinutes;
        setGoals(goals as any);
        const parts = Object.entries(goals).map(([k, v]) => `${k}: ${v}`).join(', ');
        return { success: true, message: `Fitness goals updated — ${parts}.` };
      }

      case 'set_active_plan': {
        const { setActivePlan } = useWorkoutSystemStore.getState();
        const keyword = (args.planName as string).toLowerCase();
        const match = PRESET_PLANS.find(
          (p: any) =>
            p.name.toLowerCase().includes(keyword) ||
            (p.goal && p.goal.toLowerCase().includes(keyword)),
        );
        if (!match) {
          return {
            success: false,
            message: `Could not find a preset plan matching "${args.planName}". Available plans: ${PRESET_PLANS.map((p: any) => p.name).join(', ')}.`,
          };
        }
        setActivePlan(match.id);
        return { success: true, message: `"${match.name}" is now your active workout plan!` };
      }

      // ── Dietary ───────────────────────────────────────────────────────────────

      case 'set_dietary_goal': {
        const { setGoal, setCalorieTarget, setMacroTargets, setDietType } = useDietaryProfileStore.getState() as any;
        if (args.goal) setGoal(args.goal);
        if (args.calorieTarget !== undefined) setCalorieTarget(args.calorieTarget);
        if (args.proteinGrams !== undefined || args.carbsGrams !== undefined || args.fatGrams !== undefined) {
          setMacroTargets({
            proteinG: args.proteinGrams ?? 0,
            carbsG: args.carbsGrams ?? 0,
            fatG: args.fatGrams ?? 0,
          });
        }
        if (args.dietType && setDietType) setDietType(args.dietType);
        return {
          success: true,
          message: `Dietary profile updated! Goal: ${args.goal ?? 'unchanged'}${args.calorieTarget ? `, ${args.calorieTarget} kcal/day` : ''}.`,
        };
      }

      case 'set_water_target': {
        const { setWaterTarget } = useDietaryProfileStore.getState() as any;
        setWaterTarget(args.millilitres);
        return {
          success: true,
          message: `Daily water target set to ${(args.millilitres / 1000).toFixed(1)} litres. Stay hydrated!`,
        };
      }

      // ── Injury / Health ───────────────────────────────────────────────────────

      case 'log_daily_pain': {
        const today = new Date().toISOString().split('T')[0];
        const { injuries, logDailyPain } = useInjuryStore.getState();
        const keyword = (args.injuryName ?? '').toLowerCase();
        const injury =
          injuries.find(
            (inj: any) =>
              inj.status === 'active' &&
              (keyword.length === 0 ||
                inj.name.toLowerCase().includes(keyword) ||
                inj.bodyPart.toLowerCase().includes(keyword)),
          ) ?? injuries.find((inj: any) => inj.status === 'active');
        if (!injury) {
          return { success: false, message: 'No active injury found to log pain for. Please log an injury first.' };
        }
        logDailyPain({
          injuryId: injury.id,
          date: today,
          painLevel: args.painLevel,
          stiffness: args.stiffness ?? 5,
          mobilityLevel: args.mobilityLevel ?? 5,
          mood: args.mood ?? 3,
          notes: args.notes ?? '',
        });
        return {
          success: true,
          message: `Pain level ${args.painLevel}/10 logged for "${injury.name}" today.`,
        };
      }

      case 'mark_injury_healed': {
        const { injuries, markInjuryHealed } = useInjuryStore.getState();
        const keyword = (args.injuryName as string).toLowerCase();
        const injury = injuries.find(
          (inj: any) =>
            inj.name.toLowerCase().includes(keyword) ||
            inj.bodyPart.toLowerCase().includes(keyword),
        );
        if (!injury) {
          return { success: false, message: `Could not find an injury matching "${args.injuryName}".` };
        }
        markInjuryHealed(injury.id);
        return { success: true, message: `"${injury.name}" has been marked as healed. Great recovery!` };
      }

      case 'create_rehab_program': {
        const today = new Date().toISOString().split('T')[0];
        const { injuries, rehabExercises, createRehabProgram } = useInjuryStore.getState();
        const keyword = (args.injuryName ?? '').toLowerCase();
        const injury =
          injuries.find(
            (inj: any) =>
              inj.status === 'active' &&
              (keyword.length === 0 ||
                inj.name.toLowerCase().includes(keyword) ||
                inj.bodyPart.toLowerCase().includes(keyword)),
          ) ?? injuries.find((inj: any) => inj.status === 'active');
        if (!injury) {
          return { success: false, message: 'No active injury found to create a rehab program for.' };
        }
        const exerciseIds = (rehabExercises ?? []).slice(0, 3).map((e: any) => e.id);
        createRehabProgram({
          injuryId: injury.id,
          name: args.name,
          startDate: today,
          exerciseIds,
          frequency: args.frequency,
          notes: args.notes ?? '',
          status: 'active',
        });
        return {
          success: true,
          message: `Rehab program "${args.name}" created for "${injury.name}" — ${args.frequency}.`,
        };
      }

      case 'schedule_expert_consult': {
        const { injuries, scheduleConsult } = useInjuryStore.getState();
        const keyword = (args.injuryName ?? '').toLowerCase();
        const injury =
          injuries.find(
            (inj: any) =>
              inj.status === 'active' &&
              (keyword.length === 0 ||
                inj.name.toLowerCase().includes(keyword) ||
                inj.bodyPart.toLowerCase().includes(keyword)),
          ) ?? injuries.find((inj: any) => inj.status === 'active');
        const injuryId = injury?.id ?? 'general';
        scheduleConsult({
          injuryId,
          expertName: args.expertName,
          specialty: args.specialty,
          scheduledAt: args.scheduledAt,
          status: 'pending',
          notes: args.notes ?? '',
          meetingLink: '',
        });
        return {
          success: true,
          message: `Consultation with ${args.expertName} (${args.specialty}) scheduled for ${new Date(args.scheduledAt).toLocaleDateString()}.`,
        };
      }

      // ── Shopping ──────────────────────────────────────────────────────────────

      case 'create_shopping_list': {
        const { createList } = useShoppingListStore.getState();
        createList(args.name, 'custom', args.emoji ?? '🛒');
        return { success: true, message: `Shopping list "${args.name}" created!` };
      }

      case 'generate_diet_shopping_list': {
        const { generateFromDiet } = useShoppingListStore.getState() as any;
        generateFromDiet(args.dietType);
        return {
          success: true,
          message: `Shopping list for a ${args.dietType} diet has been generated!`,
        };
      }

      case 'generate_workout_shopping_list': {
        const { generateFromWorkouts } = useShoppingListStore.getState() as any;
        generateFromWorkouts(args.equipment ?? []);
        return {
          success: true,
          message: `Equipment shopping list generated with ${(args.equipment ?? []).length} item(s).`,
        };
      }

      // ── Budget ────────────────────────────────────────────────────────────────

      case 'set_monthly_budget': {
        const { setMonthlyBudget } = useBudgetStore.getState();
        setMonthlyBudget(args.amount);
        return { success: true, message: `Monthly budget set to $${args.amount}.` };
      }

      case 'add_expense': {
        const today = new Date().toISOString().split('T')[0];
        const { addExpense } = useBudgetStore.getState();
        addExpense({
          amount: args.amount,
          category: args.category,
          description: args.description,
          date: today,
          source: 'Bobo',
        } as any);
        return {
          success: true,
          message: `Expense of $${args.amount} for "${args.description}" (${args.category}) logged.`,
        };
      }

      case 'add_price_alert': {
        const { addPriceAlert } = useBudgetStore.getState();
        addPriceAlert({
          productName: args.productName,
          currentPrice: args.currentPrice,
          targetPrice: args.targetPrice,
          active: true,
        } as any);
        return {
          success: true,
          message: `Price alert set for "${args.productName}". You'll be notified when it drops below $${args.targetPrice}.`,
        };
      }

      // ── Groups ────────────────────────────────────────────────────────────────

      case 'create_group': {
        const { createGroup } = useGroupStore.getState();
        createGroup({
          name: args.name,
          description: args.description ?? '',
          category: args.category,
          groupType: args.groupType ?? 'public',
          postPermission: 'everyone',
          maxMembers: args.maxMembers ?? 50,
          courseIds: [],
        } as any);
        return { success: true, message: `Study group "${args.name}" created!` };
      }

      case 'create_group_discussion': {
        const { groups, createDiscussion } = useGroupStore.getState();
        const keyword = (args.groupName as string).toLowerCase();
        const group = groups.find((g: any) => g.name.toLowerCase().includes(keyword));
        if (!group) {
          return { success: false, message: `Could not find a group matching "${args.groupName}".` };
        }
        createDiscussion(group.id, {
          type: args.type ?? 'general',
          title: args.title,
          content: args.content,
          authorId: 'current-user',
          authorName: userContext?.name ?? 'You',
        } as any);
        return {
          success: true,
          message: `Discussion "${args.title}" posted in "${group.name}".`,
        };
      }

      case 'create_group_poll': {
        const { groups, createPoll } = useGroupStore.getState();
        const keyword = (args.groupName as string).toLowerCase();
        const group = groups.find((g: any) => g.name.toLowerCase().includes(keyword));
        if (!group) {
          return { success: false, message: `Could not find a group matching "${args.groupName}".` };
        }
        createPoll(group.id, {
          question: args.question,
          options: (args.options as string[]).map((text: string, i: number) => ({
            id: `opt-${i}`,
            text,
            votes: [],
          })),
          createdBy: userContext?.name ?? 'You',
          endsAt: args.endsAt,
        } as any);
        return {
          success: true,
          message: `Poll "${args.question}" created in "${group.name}" with ${(args.options as string[]).length} options.`,
        };
      }

      case 'create_group_assignment': {
        const { groups, createAssignment } = useGroupStore.getState();
        const keyword = (args.groupName as string).toLowerCase();
        const group = groups.find((g: any) => g.name.toLowerCase().includes(keyword));
        if (!group) {
          return { success: false, message: `Could not find a group matching "${args.groupName}".` };
        }
        createAssignment(group.id, {
          title: args.title,
          description: args.description,
          instructions: args.instructions ?? '',
          deadline: args.deadline,
          createdBy: userContext?.name ?? 'You',
        } as any);
        return {
          success: true,
          message: `Assignment "${args.title}" created in "${group.name}" — deadline ${new Date(args.deadline).toLocaleDateString()}.`,
        };
      }

      case 'schedule_group_meeting': {
        const { groups, scheduleMeeting } = useGroupStore.getState();
        const keyword = (args.groupName as string).toLowerCase();
        const group = groups.find((g: any) => g.name.toLowerCase().includes(keyword));
        if (!group) {
          return { success: false, message: `Could not find a group matching "${args.groupName}".` };
        }
        scheduleMeeting(group.id, {
          title: args.title,
          description: args.description ?? '',
          date: args.date,
          duration: args.durationMinutes,
          instructor: userContext?.name ?? 'You',
          platform: args.platform ?? 'jitsi',
          meetingLink: undefined,
        } as any);
        return {
          success: true,
          message: `Meeting "${args.title}" scheduled in "${group.name}" on ${new Date(args.date).toLocaleDateString()} via ${args.platform ?? 'Jitsi'}.`,
        };
      }

      // ── Marketplace ───────────────────────────────────────────────────────────

      case 'create_marketplace_listing': {
        const { createListing } = useCampusMarketplaceStore.getState();
        createListing(
          {
            title: args.title,
            description: args.description ?? '',
            price: args.price,
            originalPrice: args.originalPrice ?? null,
            condition: args.condition,
            category: args.category,
            relatedCourseId: null,
            tags: [],
            location: args.location ?? 'Campus',
          } as any,
          userContext?.name ?? 'You',
        );
        return {
          success: true,
          message: `Listing "${args.title}" posted on the campus marketplace for $${args.price}.`,
        };
      }

      // ── Meetings ──────────────────────────────────────────────────────────────

      case 'cancel_meeting': {
        const { meetings, cancelMeeting } = useMeetingStore.getState();
        const keyword = (args.meetingTitle as string).toLowerCase();
        const meeting = (meetings ?? []).find((m: any) => m.title.toLowerCase().includes(keyword));
        if (!meeting) {
          return { success: false, message: `Could not find a meeting matching "${args.meetingTitle}".` };
        }
        cancelMeeting(meeting.id);
        return { success: true, message: `Meeting "${meeting.title}" has been cancelled.` };
      }

      case 'send_meeting_invite': {
        const { meetings, sendInvite } = useMeetingStore.getState();
        const keyword = (args.meetingTitle as string).toLowerCase();
        const meeting = (meetings ?? []).find((m: any) => m.title.toLowerCase().includes(keyword));
        if (!meeting) {
          return { success: false, message: `Could not find a meeting matching "${args.meetingTitle}".` };
        }
        sendInvite(meeting.id, {
          name: args.inviteeName,
          email: args.inviteeEmail,
        } as any);
        return {
          success: true,
          message: `Invite sent to ${args.inviteeName} (${args.inviteeEmail}) for "${meeting.title}".`,
        };
      }

      // ── UI Preferences ────────────────────────────────────────────────────────

      case 'set_language': {
        const { setLanguage } = useUIStore.getState();
        setLanguage(args.language);
        return {
          success: true,
          message: args.language === 'ar' ? 'تم تغيير اللغة إلى العربية!' : 'Language switched to English!',
        };
      }

      default:
        return { success: false, message: `Unknown tool: ${toolName}` };
    }
  } catch (err: any) {
    return {
      success: false,
      message: `Failed to execute ${toolName}: ${err?.message ?? 'Unknown error'}`,
    };
  }
}
