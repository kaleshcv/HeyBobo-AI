/**
 * Bobo Agent Tools
 *
 * Defines Gemini function declarations + executor that runs them against
 * the app's Zustand stores. This enables Bobo to create quizzes, log
 * workouts, add shopping items, schedule meetings, log injuries, etc.
 * on behalf of the user.
 */

import { useAITutorStore } from '@/store/aiTutorStore';
import { useWorkoutSystemStore } from '@/store/workoutSystemStore';
import { useShoppingListStore } from '@/store/shoppingListStore';
import { useMeetingStore } from '@/store/meetingStore';
import { useInjuryStore } from '@/store/injuryStore';
import { useAIBrainStore } from '@/store/aiBrainStore';

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
        name: 'log_workout',
        description:
          'Logs a workout session in the Fitness module. Use when the user asks to log, record, save, or add a workout.',
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
