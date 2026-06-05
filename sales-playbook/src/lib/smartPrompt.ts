import { PreCallContext } from '@/types'

export interface SmartPrompt {
  question: string
  rationale: string
  product: 'cep' | 'cameyo' | 'both'
}

function matches(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase()
  return keywords.some((k) => lower.includes(k))
}

export function getSmartPrompt(
  context: PreCallContext | null,
  activeStageId: string,
): SmartPrompt | null {
  if (!context) return null

  const solution = context.currentSolution ?? ''
  const pain     = context.knownPainPoints ?? ''
  const combined = `${solution} ${pain}`

  const isVdi = matches(solution, [
    'citrix', 'vmware', 'horizon', 'xenapp', 'xendesktop',
    'rds', 'rdp', 'remote desktop', 'thin client', 'vdi', 'terminal server',
  ])
  const hasSecurityPain = matches(combined, [
    'phish', 'malware', 'ransom', 'breach', 'incident', 'attack', 'hack', 'compromise',
  ])
  const hasByodPain = matches(combined, [
    'byod', 'unmanaged', 'personal device', 'contractor', 'bring your own',
  ])
  const isFinancial     = context.industry === 'financial-services'
  const isManufacturing = context.industry === 'manufacturing'
  const isRetail        = context.industry === 'retail'

  // ── DISCOVERY ────────────────────────────────────────────────
  if (activeStageId === 'discovery') {
    if (isVdi) {
      return {
        question: "What's the per-seat cost of your current setup today — licenses, infrastructure maintenance, and the IT hours to keep it running?",
        rationale: 'Get the number early. The Cameyo TCO comparison (typically 40–60% lower) lands hardest when you have their actual figure.',
        product: 'cameyo',
      }
    }
    if (hasSecurityPain) {
      return {
        question: "When that happened — was the browser involved? And did you have any visibility into what the user was doing inside the browser at the time?",
        rationale: 'Connects their lived security pain directly to the browser visibility gap that CEP solves.',
        product: 'cep',
      }
    }
    if (hasByodPain) {
      return {
        question: "When a contractor or remote worker accesses your systems today — what controls do you actually have on what they can see, copy, or download?",
        rationale: "Data exfiltration via unmanaged devices is CEP's clearest value prop. Most customers have no real answer to this.",
        product: 'cep',
      }
    }
    if (isFinancial) {
      return {
        question: "How are you handling compliance requirements around browser-based data access — screen capture controls, download restrictions, preventing data leaving via personal cloud?",
        rationale: 'Compliance creates internal urgency and budget justification that security alone often cannot.',
        product: 'cep',
      }
    }
    if (isManufacturing) {
      return {
        question: "Do your operations or engineering teams access Windows-based ERP, MES, or legacy systems — and how are those delivered today?",
        rationale: 'Manufacturing almost always has a legacy app dependency that opens the Cameyo conversation directly.',
        product: 'cameyo',
      }
    }
    if (isRetail) {
      return {
        question: "Do your store staff or contractors access back-office systems on shared or unmanaged devices — and can IT see or control what they do in the browser?",
        rationale: "Retail's high turnover and unmanaged devices create both a CEP and Cameyo opportunity.",
        product: 'both',
      }
    }
    return {
      question: "If you could solve one browser-related headache for your IT team this quarter — what would it be?",
      rationale: 'Open-ended question to surface the pain point that will drive urgency in the pitch.',
      product: 'both',
    }
  }

  // ── PITCH ────────────────────────────────────────────────────
  if (activeStageId === 'pitch') {
    if (isVdi) {
      return {
        question: "Are you open to a side-by-side cost comparison — what you're spending on your current setup vs. what Cameyo customers pay? Most see 40–60% lower total cost.",
        rationale: 'At pitch stage with VDI customers, a concrete cost comparison is often the decisive unlock.',
        product: 'cameyo',
      }
    }
    if (isFinancial) {
      return {
        question: "For your audit and compliance team — how are you currently generating evidence that browser-based access is controlled? Is that a manual process or automated?",
        rationale: 'Surfaces a compliance gap that creates urgency and internal budget justification.',
        product: 'cep',
      }
    }
    if (hasSecurityPain) {
      return {
        question: "If I could show you exactly which browser extensions your users have installed, and which ones are uploading data right now — would that change the conversation with your CISO?",
        rationale: "Makes the CEP telemetry value concrete and ties it to their existing security concern.",
        product: 'cep',
      }
    }
    return {
      question: "Of everything I've described — which part is most relevant to what your team is dealing with right now?",
      rationale: 'Confirms resonance before moving to next steps. Surfaces blockers early rather than at close.',
      product: 'both',
    }
  }

  // ── OBJECTIONS ───────────────────────────────────────────────
  if (activeStageId === 'objections') {
    if (isVdi) {
      return {
        question: "The IT teams I speak to often worry about what happens to their role if they move away from Citrix — has that conversation come up internally?",
        rationale: 'A political blocker can kill deals even when the business case is clear. Better to surface it now.',
        product: 'cameyo',
      }
    }
    if (hasSecurityPain) {
      return {
        question: "If you could give IT full visibility into what users do inside Chrome — without installing any agents on the endpoint — would that change how you're thinking about this?",
        rationale: "Reframes the CEP value prop around the zero-agent install advantage, which handles the 'complex deployment' objection.",
        product: 'cep',
      }
    }
    return {
      question: "What's the conversation you'd need to have internally to get this moving — and who else needs to be in that room?",
      rationale: 'Surfaces the internal process and decision-makers. Helps you navigate to a concrete next step.',
      product: 'both',
    }
  }

  return null
}
