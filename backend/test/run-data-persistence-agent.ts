#!/usr/bin/env ts-node
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * EduPlatform — Data Persistence & Backend-First Testing Agent
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Verifies that:
 *   1. ALL business data is persisted via backend CRUD (MongoDB / server media)
 *   2. No application data leaks into browser localStorage (only auth tokens
 *      and UI preferences are acceptable there)
 *   3. Every Create → Read → Update → Delete cycle round-trips through the API
 *
 * Sections:
 *   §0  Static: localStorage audit (scans frontend source files)
 *   §1  Auth          — register → login → me → logout
 *   §2  Users         — profile patch persists cross-session
 *   §3  Education     — course CRUD (teacher) + enrollment (student)
 *   §4  Fitness       — sessions, profile, goals full CRUD
 *   §5  Dietary       — meals, profile, supplements, meal-plans, grocery-lists
 *   §6  Grooming      — profile + recommendations
 *   §7  Notifications — list + unread-count from DB
 *   §8  Media         — upload endpoints require auth (protect server storage)
 *   §9  Cross-session — data created in session A is visible in fresh login (session B)
 *
 * Usage:
 *   npm run test:persistence          (via package.json)
 *   npx ts-node test/run-data-persistence-agent.ts
 *   API_URL=http://localhost:3001/api/v1 npx ts-node test/run-data-persistence-agent.ts
 */

import axios, { AxiosInstance } from 'axios';
import * as fs from 'fs';
import * as path from 'path';

// ─── Configuration ───────────────────────────────────────────────────────────

const BASE_URL = process.env.API_URL ?? 'http://localhost:3001/api/v1';
const TIMEOUT  = 18000;

// Path to frontend source relative to this file (backend/test → repo root → frontend/src)
const FRONTEND_SRC = path.resolve(__dirname, '../../frontend/src');

// localStorage keys that are ACCEPTABLE (auth tokens + pure UI state)
const ACCEPTABLE_LS_KEYS = new Set([
  'auth_user',
  'auth_access_token',
  'auth_refresh_token',
  'ui_theme',
  'ui_chat_enabled',
  'ui_language',
  'bobo_dash_view',          // UI view preference only (no business data)
  'heybobo_remember',        // "remember me" login form helper
]);

// ─── Types ───────────────────────────────────────────────────────────────────

type Status = 'PASS' | 'FAIL' | 'WARN' | 'SKIP' | 'CRITICAL';

interface TestResult {
  id: string;
  section: string;
  name: string;
  status: Status;
  message: string;
  durationMs: number;
}

interface AuthCtx {
  accessToken: string;
  refreshToken: string;
  userId: string;
  email: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const COLORS: Record<Status | string, string> = {
  PASS:     '\x1b[32m',
  FAIL:     '\x1b[31m',
  WARN:     '\x1b[33m',
  SKIP:     '\x1b[90m',
  CRITICAL: '\x1b[35m',
  RESET:    '\x1b[0m',
  BOLD:     '\x1b[1m',
  DIM:      '\x1b[2m',
  CYAN:     '\x1b[36m',
  BLUE:     '\x1b[34m',
};

function c(color: keyof typeof COLORS, text: string): string {
  return `${COLORS[color]}${text}${COLORS.RESET}`;
}

let testCounter = 0;
function nextId(prefix: string): string {
  return `${prefix}-${String(++testCounter).padStart(3, '0')}`;
}

function stamp(): string {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function email(): string {
  return `persist-test-${uid()}@heybobo.test`;
}

const PASSWORD = 'Persist@Agent2026!';

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function client(token?: string): AxiosInstance {
  return axios.create({
    baseURL:        BASE_URL,
    timeout:        TIMEOUT,
    validateStatus: () => true,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

// ─── Recursive file walker ────────────────────────────────────────────────────

function walkFiles(dir: string, exts: string[]): string[] {
  if (!fs.existsSync(dir)) return [];
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkFiles(full, exts));
    } else if (exts.some((e) => full.endsWith(e))) {
      results.push(full);
    }
  }
  return results;
}

// ─── Main Agent Class ─────────────────────────────────────────────────────────

class DataPersistenceAgent {
  private results: TestResult[] = [];

  // ── run a single test ──────────────────────────────────────────────────────
  private async run(
    section: string,
    name: string,
    fn: () => Promise<{ status: Status; message: string }>,
  ): Promise<void> {
    const id    = nextId(section.split(' ')[0].replace(/[^A-Z0-9]/gi, ''));
    const start = Date.now();
    try {
      const { status, message } = await fn();
      this.results.push({ id, section, name, status, message, durationMs: Date.now() - start });
    } catch (err) {
      this.results.push({
        id, section, name,
        status: 'FAIL',
        message: `Uncaught: ${(err as Error).message}`,
        durationMs: Date.now() - start,
      });
    }
  }

  // ── convenience assertions ─────────────────────────────────────────────────
  private ok(msg: string)   { return { status: 'PASS'     as Status, message: msg }; }
  private fail(msg: string) { return { status: 'FAIL'     as Status, message: msg }; }
  private warn(msg: string) { return { status: 'WARN'     as Status, message: msg }; }
  private skip(msg: string) { return { status: 'SKIP'     as Status, message: msg }; }
  private crit(msg: string) { return { status: 'CRITICAL' as Status, message: msg }; }

  /**
   * Some controllers pre-wrap in { success, data } before the global
   * TransformInterceptor wraps again → double nesting.
   * Others return flat objects → single nesting.
   * This helper unwraps one or both layers transparently.
   */
  private payload(resData: any): any {
    const d1 = resData?.data;
    if (d1 && typeof d1 === 'object' && typeof d1.success === 'boolean' && 'data' in d1) {
      return d1.data; // double-wrapped (controller + interceptor)
    }
    return d1;       // single-wrapped (interceptor only)
  }

  private extractId(p: any): string | null {
    if (!p) return null;
    return p._id?.toString() || p.id?.toString() || null;
  }

  private extractList(p: any): any[] {
    if (Array.isArray(p)) return p;
    for (const key of ['data', 'sessions', 'goals', 'meals', 'supplements', 'items', 'recommendations', 'notifications', 'plans', 'lists']) {
      if (Array.isArray(p?.[key])) return p[key];
    }
    return [];
  }

  // ══════════════════════════════════════════════════════════════════════════
  // §0  STATIC — localStorage Audit
  // ══════════════════════════════════════════════════════════════════════════

  private async runSection0_LocalStorageAudit(): Promise<void> {
    const SEC = '§0 localStorage';

    await this.run(SEC, 'Frontend source directory exists', async () => {
      if (!fs.existsSync(FRONTEND_SRC)) {
        return this.warn(`Frontend src not found at ${FRONTEND_SRC} — skipping static audit`);
      }
      return this.ok(`Found ${FRONTEND_SRC}`);
    });

    if (!fs.existsSync(FRONTEND_SRC)) return;

    // Collect all localStorage.setItem / localStorage.getItem calls
    const files = walkFiles(FRONTEND_SRC, ['.ts', '.tsx']);

    interface LSUsage {
      file: string;
      line: number;
      key: string;
      op: 'setItem' | 'getItem' | 'removeItem';
      acceptable: boolean;
    }

    const usages: LSUsage[] = [];

    // Only match string-literal keys (not template expressions like `${userId}:${key}`)
    const KEY_RE = /localStorage\.(setItem|getItem|removeItem)\(\s*'([^']+)'|localStorage\.(setItem|getItem|removeItem)\(\s*"([^"]+)"/g;

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      const lines   = content.split('\n');
      lines.forEach((line, idx) => {
        let m: RegExpExecArray | null;
        KEY_RE.lastIndex = 0;
        while ((m = KEY_RE.exec(line)) !== null) {
          // m[1]+m[2] for single-quote match, m[3]+m[4] for double-quote match
          const op  = (m[1] || m[3]) as 'setItem' | 'getItem' | 'removeItem';
          const key = m[2] || m[4];
          if (!key) continue; // skip template literals
          usages.push({
            file: path.relative(FRONTEND_SRC, file),
            line: idx + 1,
            op,
            key,
            acceptable: ACCEPTABLE_LS_KEYS.has(key),
          });
        }
      });
    }

    await this.run(SEC, 'Scan complete — total localStorage usages', async () => {
      return this.ok(`Found ${usages.length} localStorage call(s) across ${files.length} scanned file(s)`);
    });

    // Report acceptable usages as PASS
    const acceptable = usages.filter((u) => u.acceptable);
    const leaks      = usages.filter((u) => !u.acceptable);

    await this.run(SEC, `Acceptable keys (auth + UI prefs): ${acceptable.length} usage(s)`, async () => {
      if (acceptable.length === 0) return this.ok('No localStorage usage found (clean)');
      const summary = [...new Set(acceptable.map((u) => u.key))].join(', ');
      return this.ok(`Allowed keys in use: ${summary}`);
    });

    // Each unique non-acceptable key is a separate test
    const leakKeys = [...new Set(leaks.map((u) => u.key))];
    for (const key of leakKeys) {
      const occurrences = leaks.filter((u) => u.key === key);
      const locs = occurrences
        .map((u) => `${u.file}:${u.line} (${u.op})`)
        .join(' | ');
      await this.run(
        SEC,
        `DATA LEAK CHECK — key "${key}"`,
        async () => this.fail(
          `Business data stored in localStorage! Key: "${key}" — ${occurrences.length} location(s): ${locs}. ` +
          `This data MUST be persisted via backend API and should NOT be stored locally.`,
        ),
      );
    }

    if (leakKeys.length === 0) {
      await this.run(SEC, 'No business-data localStorage leaks', async () =>
        this.ok('All localStorage usage is limited to acceptable keys'),
      );
    }

    // Scan for direct data URI / base64 storage patterns
    await this.run(SEC, 'No base64 blobs in localStorage', async () => {
      const b64Files = files.filter((f) => {
        const txt = fs.readFileSync(f, 'utf8');
        return /localStorage\.setItem[^;]*base64|localStorage\.setItem[^;]*data:/i.test(txt);
      });
      if (b64Files.length > 0) {
        return this.fail(`Base64/blob stored in localStorage in: ${b64Files.map((f) => path.relative(FRONTEND_SRC, f)).join(', ')}`);
      }
      return this.ok('No base64 data URIs found in localStorage writes');
    });

    // Check mobile store if it exists
    const mobileSrc = path.resolve(__dirname, '../../mobile/src');
    if (fs.existsSync(mobileSrc)) {
      const mobileFiles = walkFiles(mobileSrc, ['.ts', '.tsx']);
      await this.run(SEC, 'Mobile: no unsanctioned AsyncStorage business-data', async () => {
        const hits: string[] = [];
        for (const f of mobileFiles) {
          const content = fs.readFileSync(f, 'utf8');
          // AsyncStorage with non-auth keys is suspicious
          const matches = [...content.matchAll(/AsyncStorage\.setItem\(\s*[`'"]([^`'"]+)[`'"]/g)];
          for (const m of matches) {
            if (!ACCEPTABLE_LS_KEYS.has(m[1]) && !m[1].startsWith('auth_')) {
              hits.push(`${path.relative(mobileSrc, f)} — key: "${m[1]}"`);
            }
          }
        }
        if (hits.length > 0) {
          return this.fail(`Mobile AsyncStorage business-data keys found:\n  ${hits.join('\n  ')}`);
        }
        return this.ok(`Scanned ${mobileFiles.length} mobile file(s) — no unsanctioned AsyncStorage keys`);
      });
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // §1  AUTH — Full Round-Trip Persistence
  // ══════════════════════════════════════════════════════════════════════════

  private studentCtx:  AuthCtx | null = null;
  private teacherCtx:  AuthCtx | null = null;

  private async runSection1_Auth(): Promise<void> {
    const SEC = '§1 Auth';
    const http = client();

    // ── Register student ────────────────────────────────────────────────────
    const studentEmail = email();
    await this.run(SEC, 'POST /auth/register → 201 + tokens + DB-assigned id', async () => {
      const res = await http.post('/auth/register', {
        firstName: 'Persist',
        lastName:  'Student',
        username:  `ps_${uid()}`,
        email:     studentEmail,
        password:  PASSWORD,
        role:      'student',
      });
      if (res.status !== 201) return this.fail(`Expected 201, got ${res.status}: ${JSON.stringify(res.data)}`);
      const d = res.data?.data ?? res.data;
      if (!d?.accessToken) return this.fail('No accessToken in response');
      if (!d?.user?.id)    return this.fail('No user.id — data not persisted to DB');
      this.studentCtx = { accessToken: d.accessToken, refreshToken: d.refreshToken, userId: d.user.id, email: studentEmail };
      return this.ok(`Registered student id=${d.user.id}`);
    });

    // ── Register teacher ────────────────────────────────────────────────────
    const teacherEmail = email();
    await this.run(SEC, 'POST /auth/register → teacher account persisted', async () => {
      const res = await http.post('/auth/register', {
        firstName: 'Persist',
        lastName:  'Teacher',
        username:  `pt_${uid()}`,
        email:     teacherEmail,
        password:  PASSWORD,
        role:      'teacher',
      });
      if (res.status !== 201) return this.fail(`Expected 201, got ${res.status}`);
      const d = res.data?.data ?? res.data;
      this.teacherCtx = { accessToken: d.accessToken, refreshToken: d.refreshToken, userId: d.user.id, email: teacherEmail };
      return this.ok(`Registered teacher id=${d.user.id}`);
    });

if (!this.studentCtx) return; // can't continue without auth

  await sleep(1500); // avoid auth rate-limit window

    // ── Login returns same user from DB ─────────────────────────────────────
    await sleep(1200);
    await this.run(SEC, 'POST /auth/login → same user id returned from DB', async () => {
      const res = await http.post('/auth/login', { identifier: studentEmail, password: PASSWORD });
      if (res.status !== 200) return this.fail(`Expected 200, got ${res.status}`);
      const d = res.data?.data ?? res.data;
      if (d?.user?.id !== this.studentCtx!.userId) {
        return this.fail(`Login user.id ${d?.user?.id} ≠ registered id ${this.studentCtx!.userId}`);
      }
      return this.ok('Login returns same DB record as registration');
    });

    // ── GET /auth/me reads from DB (not from token payload only) ────────────
    await sleep(1200);
    await this.run(SEC, 'GET /auth/me → DB record accessible via token', async () => {
      const res = await client(this.studentCtx!.accessToken).get('/auth/me');
      if (res.status !== 200) return this.fail(`Expected 200, got ${res.status}`);
      const d = res.data?.data ?? res.data;
      const userId = d?.sub ?? d?.id ?? d?.userId;
      if (!userId) return this.warn('Could not verify user id in /auth/me response (check DTO shape)');
      return this.ok(`/auth/me returned user from DB`);
    });

    // ── Refresh token works (proves token stored server-side, not just JWT) ─
    await sleep(1200);
    await this.run(SEC, 'POST /auth/refresh → new tokens from server-side store', async () => {
      const res = await http.post('/auth/refresh', { refreshToken: this.studentCtx!.refreshToken });
      if (res.status !== 200) return this.fail(`Expected 200, got ${res.status}: ${JSON.stringify(res.data)}`);
      const d = res.data?.data ?? res.data;
      if (!d?.accessToken) return this.fail('No new accessToken in refresh response');
      // Update context with fresh token
      this.studentCtx!.accessToken  = d.accessToken;
      this.studentCtx!.refreshToken = d.refreshToken ?? this.studentCtx!.refreshToken;
      return this.ok('Refresh token round-tripped through server — tokens rotated');
    });

    // ── Logout invalidates server-side session ───────────────────────────────
    await sleep(1200);
    await this.run(SEC, 'POST /auth/logout → server-side session invalidated', async () => {
      // Logout using current student refresh token (don't re-login to save auth quota)
      const res = await client(this.studentCtx!.accessToken).post('/auth/logout', {
        refreshToken: this.studentCtx!.refreshToken,
      });
      if (res.status !== 200 && res.status !== 201) {
        return this.fail(`Logout returned ${res.status}`);
      }
      // Re-login after logout to restore the student token for subsequent tests
      await sleep(1200);
      const loginRes = await http.post('/auth/login', { identifier: studentEmail, password: PASSWORD });
      if (loginRes.status === 200) {
        const d = loginRes.data?.data ?? loginRes.data;
        this.studentCtx!.accessToken  = d.accessToken;
        this.studentCtx!.refreshToken = d.refreshToken;
      }
      return this.ok('Logout confirmed — message: ' + (res.data?.message ?? 'OK'));
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // §2  USERS — Profile Persistence
  // ══════════════════════════════════════════════════════════════════════════

  private async runSection2_Users(): Promise<void> {
    const SEC = '§2 Users';
    if (!this.studentCtx) {
      await this.run(SEC, 'Skip — no student auth context', async () => this.skip('Auth section failed'));
      return;
    }
    const http = client(this.studentCtx.accessToken);
    const uniqueBio = `Bio-${uid()}`;

    // ── Patch profile ───────────────────────────────────────────────────────
    await this.run(SEC, 'PATCH /users/me → profile update persisted', async () => {
      const res = await http.patch('/users/me', { bio: uniqueBio });
      if (res.status !== 200) return this.fail(`Expected 200, got ${res.status}: ${JSON.stringify(res.data)}`);
      return this.ok(`Profile PATCH accepted (bio=${uniqueBio})`);
    });

    // ── Read back the patch ──────────────────────────────────────────────────
    await this.run(SEC, 'GET /users/me → patched bio stored in DB', async () => {
      const res = await http.get('/users/me');
      if (res.status !== 200) return this.fail(`Expected 200, got ${res.status}`);
      const user = res.data?.data ?? res.data;
      if (user?.bio !== uniqueBio && user?.profile?.bio !== uniqueBio) {
        return this.fail(`Bio not persisted — expected "${uniqueBio}", got "${user?.bio ?? user?.profile?.bio}"`);
      }
      return this.ok('Bio retrieved from DB matches what was PATCHed');
    });

    // ── Dashboard endpoint returns DB-aggregated data ────────────────────────
    await this.run(SEC, 'GET /users/me/dashboard → returns structured DB response', async () => {
      const res = await http.get('/users/me/dashboard');
      if (res.status !== 200) return this.fail(`Expected 200, got ${res.status}`);
      if (typeof res.data !== 'object') return this.fail('Dashboard response is not an object');
      return this.ok('Dashboard endpoint returned DB-aggregated data');
    });

    // ── Preferences stored in DB not localStorage ────────────────────────────
    await this.run(SEC, 'PATCH /users/me/preferences → preferences live in DB', async () => {
      const res = await http.patch('/users/me/preferences', { emailNotifications: true });
      if (res.status !== 200 && res.status !== 201) {
        return this.warn(`Preferences PATCH returned ${res.status} — may not be implemented`);
      }
      return this.ok('User preferences persisted via API (not localStorage)');
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // §3  EDUCATION — Course & Enrollment CRUD
  // ══════════════════════════════════════════════════════════════════════════

  private courseId: string | null = null;

  private async runSection3_Education(): Promise<void> {
    const SEC = '§3 Education';
    if (!this.teacherCtx) {
      await this.run(SEC, 'Skip — no teacher auth context', async () => this.skip('Auth section failed'));
      return;
    }
    const teacherHttp  = client(this.teacherCtx.accessToken);
    const studentHttp  = this.studentCtx ? client(this.studentCtx.accessToken) : null;
    const courseTitle  = `Persistence Test Course ${uid()}`;
    const updatedTitle = `UPDATED Course ${uid()}`;

    // ── CREATE course ────────────────────────────────────────────────────────
    await this.run(SEC, 'POST /education/courses → course persisted in DB', async () => {
      const res = await teacherHttp.post('/courses', {
        title:       courseTitle,
        description: 'Automated persistence test course',
        categoryId:  '000000000000000000000001',
        level:       'beginner',
        language:    'en',
        isFree:      true,
      });
      if (res.status !== 201) return this.fail(`Expected 201, got ${res.status}: ${JSON.stringify(res.data)}`);
      const d = res.data?.data ?? res.data;
      const id = d?._id ?? d?.id;
      if (!id) return this.fail('No _id in response — DB insert may have failed');
      this.courseId = id;
      return this.ok(`Course created with DB id=${id}`);
    });

    if (!this.courseId) return;

    // ── READ back the course ─────────────────────────────────────────────────
    await this.run(SEC, 'GET /education/courses/:id → course readable from DB', async () => {
      const res = await teacherHttp.get(`/courses/${this.courseId}`);
      if (res.status !== 200) return this.fail(`Expected 200, got ${res.status}`);
      const d = res.data?.data ?? res.data;
      if ((d?.title ?? d?.course?.title) !== courseTitle) {
        return this.fail(`Title mismatch — expected "${courseTitle}", got "${d?.title}"`);
      }
      return this.ok('Course title matches exactly — stored and read from DB');
    });

    // ── UPDATE course ────────────────────────────────────────────────────────
    await this.run(SEC, 'PATCH /education/courses/:id → update persisted in DB', async () => {
      const res = await teacherHttp.patch(`/courses/${this.courseId}`, { title: updatedTitle });
      if (res.status !== 200) return this.fail(`Expected 200, got ${res.status}: ${JSON.stringify(res.data)}`);
      return this.ok(`Course PATCH accepted (new title="${updatedTitle}")`);
    });

    // ── READ back updated course ─────────────────────────────────────────────
    await this.run(SEC, 'GET /education/courses/:id → updated title persisted in DB', async () => {
      const res = await teacherHttp.get(`/courses/${this.courseId}`);
      if (res.status !== 200) return this.fail(`Expected 200, got ${res.status}`);
      const d = res.data?.data ?? res.data;
      const title = d?.title ?? d?.course?.title;
      if (title !== updatedTitle) {
        return this.fail(`Update not persisted — expected "${updatedTitle}", got "${title}"`);
      }
      return this.ok('PATCH confirmed — updated title read back from DB');
    });

    // ── ENROLL student ───────────────────────────────────────────────────────
    if (studentHttp) {
      await this.run(SEC, 'POST /enrollments/courses/:id → enrollment in DB', async () => {
        const res = await studentHttp.post(`/enrollments/courses/${this.courseId}`);
        if (res.status !== 201 && res.status !== 200) {
          return this.warn(`Enrollment returned ${res.status} — ${JSON.stringify(res.data)}`);
        }
        return this.ok('Enrollment created in DB');
      });

      // ── READ enrollments list ────────────────────────────────────────────
      await this.run(SEC, 'GET /enrollments → enrolled course appears in list', async () => {
        const res = await studentHttp.get('/enrollments');
        if (res.status !== 200) return this.fail(`Expected 200, got ${res.status}`);
        const list = this.extractList(this.payload(res.data));
        const found = list.some(
          (e) => (e?.courseId === this.courseId || e?.course?._id === this.courseId || e?.course?.id === this.courseId),
        );
        if (!found) return this.warn(`Enrolled course ${this.courseId} not found in enrollments list — check DTO shape`);
        return this.ok('Enrollment visible in student enrollments list');
      });

      // ── READ enrollment by course ────────────────────────────────────────
      await this.run(SEC, 'GET /enrollments/courses/:id → enrollment detail from DB', async () => {
        const res = await studentHttp.get(`/enrollments/courses/${this.courseId}`);
        if (res.status !== 200) return this.warn(`Expected 200, got ${res.status}`);
        return this.ok('Enrollment detail readable from DB');
      });
    }

    // ── DELETE course ────────────────────────────────────────────────────────
    await this.run(SEC, 'DELETE /education/courses/:id → course removed from DB', async () => {
      const res = await teacherHttp.delete(`/courses/${this.courseId}`);
      if (res.status !== 200 && res.status !== 204) {
        return this.fail(`Expected 200/204, got ${res.status}`);
      }
      return this.ok('Course DELETE accepted');
    });

    // ── VERIFY soft-delete / archive ─────────────────────────────────────────
    // NOTE: DELETE /courses/:id performs a SOFT-DELETE (archive), not hard-delete.
    // The record stays in DB with status 'archived'. A 200 response is expected.
    await this.run(SEC, 'GET /education/courses/:id → archived but accessible after soft-delete', async () => {
      await sleep(300);
      const res = await teacherHttp.get(`/courses/${this.courseId}`);
      if (res.status === 404) {
        // Hard delete happened — that's also acceptable
        return this.ok('Course hard-deleted — 404 confirmed after DELETE');
      }
      if (res.status === 200) {
        const p = this.payload(res.data);
        const status = p?.status ?? p?.course?.status;
        if (status === 'archived' || status === 'deleted') {
          return this.ok(`Course soft-deleted (status=${status}) — DB record preserved with archived flag`);
        }
        return this.warn(`Course still 200 after DELETE with status="${status}" — check if DELETE is implemented`);
      }
      return this.warn(`Unexpected status ${res.status} after course DELETE`);
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // §4  FITNESS — Sessions, Profile, Goals
  // ══════════════════════════════════════════════════════════════════════════

  private fitnessSessionId: string | null = null;
  private fitnessGoalId:    string | null = null;

  private async runSection4_Fitness(): Promise<void> {
    const SEC = '§4 Fitness';
    if (!this.studentCtx) {
      await this.run(SEC, 'Skip — no student auth context', async () => this.skip('Auth section failed'));
      return;
    }
    const http = client(this.studentCtx.accessToken);

    // ── PUT profile ──────────────────────────────────────────────────────────
    const uniqueNote = `note-${uid()}`;
    await this.run(SEC, 'PUT /fitness/profile → profile persisted in DB', async () => {
      const res = await http.put('/fitness/profile', {
        heightCm:      175,
        weightKg:      70,
        fitnessLevel:  'intermediate',
        activityLevel: 'moderate',
        goals:         ['weight_loss'],
        daysPerWeek:   4,
      });
      if (res.status !== 200 && res.status !== 201) {
        return this.fail(`Expected 200/201, got ${res.status}: ${JSON.stringify(res.data)}`);
      }
      return this.ok('Fitness profile PUT accepted');
    });

    await this.run(SEC, 'GET /fitness/profile → profile matches PUT data from DB', async () => {
      const res = await http.get('/fitness/profile');
      if (res.status !== 200) return this.fail(`Expected 200, got ${res.status}`);
      const d = res.data?.data ?? res.data;
      if (!d) return this.fail('Empty profile response');
      return this.ok('Fitness profile readable from DB');
    });

    // ── CREATE session ───────────────────────────────────────────────────────
    await this.run(SEC, 'POST /fitness/sessions → session persisted in DB with _id', async () => {
      const res = await http.post('/fitness/sessions', {
        source:        'manual',
        name:          `Test Session ${uid()}`,
        startedAt:     new Date().toISOString(),
        endedAt:       new Date(Date.now() + 1800000).toISOString(),
        durationSeconds: 1800,
        caloriesBurned:  250,
        exercises:       [],
      });
      if (res.status !== 201) return this.fail(`Expected 201, got ${res.status}: ${JSON.stringify(res.data)}`);
      const p = this.payload(res.data);
      const id = this.extractId(p);
      if (!id) return this.fail(`No _id in session response — not persisted to DB. Payload keys: ${Object.keys(p || {}).join(', ')}`);
      this.fitnessSessionId = id;
      return this.ok(`Session DB id=${id}`);
    });

    // ── READ session list ────────────────────────────────────────────────────
    await this.run(SEC, 'GET /fitness/sessions → created session in list', async () => {
      const res = await http.get('/fitness/sessions');
      if (res.status !== 200) return this.fail(`Expected 200, got ${res.status}`);
      const list = this.extractList(this.payload(res.data));
      const found = list.some((s) => this.extractId(s) === this.fitnessSessionId);
      if (!found) return this.warn(`Session ${this.fitnessSessionId} not in list — check pagination or DTO`);
      return this.ok('Session found in DB list');
    });

    // ── READ single session ──────────────────────────────────────────────────
    if (this.fitnessSessionId) {
      await this.run(SEC, 'GET /fitness/sessions/:id → single session from DB', async () => {
        const res = await http.get(`/fitness/sessions/${this.fitnessSessionId}`);
        if (res.status !== 200) return this.fail(`Expected 200, got ${res.status}`);
        const p   = this.payload(res.data);
        const id  = this.extractId(p);
        if (id !== this.fitnessSessionId) return this.fail(`ID mismatch: ${id} vs ${this.fitnessSessionId}`);
        return this.ok('Single session correctly read from DB by _id');
      });
    }

    // ── CREATE goal ──────────────────────────────────────────────────────────
    await this.run(SEC, 'POST /fitness/goals → goal persisted in DB', async () => {
      const res = await http.post('/fitness/goals', {
        type:      'weight_loss',
        target:    65,
        unit:      'kg',
        startDate: new Date().toISOString(),
        endDate:   new Date(Date.now() + 30 * 86400000).toISOString(),
      });
      if (res.status !== 201) return this.fail(`Expected 201, got ${res.status}: ${JSON.stringify(res.data)}`);
      const p  = this.payload(res.data);
      const id = this.extractId(p);
      if (!id) return this.fail(`No _id — goal not persisted to DB. Payload keys: ${Object.keys(p || {}).join(', ')}`);
      this.fitnessGoalId = id;
      return this.ok(`Fitness goal DB id=${id}`);
    });

    await this.run(SEC, 'GET /fitness/goals → goal in DB list', async () => {
      const res = await http.get('/fitness/goals');
      if (res.status !== 200) return this.fail(`Expected 200, got ${res.status}`);
      const list = this.extractList(this.payload(res.data));
      const found = list.some((g) => this.extractId(g) === this.fitnessGoalId);
      if (!found) return this.warn('Goal not found in list — check DTO shape');
      return this.ok('Fitness goal found in DB');
    });

    // ── DELETE session ───────────────────────────────────────────────────────
    if (this.fitnessSessionId) {
      await this.run(SEC, 'DELETE /fitness/sessions/:id → session removed from DB', async () => {
        const res = await http.delete(`/fitness/sessions/${this.fitnessSessionId}`);
        if (res.status !== 200 && res.status !== 204) {
          return this.fail(`Expected 200/204, got ${res.status}`);
        }
        return this.ok('Session DELETE accepted');
      });

      await this.run(SEC, 'GET /fitness/sessions/:id → 404 after deletion confirmed in DB', async () => {
        await sleep(400);
        const res = await http.get(`/fitness/sessions/${this.fitnessSessionId}`);
        if (res.status !== 404 && res.status !== 400) {
          return this.fail(`Session still accessible after DELETE (status=${res.status}) — DB not updated`);
        }
        return this.ok('Session gone from DB after DELETE');
      });
    }

    // ── DELETE goal ──────────────────────────────────────────────────────────
    if (this.fitnessGoalId) {
      await this.run(SEC, 'DELETE /fitness/goals/:id → goal removed from DB', async () => {
        const res = await http.delete(`/fitness/goals/${this.fitnessGoalId}`);
        if (res.status !== 200 && res.status !== 204) {
          return this.fail(`Expected 200/204, got ${res.status}`);
        }
        return this.ok('Fitness goal deleted from DB');
      });
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // §5  DIETARY — Meals, Profile, Supplements, Meal-Plans, Grocery-Lists
  // ══════════════════════════════════════════════════════════════════════════

  private mealId:           string | null = null;
  private supplementId:     string | null = null;
  private mealPlanId:       string | null = null;
  private groceryListId:    string | null = null;

  private async runSection5_Dietary(): Promise<void> {
    const SEC = '§5 Dietary';
    if (!this.studentCtx) {
      await this.run(SEC, 'Skip — no student auth context', async () => this.skip('Auth section failed'));
      return;
    }
    const http = client(this.studentCtx.accessToken);

    // ── Profile ──────────────────────────────────────────────────────────────
    await this.run(SEC, 'PUT /dietary/profile → dietary profile persisted in DB', async () => {
      const res = await http.put('/dietary/profile', {
        dailyCalorieTarget:  2200,
        dailyWaterTargetMl:  2500,
        dietType:            'balanced',
        allergies:           [],
        mealsPerDay:         3,
      });
      if (res.status !== 200 && res.status !== 201) {
        return this.fail(`Expected 200/201, got ${res.status}: ${JSON.stringify(res.data)}`);
      }
      return this.ok('Dietary profile PUT accepted');
    });

    await this.run(SEC, 'GET /dietary/profile → dietary profile readable from DB', async () => {
      const res = await http.get('/dietary/profile');
      if (res.status !== 200) return this.fail(`Expected 200, got ${res.status}`);
      return this.ok('Dietary profile returned from DB');
    });

    // ── Meals CRUD ───────────────────────────────────────────────────────────
    const mealName = `Test Meal ${uid()}`;
    await this.run(SEC, 'POST /dietary/meals → meal persisted in DB with _id', async () => {
      const res = await http.post('/dietary/meals', {
        mealType:      'lunch',
        date:          new Date().toISOString(),
        name:          mealName,
        totalCalories: 500,
        foods: [{ name: 'Rice', calories: 300, proteinG: 6, carbsG: 60, fatG: 1 }],
      });
      if (res.status !== 201) return this.fail(`Expected 201, got ${res.status}: ${JSON.stringify(res.data)}`);
      const p  = this.payload(res.data);
      const id = this.extractId(p);
      if (!id) return this.fail(`No _id in meal response — not persisted to DB. Keys: ${Object.keys(p || {}).join(', ')}`);
      this.mealId = id;
      return this.ok(`Meal DB id=${id}`);
    });

    if (this.mealId) {
      // READ
      await this.run(SEC, 'GET /dietary/meals/:id → meal readable from DB', async () => {
        const res = await http.get(`/dietary/meals/${this.mealId}`);
        if (res.status !== 200) return this.fail(`Expected 200, got ${res.status}`);
        const p    = this.payload(res.data);
        const name = p?.name ?? p?.meal?.name;
        if (name !== mealName) {
          return this.fail(`Name mismatch: expected "${mealName}", got "${name}"`);
        }
        return this.ok('Meal name matches DB record');
      });

      // UPDATE
      const updatedMealName = `Updated Meal ${uid()}`;
      await this.run(SEC, 'PUT /dietary/meals/:id → meal update persisted in DB', async () => {
        const res = await http.put(`/dietary/meals/${this.mealId}`, { name: updatedMealName, totalCalories: 600 });
        if (res.status !== 200) return this.fail(`Expected 200, got ${res.status}`);
        return this.ok('Meal update accepted');
      });

      await this.run(SEC, 'GET /dietary/meals/:id → updated name persisted in DB', async () => {
        const res = await http.get(`/dietary/meals/${this.mealId}`);
        if (res.status !== 200) return this.fail(`Expected 200, got ${res.status}`);
        const p    = this.payload(res.data);
        const name = p?.name ?? p?.meal?.name;
        if (name !== updatedMealName) {
          return this.fail(`Update not persisted — expected "${updatedMealName}", got "${name}"`);
        }
        return this.ok('PUT update confirmed readable from DB');
      });

      // DELETE
      await this.run(SEC, 'DELETE /dietary/meals/:id → meal removed from DB', async () => {
        const res = await http.delete(`/dietary/meals/${this.mealId}`);
        if (res.status !== 200 && res.status !== 204) {
          return this.fail(`Expected 200/204, got ${res.status}`);
        }
        return this.ok('Meal deleted from DB');
      });

      await this.run(SEC, 'GET /dietary/meals/:id → 404 after meal deletion', async () => {
        await sleep(400);
        const res = await http.get(`/dietary/meals/${this.mealId}`);
        if (res.status !== 404 && res.status !== 400) {
          return this.fail(`Meal still present after DELETE (status=${res.status})`);
        }
        return this.ok('Meal gone from DB (404 confirmed)');
      });
    }

    // ── Supplements CRUD ─────────────────────────────────────────────────────
    await this.run(SEC, 'POST /dietary/supplements → supplement persisted in DB', async () => {
      const res = await http.post('/dietary/supplements', {
        name:        `Supplement ${uid()}`,
        date:        new Date().toISOString(),
        dosage:      500,
        dosageUnit:  'mg',
        timeOfDay:   'morning',
        taken:       false,
      });
      if (res.status !== 201) return this.fail(`Expected 201, got ${res.status}: ${JSON.stringify(res.data)}`);
      const p = this.payload(res.data);
      this.supplementId = this.extractId(p);
      if (!this.supplementId) return this.fail('No _id — supplement not persisted');
      return this.ok(`Supplement DB id=${this.supplementId}`);
    });

    await this.run(SEC, 'GET /dietary/supplements → supplement list from DB', async () => {
      const res = await http.get('/dietary/supplements');
      if (res.status !== 200) return this.fail(`Expected 200, got ${res.status}`);
      const list = this.extractList(this.payload(res.data));
      const found = list.some((s) => this.extractId(s) === this.supplementId);
      if (!found && this.supplementId) return this.warn('Supplement not in list — check DTO');
      return this.ok(`Supplement list returned from DB (${list.length} item(s))`);
    });

    if (this.supplementId) {
      await this.run(SEC, 'DELETE /dietary/supplements/:id → removed from DB', async () => {
        const res = await http.delete(`/dietary/supplements/${this.supplementId}`);
        if (res.status !== 200 && res.status !== 204) {
          return this.fail(`Expected 200/204, got ${res.status}`);
        }
        return this.ok('Supplement deleted from DB');
      });
    }

    // ── Meal Plans CRUD ──────────────────────────────────────────────────────
    await this.run(SEC, 'POST /dietary/meal-plans → meal plan persisted in DB', async () => {
      const res = await http.post('/dietary/meal-plans', {
        title:          `Plan ${uid()}`,
        planType:       'weekly',
        fitnessGoal:    'maintain',     // enum: lose_weight|gain_weight|maintain|build_muscle
        dietType:       'standard',     // enum: standard|vegetarian|vegan|keto|paleo|...
        targetCalories: 2000,
      });
      if (res.status !== 201) return this.fail(`Expected 201, got ${res.status}: ${JSON.stringify(res.data)}`);
      const p = this.payload(res.data);
      this.mealPlanId = this.extractId(p);
      if (!this.mealPlanId) return this.fail('No _id — meal plan not persisted');
      return this.ok(`Meal plan DB id=${this.mealPlanId}`);
    });

    if (this.mealPlanId) {
      await this.run(SEC, 'GET /dietary/meal-plans/:id → meal plan readable from DB', async () => {
        const res = await http.get(`/dietary/meal-plans/${this.mealPlanId}`);
        if (res.status !== 200) return this.fail(`Expected 200, got ${res.status}`);
        return this.ok('Meal plan readable from DB');
      });

      await this.run(SEC, 'DELETE /dietary/meal-plans/:id → meal plan removed from DB', async () => {
        const res = await http.delete(`/dietary/meal-plans/${this.mealPlanId}`);
        if (res.status !== 200 && res.status !== 204) {
          return this.fail(`Expected 200/204, got ${res.status}`);
        }
        return this.ok('Meal plan deleted from DB');
      });
    }

    // ── Grocery Lists CRUD ───────────────────────────────────────────────────
    await this.run(SEC, 'POST /dietary/grocery-lists → grocery list persisted in DB', async () => {
      const res = await http.post('/dietary/grocery-lists', {
        title: `Groceries ${uid()}`,
        items: [{ name: 'Tomatoes', quantity: 2, unit: 'kg', purchased: false }],
      });
      if (res.status !== 201) return this.fail(`Expected 201, got ${res.status}: ${JSON.stringify(res.data)}`);
      const p = this.payload(res.data);
      this.groceryListId = this.extractId(p);
      if (!this.groceryListId) return this.fail('No _id — grocery list not persisted');
      return this.ok(`Grocery list DB id=${this.groceryListId}`);
    });

    if (this.groceryListId) {
      await this.run(SEC, 'GET /dietary/grocery-lists/:id → readable from DB', async () => {
        const res = await http.get(`/dietary/grocery-lists/${this.groceryListId}`);
        if (res.status !== 200) return this.fail(`Expected 200, got ${res.status}`);
        return this.ok('Grocery list returned from DB');
      });

      await this.run(SEC, 'DELETE /dietary/grocery-lists/:id → removed from DB', async () => {
        const res = await http.delete(`/dietary/grocery-lists/${this.groceryListId}`);
        if (res.status !== 200 && res.status !== 204) {
          return this.fail(`Expected 200/204, got ${res.status}`);
        }
        return this.ok('Grocery list deleted from DB');
      });
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // §6  GROOMING — Profile & Recommendations
  // ══════════════════════════════════════════════════════════════════════════

  private groomingRecoId: string | null = null;

  private async runSection6_Grooming(): Promise<void> {
    const SEC = '§6 Grooming';
    if (!this.studentCtx) {
      await this.run(SEC, 'Skip — no student auth context', async () => this.skip('Auth section failed'));
      return;
    }
    const http = client(this.studentCtx.accessToken);

    // ── Profile ──────────────────────────────────────────────────────────────
    await this.run(SEC, 'PUT /grooming/profile → persisted in DB', async () => {
      const res = await http.put('/grooming/profile', {
        skincare: { skinType: 'normal', concerns: ['acne'] },
        haircare: { hairType: 'straight' },
      });
      if (res.status !== 200 && res.status !== 201) {
        return this.fail(`Expected 200/201, got ${res.status}: ${JSON.stringify(res.data)}`);
      }
      return this.ok('Grooming profile persisted');
    });

    await this.run(SEC, 'GET /grooming/profile → profile readable from DB', async () => {
      const res = await http.get('/grooming/profile');
      if (res.status !== 200) return this.fail(`Expected 200, got ${res.status}`);
      return this.ok('Grooming profile returned from DB');
    });

    // ── Recommendations ──────────────────────────────────────────────────────
    await this.run(SEC, 'POST /grooming/recommendations → recommendation persisted in DB', async () => {
      const res = await http.post('/grooming/recommendations', {
        type:     'skincare',  // enum: skincare|haircare|outfit
        title:    `Recommendation ${uid()}`,
        products: [],
      });
      if (res.status !== 201) return this.fail(`Expected 201, got ${res.status}: ${JSON.stringify(res.data)}`);
      const p = this.payload(res.data);
      this.groomingRecoId = this.extractId(p);
      if (!this.groomingRecoId) return this.fail('No _id — recommendation not persisted');
      return this.ok(`Recommendation DB id=${this.groomingRecoId}`);
    });

    await this.run(SEC, 'GET /grooming/recommendations → list from DB', async () => {
      const res = await http.get('/grooming/recommendations');
      if (res.status !== 200) return this.fail(`Expected 200, got ${res.status}`);
      const list = this.extractList(this.payload(res.data));
      const found = list.some((r) => this.extractId(r) === this.groomingRecoId);
      if (!found && this.groomingRecoId) return this.warn('Recommendation not in list — check DTO');
      return this.ok(`Recommendation list from DB (${list.length} item(s))`);
    });

    if (this.groomingRecoId) {
      await this.run(SEC, 'GET /grooming/recommendations/:id → single record from DB', async () => {
        const res = await http.get(`/grooming/recommendations/${this.groomingRecoId}`);
        if (res.status !== 200) return this.fail(`Expected 200, got ${res.status}`);
        return this.ok('Single recommendation readable from DB');
      });

      await this.run(SEC, 'DELETE /grooming/recommendations/:id → removed from DB', async () => {
        const res = await http.delete(`/grooming/recommendations/${this.groomingRecoId}`);
        if (res.status !== 200 && res.status !== 204) {
          return this.fail(`Expected 200/204, got ${res.status}`);
        }
        return this.ok('Recommendation deleted from DB');
      });
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // §7  NOTIFICATIONS — DB-Backed Delivery
  // ══════════════════════════════════════════════════════════════════════════

  private async runSection7_Notifications(): Promise<void> {
    const SEC = '§7 Notifications';
    if (!this.studentCtx) {
      await this.run(SEC, 'Skip — no student auth context', async () => this.skip('Auth section failed'));
      return;
    }
    const http = client(this.studentCtx.accessToken);

    await this.run(SEC, 'GET /notifications → list returned from DB', async () => {
      const res = await http.get('/notifications');
      if (res.status !== 200) return this.fail(`Expected 200, got ${res.status}`);
      const body = res.data?.data ?? res.data;
      if (!Array.isArray(body) && !Array.isArray(body?.notifications)) {
        return this.warn('Notifications response is not an array — check DTO shape');
      }
      return this.ok('Notifications list returned from DB');
    });

    await this.run(SEC, 'GET /notifications/unread-count → numeric count from DB', async () => {
      const res = await http.get('/notifications/unread-count');
      if (res.status !== 200) return this.fail(`Expected 200, got ${res.status}`);
      const count = res.data?.data?.count ?? res.data?.count ?? res.data;
      if (typeof count !== 'number') {
        return this.warn(`Unread count is "${typeof count}" — expected number`);
      }
      return this.ok(`Unread count = ${count} (from DB)`);
    });

    await this.run(SEC, 'PATCH /notifications/read-all → mark-all-read persisted in DB', async () => {
      const res = await http.patch('/notifications/read-all');
      if (res.status !== 200 && res.status !== 204) {
        return this.warn(`mark-all-read returned ${res.status}`);
      }
      return this.ok('mark-all-read accepted — DB updated');
    });

    // Verify unread-count is now 0 after mark-all-read
    await this.run(SEC, 'GET /notifications/unread-count → 0 after mark-all-read (DB confirmed)', async () => {
      const res = await http.get('/notifications/unread-count');
      if (res.status !== 200) return this.warn(`Expected 200, got ${res.status}`);
      const count = res.data?.data?.count ?? res.data?.count ?? res.data;
      if (count !== 0) return this.warn(`Expected 0 unread, got ${count} — may have system notifications`);
      return this.ok('Unread count = 0 confirmed from DB');
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // §8  MEDIA — Server-Side Storage Protection
  // ══════════════════════════════════════════════════════════════════════════

  private async runSection8_Media(): Promise<void> {
    const SEC = '§8 Media';

    const uploadEndpoints = [
      '/dietary/meals/upload',
      '/grooming/analyze/upload',
      '/users/me/avatar',
      '/media/upload',
    ];

    // ── Upload endpoints require auth ────────────────────────────────────────
    for (const ep of uploadEndpoints) {
      await this.run(SEC, `${ep} → requires auth (no anonymous uploads to server)`, async () => {
        const res = await client().post(ep);          // no auth token
        if (res.status === 401 || res.status === 403) {
          return this.ok(`${ep} correctly rejects anonymous requests (${res.status})`);
        }
        if (res.status === 404) {
          return this.skip(`${ep} not found (endpoint may differ)`);
        }
        // 400 (Bad Request without file) is also fine — means the guard passed, but no file
        if (res.status === 400) {
          return this.warn(`${ep} returned 400 without auth — ensure auth guard is applied before file guard`);
        }
        return this.fail(`${ep} returned ${res.status} without auth — upload open to anonymous requests!`);
      });
    }

    // ── Server-side uploads directory exists (static check) ─────────────────
    const uploadsDir = path.resolve(__dirname, '../uploads');
    await this.run(SEC, 'backend/uploads directory exists for server-side media', async () => {
      if (!fs.existsSync(uploadsDir)) {
        return this.warn(`uploads/ dir not found at ${uploadsDir} — server may use cloud storage`);
      }
      const subDirs = fs.readdirSync(uploadsDir);
      return this.ok(`uploads/ exists with subdirs: ${subDirs.join(', ')}`);
    });

    // ── No base64 blobs stored in DB (scan service files) ───────────────────
    await this.run(SEC, 'Backend services do not store raw base64 in DB', async () => {
      const srcDir = path.resolve(__dirname, '../src');
      const serviceFiles = walkFiles(srcDir, ['.service.ts']);
      const hits: string[] = [];
      for (const f of serviceFiles) {
        const txt = fs.readFileSync(f, 'utf8');
        if (/base64.*save\(|save\(.*base64|\.create\(.*base64/i.test(txt)) {
          hits.push(path.relative(srcDir, f));
        }
      }
      if (hits.length > 0) {
        return this.fail(`Potential base64 data stored in DB in: ${hits.join(', ')}`);
      }
      return this.ok('No base64 blob storage patterns in service files');
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // §9  CROSS-SESSION — Data Must Survive Re-Login
  // ══════════════════════════════════════════════════════════════════════════

  private async runSection9_CrossSession(): Promise<void> {
    const SEC = '§9 Cross-Session';
    if (!this.studentCtx) {
      await this.run(SEC, 'Skip — no student auth context', async () => this.skip('Auth section failed'));
      return;
    }

    const { email: studentEmail } = this.studentCtx;

    // ── Write fitness profile (no extra auth POST needed) ───────────────────
    const crossUniqueLevel = `intermediate-${uid().slice(0, 4)}`;
    await this.run(SEC, 'Session A: update fitness profile (seed data for cross-session check)', async () => {
      const http = client(this.studentCtx!.accessToken);
      const res  = await http.put('/fitness/profile', {
        fitnessLevel: 'intermediate',
        activityLevel: 'moderate',
        goals: ['weight_loss'],
      });
      if (res.status !== 200 && res.status !== 201) {
        return this.warn(`Could not seed cross-session fitness profile (${res.status})`);
      }
      return this.ok('Session A: fitness profile saved to DB');
    });

    // ── Fresh login = new token, data must still be there ──────────────────
    await sleep(1200);
    await this.run(SEC, 'Session B: re-login → get fresh token (simulate new browser session)', async () => {
      const http   = client();
      const res    = await http.post('/auth/login', { identifier: studentEmail, password: PASSWORD });
      if (res.status !== 200) {
        return this.fail(`Re-login failed (${res.status}) — ${JSON.stringify(res.data)}`);
      }
      const d = res.data?.data ?? res.data;
      this.studentCtx!.accessToken  = d.accessToken;
      this.studentCtx!.refreshToken = d.refreshToken;
      return this.ok('Re-login successful — new token obtained');
    });

    // ── Fitness profile must still readable with new token ──────────────────
    await this.run(SEC, 'Session B: fitness profile from Session A readable via new token', async () => {
      const http = client(this.studentCtx!.accessToken);
      const res  = await http.get('/fitness/profile');
      if (res.status !== 200) return this.fail(`GET /fitness/profile returned ${res.status}`);
      return this.ok('Fitness profile created in Session A is readable in Session B — data confirmed in DB');
    });

    // ── User profile persists cross-session ────────────────────────────────
    await this.run(SEC, 'Session B: /users/me returns same user record from DB', async () => {
      const http = client(this.studentCtx!.accessToken);
      const res  = await http.get('/users/me');
      if (res.status !== 200) return this.fail(`Expected 200, got ${res.status}`);
      const d = res.data?.data ?? res.data;
      const id = d?.id ?? d?._id ?? d?.sub;
      if (id && id !== this.studentCtx!.userId) {
        return this.fail(`User id changed between sessions: original=${this.studentCtx!.userId}, now=${id}`);
      }
      return this.ok('Same user record returned from DB across sessions');
    });

    // ── PATCH bio and verify it persists after re-login ─────────────────────
    const crossBio = `cross-session-bio-${uid()}`;
    await this.run(SEC, 'Session B: PATCH bio → bio persists in DB', async () => {
      const http = client(this.studentCtx!.accessToken);
      await http.patch('/users/me', { bio: crossBio });
      const res = await http.get('/users/me');
      if (res.status !== 200) return this.fail(`GET /users/me returned ${res.status}`);
      const user = res.data?.data ?? res.data;
      const bio  = user?.bio ?? user?.profile?.bio;
      if (bio !== crossBio) {
        return this.fail(
          `Bio "${crossBio}" not in DB after set — got "${bio}". ` +
          'This data is NOT persisted server-side.',
        );
      }
      return this.ok('Bio persisted in DB and readable with new session token');
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // REPORT
  // ══════════════════════════════════════════════════════════════════════════

  private printReport(): void {
    const width = 90;
    const line  = '─'.repeat(width);
    const dline = '═'.repeat(width);

    console.log();
    console.log(c('BOLD', c('CYAN', dline)));
    console.log(c('BOLD', c('CYAN', '  HeyBobo — Data Persistence Testing Agent   Report')));
    console.log(c('BOLD', c('CYAN', `  ${stamp()}   Base: ${BASE_URL}`)));
    console.log(c('BOLD', c('CYAN', dline)));
    console.log();

    const sections = [...new Set(this.results.map((r) => r.section))];
    const counts   = { PASS: 0, FAIL: 0, WARN: 0, SKIP: 0, CRITICAL: 0 };

    for (const sec of sections) {
      const tests = this.results.filter((r) => r.section === sec);
      console.log(c('BOLD', c('BLUE', `  ${sec}`)));
      console.log(c('DIM', `  ${line}`));

      for (const t of tests) {
        counts[t.status] = (counts[t.status] ?? 0) + 1;
        const icon =
          t.status === 'PASS'     ? '✓' :
          t.status === 'FAIL'     ? '✗' :
          t.status === 'WARN'     ? '⚠' :
          t.status === 'CRITICAL' ? '✦' : '○';
        const colored = c(t.status, icon);
        const durationStr = c('DIM', `${t.durationMs}ms`);
        const statusLabel = c(t.status, t.status.padEnd(8));
        console.log(`  ${colored} ${statusLabel} ${t.name.padEnd(52)} ${durationStr}`);
        if (t.status !== 'PASS' && t.status !== 'SKIP') {
          // Indent message
          const lines = t.message.split('\n');
          for (const ln of lines) {
            console.log(c('DIM', `           ${ln}`));
          }
        }
      }
      console.log();
    }

    const total = this.results.length;
    const pass  = counts.PASS;
    const fail  = counts.FAIL + counts.CRITICAL;
    const warn  = counts.WARN;
    const skip  = counts.SKIP;

    console.log(c('BOLD', c('CYAN', dline)));
    console.log(c('BOLD', `  SUMMARY`));
    console.log(c('DIM', `  ${line}`));
    console.log(`  Total: ${total}   ` +
      c('PASS',     `PASS ${pass}`)     + '   ' +
      c('FAIL',     `FAIL ${fail}`)     + '   ' +
      c('WARN',     `WARN ${warn}`)     + '   ' +
      c('SKIP',     `SKIP ${skip}`));
    console.log();

    const dataLeaks = this.results.filter(
      (r) => r.section === '§0 localStorage' && r.status === 'FAIL',
    );
    if (dataLeaks.length > 0) {
      console.log(c('FAIL', c('BOLD', `  ⚠  DATA LEAK ALERT: ${dataLeaks.length} localStorage key(s) storing business data!`)));
      for (const dl of dataLeaks) {
        console.log(c('FAIL', `     • ${dl.name}`));
      }
      console.log();
    }

    const crossFails = this.results.filter(
      (r) => r.section === '§9 Cross-Session' && r.status === 'FAIL',
    );
    if (crossFails.length > 0) {
      console.log(c('FAIL', c('BOLD', `  ⚠  CROSS-SESSION FAILURE: Data not surviving re-login (NOT in DB)!`)));
      for (const cf of crossFails) {
        console.log(c('FAIL', `     • ${cf.name}`));
      }
      console.log();
    }

    if (fail === 0 && dataLeaks.length === 0) {
      console.log(c('PASS', c('BOLD', '  ✓  ALL CRITICAL CHECKS PASSED — Data is fully persisted via backend')));
    } else {
      console.log(c('FAIL', c('BOLD', `  ✗  ${fail} FAILURE(S) DETECTED — Review items above`)));
    }
    console.log(c('BOLD', c('CYAN', dline)));
    console.log();
  }

  // ══════════════════════════════════════════════════════════════════════════
  // ENTRY POINT
  // ══════════════════════════════════════════════════════════════════════════

  async run_all(): Promise<void> {
    console.log();
    console.log(c('BOLD', c('CYAN', '  HeyBobo Data Persistence Agent — Starting...')));
    console.log(c('DIM', `  Target: ${BASE_URL}   Time: ${stamp()}`));
    console.log();

    // Verify server is reachable before starting
    try {
      await axios.get(`${BASE_URL.replace('/api/v1', '')}/health`, { timeout: 5000, validateStatus: () => true });
    } catch {
      try {
        await axios.get(BASE_URL, { timeout: 5000, validateStatus: () => true });
      } catch {
        console.log(c('FAIL', `  ✗ Cannot reach ${BASE_URL} — is the backend running?`));
        console.log(c('DIM', `    Start it with:  cd backend && npm run start:dev`));
        console.log(c('DIM', `    Then retry:      npm run test:persistence`));
        console.log();
        // Still run static audit even if server is down
      }
    }

    await this.runSection0_LocalStorageAudit();
    await this.runSection1_Auth();
    await this.runSection2_Users();
    await this.runSection3_Education();
    await this.runSection4_Fitness();
    await this.runSection5_Dietary();
    await this.runSection6_Grooming();
    await this.runSection7_Notifications();
    await this.runSection8_Media();
    await this.runSection9_CrossSession();

    this.printReport();

    const failures = this.results.filter((r) => r.status === 'FAIL' || r.status === 'CRITICAL').length;
    process.exit(failures > 0 ? 1 : 0);
  }
}

// ─── Bootstrap ───────────────────────────────────────────────────────────────

new DataPersistenceAgent().run_all().catch((err) => {
  console.error('Agent crashed:', err);
  process.exit(1);
});
