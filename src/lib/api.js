// Central AI helper. Supports Google Gemini (best free tier) or OpenAI.
// The API key is entered by the user in Settings and stored in localStorage only
// (never sent anywhere except directly to the provider's API from the browser).

const KEY_STORAGE = 'khatra_api_key'
const PROVIDER_STORAGE = 'khatra_provider' // 'gemini' | 'openai'

export function getApiKey() {
  return localStorage.getItem(KEY_STORAGE) || ''
}
export function setApiKey(key) {
  localStorage.setItem(KEY_STORAGE, key)
}
export function getProvider() {
  return localStorage.getItem(PROVIDER_STORAGE) || 'gemini'
}
export function setProvider(p) {
  localStorage.setItem(PROVIDER_STORAGE, p)
}

/**
 * Analyze a photo for industrial safety hazards.
 * imageBase64: raw base64 string (no data: prefix)
 * Returns: { hazards: [{label, severity, description, bbox:[x,y,w,h] (0-1 normalized)}], summary }
 */
export async function analyzeHazardImage(imageBase64, mimeType = 'image/jpeg') {
  const provider = getProvider()
  const key = getApiKey()
  if (!key) throw new Error('NO_API_KEY')

  const prompt = `You are an industrial safety inspector AI trained on mining and manufacturing safety standards (DGMS, OSHA-equivalent Indian norms).
Look at this workplace photo and identify visible safety hazards or violations (e.g. missing PPE like helmet/gloves/goggles, exposed wiring, unguarded machinery, poor housekeeping, blocked exits, improper lifting posture, missing signage).

Respond ONLY with valid JSON, no markdown, no backticks, in this exact shape:
{
  "hazards": [
    {
      "label": "short hazard name",
      "severity": "low" | "medium" | "high",
      "description": "one sentence explaining the risk",
      "bbox": [x, y, w, h]
    }
  ],
  "summary": "one or two sentence overall safety assessment",
  "riskScore": 0-100
}
bbox values are normalized 0 to 1 (fraction of image width/height) for where the hazard appears. If you cannot localize precisely, make a reasonable estimate. If no hazards are visible, return an empty hazards array and a low riskScore.`

  if (provider === 'gemini') {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                { inline_data: { mime_type: mimeType, data: imageBase64 } },
              ],
            },
          ],
          generationConfig: { temperature: 0.3 },
        }),
      }
    )
    const data = await res.json()
    if (!res.ok) throw new Error(data?.error?.message || 'Gemini API error')
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
    return parseJsonSafe(text)
  }

  if (provider === 'openai') {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.3,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: `data:${mimeType};base64,${imageBase64}` } },
            ],
          },
        ],
      }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data?.error?.message || 'OpenAI API error')
    const text = data.choices?.[0]?.message?.content || '{}'
    return parseJsonSafe(text)
  }

  throw new Error('Unknown provider')
}

/**
 * Conversational AI trainer — given scenario context + user's message/choice history,
 * returns the next coaching line and feedback.
 */
export async function askTrainer(systemContext, messages) {
  const provider = getProvider()
  const key = getApiKey()
  if (!key) throw new Error('NO_API_KEY')

  if (provider === 'gemini') {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemContext }] },
          contents: messages.map((m) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
          })),
          generationConfig: { temperature: 0.6 },
        }),
      }
    )
    const data = await res.json()
    if (!res.ok) throw new Error(data?.error?.message || 'Gemini API error')
    return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
  }

  if (provider === 'openai') {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.6,
        messages: [{ role: 'system', content: systemContext }, ...messages],
      }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data?.error?.message || 'OpenAI API error')
    return data.choices?.[0]?.message?.content || ''
  }

  throw new Error('Unknown provider')
}

function parseJsonSafe(text) {
  try {
    const cleaned = text.replace(/```json|```/g, '').trim()
    return JSON.parse(cleaned)
  } catch (e) {
    return { hazards: [], summary: 'Could not parse AI response.', riskScore: 0, raw: text }
  }
}

/**
 * Full-site knowledge base for the KHATRA assistant chatbot, so it can answer
 * "how does this app work" style questions accurately for any page/feature.
 */
export const SITE_KNOWLEDGE = `You are the in-app assistant for KHATRA, an AI-powered industrial safety training web app for mining and manufacturing workers in Jharkhand, India (built for SIH problem statement CY-1).

You know every part of this app in detail:

1. HOME (/) — Landing page explaining what KHATRA does: trains workers to recognize hazards using a phone camera and an AI safety inspector, no headset or classroom needed. Has two main call-to-action buttons: "Scan a Hazard" (goes to Hazard Scan) and "Start Simulator" (goes to Simulator). Also explains the 3-step flow: point camera, see hazards marked, train the reflex with scenarios.

2. HAZARD SCAN (/scan) — User uploads or photographs (via phone camera, using capture="environment") a real work-area photo. The app sends the image to an AI vision model (Gemini or OpenAI, chosen in Settings) which returns a JSON list of hazards, each with a label, severity (low/medium/high), a plain-language description, and a bounding box position. These are drawn directly on top of the photo as colored boxes (green=safe context, amber=medium, red=high severity). A risk score (0-100) and a spoken summary (read aloud via the browser's built-in text-to-speech) are also shown. Requires an API key to be set in Settings first — if missing, the app shows a "No API key set" message with a link to Settings.

3. SIMULATOR (/train and /train/:id) — A list of branching decision scenarios. Currently three: "Descending the Mine Shaft" (Mining sector — gas detector checks, missing self-rescue devices, roof instability), "On the Factory Floor" (Manufacturing sector — machine guards, lifting posture, electrical fire smells), and "Warehouse & Loading Bay" (Manufacturing sector — forklift safety, unsecured stacked loads, damaged ladders). Each scenario has multiple decision points; the user picks between two choices per step, each choice awards or deducts points and shows feedback explaining why it was safe or unsafe. After the base feedback, if an API key is set, the app also asks the AI trainer for one extra short coaching tip specific to that situation, and speaks it aloud. At the end, the user sees a safety score percentage and their results are saved to their local Dashboard.

4. DASHBOARD (/dashboard) — Shows the user's local training history: total sessions, number of hazard scans run, number of scenarios completed, and average scenario score. Below that is an activity log listing every past scan and scenario attempt with score/risk and timestamp. All of this is stored only in the browser's local storage on that device — nothing is sent to any server. There's a "Clear log" button to wipe this history.

5. SETTINGS (/settings) — Where the user picks their AI provider (Google Gemini or OpenAI) and pastes in their own free API key. Gemini is recommended because it has a more generous free tier — get one at aistudio.google.com/apikey, no credit card needed. OpenAI keys usually require billing setup at platform.openai.com/api-keys. The key is stored only in that browser's local storage and is sent directly from the browser to the provider's API — KHATRA has no backend server and never sees or stores the key itself. This page is also where the app language is chosen (English, Hindi, Bengali, Odia, or Urdu) — this changes all UI text and scenario content instantly.

TECHNICAL FACTS you may be asked about:
- Built with React + Vite, styled with Tailwind CSS.
- No backend server at all — it's a fully static site. All AI calls go directly from the user's browser to Google Gemini or OpenAI's API using their own key.
- Voice narration uses the free browser Web Speech API (no extra cost, works offline for already-generated text, but the AI hazard/coaching analysis itself needs an internet connection to reach the AI provider).
- Nothing about photos or scores is sent to KHATRA's own servers — there are none. Photos go straight to the chosen AI provider for analysis and are not stored by KHATRA afterward.
- The scenario content is data-driven (a JS file listing scenarios, steps, choices, and feedback), so adding new scenarios doesn't require rebuilding the whole app's logic.
- Supports 5 languages: English, Hindi (हिन्दी), Bengali (বাংলা), Odia (ଓଡ଼ିଆ), and Urdu (اردو) — covers UI text, page copy, and all scenario dialogue/choices/feedback.
- This is a hackathon-stage prototype (SIH CY-1), intentionally scoped as "camera-overlay AR-style" hazard detection rather than full spatial/SLAM-tracked AR, since that would need specialized hardware and device-level 3D tracking out of scope for this build. It runs on any phone browser with no extra hardware needed.

HOW TO ANSWER:
- Be concise, warm, and practical — like a helpful in-app guide, not a formal document.
- If asked "how do I..." questions, give clear step-by-step direction using the actual page/button names above.
- If asked about something outside this app's scope (unrelated topics), gently redirect back to what you can help with regarding KHATRA.
- If you don't know a specific answer (e.g. exact accident statistics), say so honestly rather than making it up.
- Reply in the same language the user is asking in, or in the app's currently selected language if given.`

/**
 * General-purpose assistant chat, aware of the whole site. Reuses the same
 * provider/key infra as askTrainer but with a dedicated system prompt.
 */
export async function askSiteAssistant(messages, languageName) {
  const systemContext = SITE_KNOWLEDGE + (languageName ? `\n\nRespond in ${languageName}.` : '')
  return askTrainer(systemContext, messages)
}
