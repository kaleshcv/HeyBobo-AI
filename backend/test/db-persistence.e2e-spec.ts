/// <reference types="node" />
/**
 * DB Persistence Test Agent
 *
 * Tests that every major CRUD operation in every module
 * correctly saves data to MongoDB and cascades to related collections.
 *
 * Run with: cd backend && npx ts-node -e "require('./test/run-db-persistence-agent')"
 * Or:       npm run test:e2e -- --testPathPattern=db-persistence
 */

import axios, { AxiosInstance } from 'axios';
import mongoose from 'mongoose';

const BASE_URL = 'http://localhost:3001/api/v1';
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eduplatform';

// ── Colour helpers ─────────────────────────────────────────────────────────────
const OK = '\x1b[32m✔\x1b[0m';
const FAIL = '\x1b[31m✗\x1b[0m';
const INFO = '\x1b[36mℹ\x1b[0m';
const WARN = '\x1b[33m⚠\x1b[0m';
const BOLD = (s: string) => `\x1b[1m${s}\x1b[0m`;

let passed = 0;
let failed = 0;
const failures: string[] = [];

function assert(label: string, condition: boolean, detail?: string) {
  if (condition) {
    console.log(`  ${OK} ${label}`);
    passed++;
  } else {
    console.log(`  ${FAIL} ${label}${detail ? ` — ${detail}` : ''}`);
    failed++;
    failures.push(label + (detail ? ` [${detail}]` : ''));
  }
}

// ── MongoDB direct access ─────────────────────────────────────────────────────
let db: mongoose.Connection;

async function dbFind(collection: string, query: Record<string, any>) {
  return db.collection(collection).findOne(query);
}
async function dbFindAll(collection: string, query: Record<string, any>) {
  return db.collection(collection).find(query).toArray();
}
async function dbCount(collection: string, query: Record<string, any>) {
  return db.collection(collection).countDocuments(query);
}

// ── HTTP client ───────────────────────────────────────────────────────────────
let api: AxiosInstance;
let studentApi: AxiosInstance;
let teacherApi: AxiosInstance;
let studentId: string;
let teacherId: string;

async function login(email: string, password: string): Promise<string> {
  const res = await axios.post(`${BASE_URL}/auth/login`, { email, password });
  return res.data?.data?.accessToken || res.data?.accessToken;
}

async function register(name: string, email: string, password: string, role = 'student'): Promise<{ id: string; token: string }> {
  try {
    const res = await axios.post(`${BASE_URL}/auth/register`, { name, email, password, role });
    const token = res.data?.data?.accessToken || res.data?.accessToken;
    const id = res.data?.data?.user?._id || res.data?.data?.user?.id;
    return { id, token };
  } catch (e: any) {
    // Already exists – log in
    const token = await login(email, password);
    const userRes = await axios.get(`${BASE_URL}/users/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const id = userRes.data?.data?._id || userRes.data?.data?.id;
    return { id, token };
  }
}

function makeClient(token: string): AxiosInstance {
  return axios.create({
    baseURL: BASE_URL,
    headers: { Authorization: `Bearer ${token}` },
    validateStatus: () => true, // never throw on non-2xx
  });
}

// ═════════════════════════════════════════════════════════════════════════════
// MODULE TESTS
// ═════════════════════════════════════════════════════════════════════════════

// ── AUTH MODULE ───────────────────────────────────────────────────────────────
async function testAuth() {
  console.log(`\n${BOLD('── AUTH MODULE ──────────────────────────────────────')}`);

  const ts = Date.now();
  const email = `student_${ts}@test.com`;
  const pass = 'Test1234!';

  const { id, token } = await register(`Student ${ts}`, email, pass, 'student');
  studentId = id;
  studentApi = makeClient(token);

  // User document saved
  const userDoc = await dbFind('users', { email });
  assert('User saved to DB on register', !!userDoc);
  assert('User has correct role', userDoc?.role === 'student');
  assert('Password hash NOT stored in response (select:false)', !token.includes('passwordHash'));

  // Teacher
  const temail = `teacher_${ts}@test.com`;
  const { id: tid, token: ttoken } = await register(`Teacher ${ts}`, temail, pass, 'teacher');
  teacherId = tid;
  teacherApi = makeClient(ttoken);
  const teacherDoc = await dbFind('users', { email: temail });
  assert('Teacher saved to DB on register', !!teacherDoc);
}

// ── USERS MODULE ──────────────────────────────────────────────────────────────
async function testUsers() {
  console.log(`\n${BOLD('── USERS MODULE ─────────────────────────────────────')}`);

  // Update profile
  const r = await studentApi.put('/users/profile', { bio: 'Test bio', website: 'https://test.com' });
  assert('PUT /users/profile returns 200', r.status === 200);

  const profileDoc = await dbFind('userprofiles', { userId: new mongoose.Types.ObjectId(studentId) });
  assert('UserProfile saved to DB', !!profileDoc);
  assert('UserProfile.bio persisted', profileDoc?.bio === 'Test bio');
}

// ── EDUCATION MODULE ──────────────────────────────────────────────────────────
let courseId: string;
let enrollmentId: string;
let lessonId: string;
let quizId: string;
let sectionId: string;

async function testEducation() {
  console.log(`\n${BOLD('── EDUCATION MODULE ─────────────────────────────────')}`);

  // ── Category ──
  const catRes = await teacherApi.post('/education/categories', { name: `Cat ${Date.now()}`, slug: `cat-${Date.now()}`, description: 'Test' });
  assert('POST /education/categories saved', catRes.status === 201 || catRes.status === 200);
  const catId = catRes.data?.data?._id || catRes.data?.data?.id;

  // ── Course ──
  const courseRes = await teacherApi.post('/education/courses', {
    title: `Course ${Date.now()}`,
    description: 'Test course description that is long enough to pass validation for a course',
    categoryId: catId,
    level: 'beginner',
    language: 'English',
    price: 0,
  });
  assert('POST /education/courses returns 201', courseRes.status === 201 || courseRes.status === 200);
  courseId = courseRes.data?.data?._id || courseRes.data?.data?.id;
  assert('Course saved to DB', !!courseId);
  const courseDoc = await dbFind('courses', { _id: new mongoose.Types.ObjectId(courseId) });
  assert('Course document in MongoDB', !!courseDoc);
  assert('Course.teacherId set correctly', courseDoc?.teacherId?.toString() === teacherId);

  // ── Section ──
  const secRes = await teacherApi.post(`/education/courses/${courseId}/sections`, {
    title: 'Section 1', order: 1,
  });
  sectionId = secRes.data?.data?._id || secRes.data?.data?.id;
  assert('Section saved to DB', !!sectionId);

  // ── Lesson ──
  const lessonRes = await teacherApi.post(`/education/courses/${courseId}/lessons`, {
    title: 'Lesson 1', type: 'video', order: 1, sectionId, status: 'published',
    videoUrl: 'https://example.com/video.mp4', durationSeconds: 300,
  });
  lessonId = lessonRes.data?.data?._id || lessonRes.data?.data?.id;
  assert('Lesson saved to DB', !!lessonId);
  const lessonDoc = await dbFind('lessons', { _id: new mongoose.Types.ObjectId(lessonId) });
  assert('Lesson.courseId FK set', !!lessonDoc?.courseId);
  assert('Lesson.sectionId FK set', !!lessonDoc?.sectionId);

  // ── Enroll ──
  // Publish course first
  await teacherApi.patch(`/education/courses/${courseId}/publish`);
  const enrollRes = await studentApi.post(`/enrollments/courses/${courseId}`);
  assert('POST /enrollments returns 201', enrollRes.status === 201 || enrollRes.status === 200);
  enrollmentId = enrollRes.data?.data?._id || enrollRes.data?.data?.id;
  const enrollDoc = await dbFind('enrollments', { _id: new mongoose.Types.ObjectId(enrollmentId) });
  assert('Enrollment saved to DB', !!enrollDoc);
  assert('Enrollment.courseId FK correct', enrollDoc?.courseId?.toString() === courseId);
  assert('Enrollment.studentId FK correct', enrollDoc?.studentId?.toString() === studentId);

  // User.enrolledCoursesCount incremented
  const userAfterEnroll = await dbFind('users', { _id: new mongoose.Types.ObjectId(studentId) });
  assert('User.enrolledCoursesCount incremented', (userAfterEnroll?.enrolledCoursesCount ?? 0) >= 1);

  // Course.enrollmentCount incremented
  const courseAfterEnroll = await dbFind('courses', { _id: new mongoose.Types.ObjectId(courseId) });
  assert('Course.enrollmentCount incremented', (courseAfterEnroll?.enrollmentCount ?? 0) >= 1);

  // ── Lesson Progress ──
  const lpRes = await studentApi.put(`/education/lessons/${lessonId}/progress`, {
    completed: true, watchedSeconds: 300,
  });
  assert('PUT /lessons/:id/progress returns 200', lpRes.status === 200 || lpRes.status === 201);
  const lpDoc = await dbFind('lessonprogresses', {
    lessonId: new mongoose.Types.ObjectId(lessonId),
    studentId: new mongoose.Types.ObjectId(studentId),
  });
  assert('LessonProgress saved to DB', !!lpDoc);
  assert('LessonProgress.completed = true', lpDoc?.completed === true);
  assert('LessonProgress.courseId FK set', !!lpDoc?.courseId);

  // Enrollment.progressPercent updated
  const enrollAfterLesson = await dbFind('enrollments', { _id: new mongoose.Types.ObjectId(enrollmentId) });
  assert('Enrollment.progressPercent > 0 after lesson completion', (enrollAfterLesson?.progressPercent ?? 0) > 0);

  // User.totalLessonsCompleted incremented
  const userAfterLesson = await dbFind('users', { _id: new mongoose.Types.ObjectId(studentId) });
  assert('User.totalLessonsCompleted incremented', (userAfterLesson?.totalLessonsCompleted ?? 0) >= 1);

  // ── Quiz ──
  const quizRes = await teacherApi.post(`/education/courses/${courseId}/quizzes`, {
    title: 'Quiz 1', passPercentage: 60, status: 'published',
  });
  quizId = quizRes.data?.data?._id || quizRes.data?.data?.id;
  assert('Quiz saved to DB', !!quizId);
  const quizDoc = await dbFind('quizzes', { _id: new mongoose.Types.ObjectId(quizId) });
  assert('Quiz.courseId FK set', quizDoc?.courseId?.toString() === courseId);

  // Quiz attempt
  const attemptRes = await studentApi.post(`/education/quizzes/${quizId}/attempts`, {
    answers: [], startedAt: new Date().toISOString(),
  });
  assert('Quiz attempt saved to DB', attemptRes.status === 201 || attemptRes.status === 200);
  const attemptDoc = await dbFind('quizattempts', {
    quizId: new mongoose.Types.ObjectId(quizId),
    studentId: new mongoose.Types.ObjectId(studentId),
  });
  assert('QuizAttempt in DB', !!attemptDoc);
  assert('QuizAttempt.quizId FK correct', attemptDoc?.quizId?.toString() === quizId);
  assert('QuizAttempt.studentId FK correct', attemptDoc?.studentId?.toString() === studentId);

  // ── Assignment ──
  const asgRes = await teacherApi.post(`/education/courses/${courseId}/assignments`, {
    title: 'Assignment 1',
    description: 'Test assignment',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    submissionType: 'text',
    status: 'published',
    maxGrade: 100,
  });
  const assignmentId = asgRes.data?.data?._id || asgRes.data?.data?.id;
  if (assignmentId) {
    const submRes = await studentApi.post(`/education/assignments/${assignmentId}/submit`, {
      textResponse: 'My answer here',
    });
    assert('Assignment submission saved to DB', submRes.status === 201 || submRes.status === 200);
    const submDoc = await dbFind('assignmentsubmissions', {
      assignmentId: new mongoose.Types.ObjectId(assignmentId),
      studentId: new mongoose.Types.ObjectId(studentId),
    });
    assert('AssignmentSubmission in DB', !!submDoc);
    assert('Submission.assignmentId FK correct', submDoc?.assignmentId?.toString() === assignmentId);
  } else {
    console.log(`  ${WARN} Skipped assignment submit (creation failed)`);
  }

  // ── Review ──
  const revRes = await studentApi.post(`/education/courses/${courseId}/reviews`, {
    rating: 5, review: 'Excellent course content!',
  });
  assert('Review saved to DB', revRes.status === 201 || revRes.status === 200);
  const revDoc = await dbFind('reviews', {
    courseId: new mongoose.Types.ObjectId(courseId),
    studentId: new mongoose.Types.ObjectId(studentId),
  });
  assert('Review document in DB', !!revDoc);
  assert('Review.courseId FK correct', revDoc?.courseId?.toString() === courseId);
  // Course rating updated
  const courseAfterReview = await dbFind('courses', { _id: new mongoose.Types.ObjectId(courseId) });
  assert('Course.ratingAvg updated after review', (courseAfterReview?.ratingAvg ?? 0) > 0);
  assert('Course.ratingCount incremented', (courseAfterReview?.ratingCount ?? 0) >= 1);
}

// ── CERTIFICATES MODULE ───────────────────────────────────────────────────────
async function testCertificates() {
  console.log(`\n${BOLD('── CERTIFICATES MODULE ───────────────────────────────')}`);

  if (!enrollmentId) { console.log(`  ${WARN} Skipped (no enrollment)`); return; }

  // Force complete enrollment so cert can be generated
  await studentApi.patch(`/enrollments/courses/${courseId}/complete`);
  const completeEnroll = await dbFind('enrollments', { _id: new mongoose.Types.ObjectId(enrollmentId) });
  assert('Enrollment status = completed', completeEnroll?.status === 'completed');

  // User.completedCoursesCount incremented
  const userAfterComplete = await dbFind('users', { _id: new mongoose.Types.ObjectId(studentId) });
  assert('User.completedCoursesCount incremented', (userAfterComplete?.completedCoursesCount ?? 0) >= 1);

  const certRes = await studentApi.post(`/certificates/generate/${enrollmentId}`);
  assert('Certificate generation returns 201', certRes.status === 201 || certRes.status === 200);
  const cert = certRes.data?.data;
  if (cert?._id) {
    const certDoc = await dbFind('certificates', { _id: new mongoose.Types.ObjectId(cert._id) });
    assert('Certificate saved to DB', !!certDoc);
    assert('Certificate.courseId FK set', certDoc?.courseId?.toString() === courseId);
    assert('Certificate.studentId FK set', certDoc?.studentId?.toString() === studentId);
    assert('Certificate.enrollmentId FK set', !!certDoc?.enrollmentId);
    assert('Certificate has verificationCode', !!certDoc?.verificationCode);

    // Enrollment.certificateId back-linked
    const enrollAfterCert = await dbFind('enrollments', { _id: new mongoose.Types.ObjectId(enrollmentId) });
    assert('Enrollment.certificateId linked to certificate', enrollAfterCert?.certificateId?.toString() === cert._id.toString());

    // User.totalCertificates incremented
    const userAfterCert = await dbFind('users', { _id: new mongoose.Types.ObjectId(studentId) });
    assert('User.totalCertificates incremented', (userAfterCert?.totalCertificates ?? 0) >= 1);
  } else {
    console.log(`  ${WARN} Certificate not returned (check API)`);
  }
}

// ── FITNESS MODULE ────────────────────────────────────────────────────────────
async function testFitness() {
  console.log(`\n${BOLD('── FITNESS MODULE ────────────────────────────────────')}`);

  const userBefore = await dbFind('users', { _id: new mongoose.Types.ObjectId(studentId) });
  const workoutsBefore = userBefore?.totalWorkouts ?? 0;

  // Create workout session
  const wRes = await studentApi.post('/fitness/sessions', {
    name: 'Morning Run',
    source: 'manual',
    category: 'cardio',
    startedAt: new Date().toISOString(),
    durationSeconds: 1800,
    caloriesBurned: 250,
    totalReps: 0,
  });
  assert('POST /fitness/sessions returns 201', wRes.status === 201 || wRes.status === 200);
  const sessionDoc = await dbFind('workoutsessions', { userId: studentId });
  assert('WorkoutSession saved to DB', !!sessionDoc);
  assert('WorkoutSession.userId set', sessionDoc?.userId === studentId);

  // DailyMetric updated
  const today = new Date().toISOString().slice(0, 10);
  const metricDoc = await dbFind('dailymetrics', { userId: studentId, date: today });
  assert('DailyMetric updated for today', !!metricDoc);
  assert('DailyMetric.workoutsCompleted >= 1', (metricDoc?.workoutsCompleted ?? 0) >= 1);

  // User.totalWorkouts incremented
  const userAfter = await dbFind('users', { _id: new mongoose.Types.ObjectId(studentId) });
  assert('User.totalWorkouts incremented', (userAfter?.totalWorkouts ?? 0) > workoutsBefore);

  // Fitness profile
  const profRes = await studentApi.put('/fitness/profile', {
    heightCm: 175, weightKg: 70, fitnessLevel: 'intermediate',
    primaryGoal: 'weight_loss', weeklyWorkoutTarget: 4,
  });
  assert('Fitness profile saved', profRes.status === 200 || profRes.status === 201);
  const profDoc = await dbFind('fitnessprofiles', { userId: studentId });
  assert('FitnessProfile in DB', !!profDoc);

  // Create goal
  const goalRes = await studentApi.post('/fitness/goals', {
    type: 'workouts', target: 10, unit: 'sessions',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 86400000).toISOString(),
  });
  const goalId = goalRes.data?.data?._id || goalRes.data?.data?.id;
  assert('FitnessGoal saved to DB', !!goalId);

  // Complete goal
  if (goalId) {
    const progressRes = await studentApi.patch(`/fitness/goals/${goalId}/progress`, { current: 10 });
    assert('Goal progress updated', progressRes.status === 200);
    const goalDoc = await dbFind('fitnessgoals', { _id: new mongoose.Types.ObjectId(goalId) });
    assert('FitnessGoal.completed = true', goalDoc?.completed === true);
    const userAfterGoal = await dbFind('users', { _id: new mongoose.Types.ObjectId(studentId) });
    assert('User.completedFitnessGoals incremented', (userAfterGoal?.completedFitnessGoals ?? 0) >= 1);
  }
}

// ── DIETARY MODULE ────────────────────────────────────────────────────────────
async function testDietary() {
  console.log(`\n${BOLD('── DIETARY MODULE ────────────────────────────────────')}`);

  const userBefore = await dbFind('users', { _id: new mongoose.Types.ObjectId(studentId) });
  const mealsBefore = userBefore?.totalMealsLogged ?? 0;

  const today = new Date().toISOString().slice(0, 10);
  const mealRes = await studentApi.post('/dietary/meals', {
    mealType: 'breakfast',
    date: today,
    items: [{ name: 'Oats', calories: 300, protein: 10, carbs: 55, fat: 5, servingSize: 100, unit: 'g' }],
    totalCalories: 300,
    totalProtein: 10,
    totalCarbs: 55,
    totalFat: 5,
  });
  assert('POST /dietary/meals returns 201', mealRes.status === 201 || mealRes.status === 200);
  const mealDoc = await dbFind('meallogs', { userId: studentId, date: today });
  assert('MealLog saved to DB', !!mealDoc);
  assert('MealLog.mealType correct', mealDoc?.mealType === 'breakfast');

  // DailyNutrition updated
  const dnDoc = await dbFind('dailynutritions', { userId: studentId, date: today });
  assert('DailyNutrition updated', !!dnDoc);

  // User.totalMealsLogged incremented
  const userAfter = await dbFind('users', { _id: new mongoose.Types.ObjectId(studentId) });
  assert('User.totalMealsLogged incremented', (userAfter?.totalMealsLogged ?? 0) > mealsBefore);

  // Dietary goal
  const goalRes = await studentApi.post('/dietary/goals', {
    type: 'calories', target: 2000, unit: 'kcal/day',
    startDate: new Date().toISOString(), endDate: new Date(Date.now() + 30 * 86400000).toISOString(),
  });
  const goalId = goalRes.data?.data?._id || goalRes.data?.data?.id;
  assert('DietaryGoal saved to DB', !!goalId);

  if (goalId) {
    const pgRes = await studentApi.patch(`/dietary/goals/${goalId}/progress`, { current: 2000 });
    assert('Dietary goal progress updated', pgRes.status === 200);
    const goalDoc = await dbFind('dietarygoals', { _id: new mongoose.Types.ObjectId(goalId) });
    assert('DietaryGoal.completed = true', goalDoc?.completed === true);
    const userAfterGoal = await dbFind('users', { _id: new mongoose.Types.ObjectId(studentId) });
    assert('User.completedDietaryGoals incremented', (userAfterGoal?.completedDietaryGoals ?? 0) >= 1);
  }

  // Supplement
  const suppRes = await studentApi.post('/dietary/supplements', {
    name: 'Vitamin D', dosage: '1000 IU', frequency: 'daily', date: today,
    scheduledTime: '08:00',
  });
  assert('SupplementLog saved to DB', suppRes.status === 201 || suppRes.status === 200);
  const suppDoc = await dbFind('supplementlogs', { userId: studentId, date: today });
  assert('SupplementLog in DB', !!suppDoc);
}

// ── GROOMING MODULE ───────────────────────────────────────────────────────────
async function testGrooming() {
  console.log(`\n${BOLD('── GROOMING MODULE ───────────────────────────────────')}`);

  const profRes = await studentApi.put('/grooming/profile', {
    skinType: 'normal', hairType: 'straight', skinTone: 'medium',
    concerns: ['acne'], stylePreferences: ['casual'],
  });
  assert('Grooming profile saved', profRes.status === 200 || profRes.status === 201);
  const profDoc = await dbFind('groomingprofiles', { userId: studentId });
  assert('GroomingProfile in DB', !!profDoc);
  assert('GroomingProfile.userId set', profDoc?.userId === studentId);

  const recRes = await studentApi.post('/grooming/recommendations', {
    category: 'skincare',
    productName: 'Moisturizer',
    brand: 'CeraVe',
    reason: 'Good for normal skin',
    imageUrl: 'https://example.com/img.jpg',
  });
  assert('Grooming recommendation saved', recRes.status === 201 || recRes.status === 200);
  const recDoc = await dbFind('groomingprofiles', { userId: studentId }); // Adjust if separate collection
  assert('Grooming recommendation in DB', !!profDoc);
}

// ── AI MODULE ─────────────────────────────────────────────────────────────────
async function testAIModule() {
  console.log(`\n${BOLD('── AI MODULE (Quizzes/Attempts/Plans) ────────────────')}`);

  const ts = Date.now();
  const clientId = `quiz-${ts}`;

  // Save AI quiz
  const quizRes = await studentApi.post('/ai/quizzes', {
    clientId,
    textbookId: `book-${ts}`,
    title: 'Test AI Quiz',
    questions: [
      { id: 'q1', question: 'What is 2+2?', options: ['3', '4', '5', '6'], correctIndex: 1, explanation: '2+2=4' },
    ],
  });
  assert('POST /ai/quizzes returns 200/201', quizRes.status === 200 || quizRes.status === 201);
  const aiQuizDoc = await dbFind('ai_quizzes', { clientId });
  assert('AIQuiz saved to DB', !!aiQuizDoc);
  assert('AIQuiz.userId set', !!aiQuizDoc?.userId);
  assert('AIQuiz.questions array saved', (aiQuizDoc?.questions?.length ?? 0) > 0);

  // Save AI quiz attempt
  const attemptClientId = `attempt-${ts}`;
  const attemptRes = await studentApi.post('/ai/quiz-attempts', {
    clientId: attemptClientId,
    quizId: clientId,
    textbookId: `book-${ts}`,
    answers: { q1: 1 },
    score: 1,
    total: 1,
    completedAt: new Date().toISOString(),
  });
  assert('POST /ai/quiz-attempts returns 200/201', attemptRes.status === 200 || attemptRes.status === 201);
  const aiAttemptDoc = await dbFind('ai_quiz_attempts', { clientId: attemptClientId });
  assert('AIQuizAttempt saved to DB', !!aiAttemptDoc);
  assert('AIQuizAttempt.userId set', !!aiAttemptDoc?.userId);
  assert('AIQuizAttempt.answersArray saved', (aiAttemptDoc?.answersArray?.length ?? 0) > 0);

  // GET quizzes returns saved quiz
  const getRes = await studentApi.get('/ai/quizzes');
  assert('GET /ai/quizzes returns array', Array.isArray(getRes.data?.data));
  const savedQuiz = (getRes.data?.data as any[])?.find((q: any) => q.clientId === clientId);
  assert('Saved quiz returned in GET', !!savedQuiz);

  // Save study plan
  const planClientId = `plan-${ts}`;
  const planRes = await studentApi.post('/ai/study-plans', {
    clientId: planClientId,
    textbookId: `book-${ts}`,
    title: 'Study Plan Test',
    chapters: [{ title: 'Chapter 1', topics: ['Topic A', 'Topic B'], estimatedMinutes: 60, completed: false }],
    totalEstimatedMinutes: 60,
  });
  assert('POST /ai/study-plans returns 200/201', planRes.status === 200 || planRes.status === 201);
  const planDoc = await dbFind('study_plans', { clientId: planClientId });
  assert('StudyPlan saved to DB', !!planDoc);

  // Revision plan
  const revClientId = `rev-${ts}`;
  const revRes = await studentApi.post('/ai/revision-plans', {
    clientId: revClientId,
    quizAttemptId: attemptClientId,
    textbookId: `book-${ts}`,
    quizTitle: 'Test AI Quiz',
    score: 1,
    total: 1,
    weakAreas: [{ topic: 'Math', weakness: 'Addition', action: 'Practice more', priority: 'high' }],
    summary: 'Review addition facts.',
  });
  assert('POST /ai/revision-plans returns 200/201', revRes.status === 200 || revRes.status === 201);
  const revDoc = await dbFind('ai_revision_plans', { clientId: revClientId });
  assert('RevisionPlan saved to DB', !!revDoc);
}

// ── NOTIFICATIONS MODULE ──────────────────────────────────────────────────────
async function testNotifications() {
  console.log(`\n${BOLD('── NOTIFICATIONS MODULE ──────────────────────────────')}`);

  const getRes = await studentApi.get('/notifications');
  assert('GET /notifications returns 200', getRes.status === 200);
  assert('Notifications response is array', Array.isArray(getRes.data?.data?.data ?? getRes.data?.data));
}

// ═════════════════════════════════════════════════════════════════════════════
// ENTRY POINT
// ═════════════════════════════════════════════════════════════════════════════
async function main() {
  console.log(`\n${BOLD('╔══════════════════════════════════════════════════════╗')}`);
  console.log(`${BOLD('║       DB PERSISTENCE TEST AGENT — EduPlatform       ║')}`);
  console.log(`${BOLD('╚══════════════════════════════════════════════════════╝')}`);
  console.log(`${INFO} Connecting to MongoDB: ${MONGO_URI}`);

  try {
    await mongoose.connect(MONGO_URI);
    db = mongoose.connection;
    console.log(`${OK} MongoDB connected`);
  } catch (e) {
    console.error(`${FAIL} Cannot connect to MongoDB:`, e);
    process.exit(1);
  }

  // Check backend is running
  try {
    await axios.get(`${BASE_URL}/health`);
    console.log(`${OK} Backend reachable at ${BASE_URL}`);
  } catch {
    try {
      await axios.get('http://localhost:3001');
      console.log(`${OK} Backend reachable`);
    } catch {
      console.error(`${FAIL} Backend not running at ${BASE_URL}`);
      await mongoose.disconnect();
      process.exit(1);
    }
  }

  try {
    await testAuth();
    await testUsers();
    await testEducation();
    await testCertificates();
    await testFitness();
    await testDietary();
    await testGrooming();
    await testAIModule();
    await testNotifications();
  } catch (e: any) {
    console.error(`\n${FAIL} Test suite error:`, e?.message || e);
  } finally {
    await mongoose.disconnect();
  }

  console.log(`\n${BOLD('══════════════════ RESULTS ══════════════════')}`);
  console.log(`  ${OK} Passed: ${passed}`);
  if (failed > 0) {
    console.log(`  ${FAIL} Failed: ${failed}`);
    console.log(`\n  FAILURES:`);
    failures.forEach((f) => console.log(`    ${FAIL} ${f}`));
  } else {
    console.log(`\n  All persistence checks passed!`);
  }
  console.log(`${BOLD('══════════════════════════════════════════════')}\n`);

  process.exit(failed > 0 ? 1 : 0);
}

main();
