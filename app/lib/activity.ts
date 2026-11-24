// Generate a unique session ID
export function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

async function send(method: 'POST' | 'PATCH', body: object): Promise<{ error: Error | null }> {
  try {
    const res = await fetch('/api/activity', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) return { error: new Error(`Activity API responded ${res.status}`) }
    return { error: null }
  } catch (error) {
    return { error: error as Error }
  }
}

// Create a new activity record
export function createActivityRecord(sessionId: string) {
  return send('POST', { sessionId })
}

// Update activity record with personality result
export function updateActivityRecord(sessionId: string, personality: string) {
  return send('PATCH', { sessionId, personality })
}
