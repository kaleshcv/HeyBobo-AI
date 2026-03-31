/**
 * Production API Login Test
 * Run with: node test-production-login.js
 *
 * Tests the production API at https://app.heybobo.ai/api/v1
 * before building the APK.
 */

const API_URL = 'https://app.heybobo.ai/api/v1'

// ── CONFIGURE YOUR TEST CREDENTIALS HERE ──────────────────────────────────────
const TEST_IDENTIFIER = process.env.TEST_EMAIL    || 'your-test@email.com'
const TEST_PASSWORD   = process.env.TEST_PASSWORD || 'your-test-password'
// ─────────────────────────────────────────────────────────────────────────────

async function testLogin() {
  console.log('🔍 Testing production API at:', API_URL)
  console.log('─'.repeat(50))

  // ── 1. Health check ─────────────────────────────────────────────────────────
  console.log('\n[1/4] Health check...')
  try {
    const res = await fetch(`${API_URL}/health`, { signal: AbortSignal.timeout(8000) })
    if (res.ok) {
      const data = await res.json().catch(() => ({}))
      console.log('✅ Server is up:', res.status, JSON.stringify(data).slice(0, 100))
    } else {
      console.log(`⚠️  Health endpoint returned ${res.status} (may not exist, continuing...)`)
    }
  } catch (err) {
    console.log('⚠️  Health check failed:', err.message, '— server may still work')
  }

  // ── 2. Login request (uses "identifier" field, not "email") ──────────────────
  console.log('\n[2/4] Attempting login with:', TEST_IDENTIFIER)
  let accessToken = null
  try {
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ identifier: TEST_IDENTIFIER, password: TEST_PASSWORD }),
      signal:  AbortSignal.timeout(10000),
    })

    const body = await loginRes.json()
    const data = body?.data ?? body   // unwrap { success, data } envelope

    if (loginRes.ok && (data?.accessToken || data?.token)) {
      accessToken = data.accessToken || data.token
      console.log('✅ Login succeeded!')
      console.log('   User:', data.user?.email || data.email || '(no email in response)')
      console.log('   Role:', data.user?.role  || data.role  || '(no role)')
      console.log('   Token (first 20 chars):', accessToken.slice(0, 20) + '...')
    } else {
      console.log('❌ Login failed:', loginRes.status, JSON.stringify(body).slice(0, 300))
      process.exit(1)
    }
  } catch (err) {
    console.log('❌ Login request error:', err.message)
    process.exit(1)
  }

  // ── 3. Authenticated request (profile) ──────────────────────────────────────
  console.log('\n[3/4] Testing authenticated endpoint (/users/me or /profile)...')
  for (const endpoint of ['/users/me', '/profile', '/auth/me']) {
    try {
      const meRes = await fetch(`${API_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        signal:  AbortSignal.timeout(8000),
      })
      const meBody = await meRes.json().catch(() => null)
      if (meRes.ok) {
        const d = meBody?.data ?? meBody
        console.log(`✅ ${endpoint} returned ${meRes.status}`)
        console.log('   Name:', d?.firstName, d?.lastName)
        console.log('   Email:', d?.email)
        break
      } else {
        console.log(`   ${endpoint} → ${meRes.status}`)
      }
    } catch (err) {
      console.log(`   ${endpoint} → error: ${err.message}`)
    }
  }

  // ── 4. Summary ───────────────────────────────────────────────────────────────
  console.log('\n' + '─'.repeat(50))
  console.log('✅ Production API is working!')
  console.log('   API URL:  ', API_URL)
  console.log('   Login:     OK')
  console.log('\n📱 You can now build the APK:')
  console.log('   eas build --platform android --profile apk')
}

testLogin().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
