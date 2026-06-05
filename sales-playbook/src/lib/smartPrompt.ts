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
  const isClose = activeStageId === 'close'

  // VDI/Citrix shop — Cameyo TCO is the move
  if (isVdi && isClose) {
    return {
      question: 'Are you open to a side-by-side cost comparison — what you\'re spending on your current setup vs. Cameyo? Most customers are surprised by the gap.',
      rationale: 'At close stage with a VDI customer, total cost of ownership is typically the final unlock.',
      product: 'cameyo',
    }
  }

  if (isVdi) {
    return {
      question: 'What\'s the per-seat cost of your current setup today — including licenses, infrastructure maintenance, and the IT hours to keep it running?',
      rationale: 'Get the number early. The Cameyo TCO comparison (typically 40–60% lower) is your strongest differentiator.',
      product: 'cameyo',
    }
  }

  // Security incident pain — CEP urgency
  if (hasSecurityPain) {
    return {
      question: 'When that happened — was the browser involved? And did you have any visibility into what the user was doing inside the browser at the time?',
      rationale: 'Connects their lived security pain directly to the browser visibility gap that CEP solves.',
      product: 'cep',
    }
  }

  // Industry-specific pivots
  if (context.industry === 'financial-services') {
    return {
      question: 'How are you handling compliance requirements around browser-based data access — screen capture controls, download restrictions, preventing data leaving via personal cloud storage?',
      rationale: 'Compliance creates internal urgency and provides budget justification that security alone often can\'t.',
      product: 'cep',
    }
  }

  if (context.industry === 'manufacturing') {
    return {
      question: 'Do your operations or engineering teams access any Windows-based ERP, MES, or legacy systems — and how are those delivered to them today?',
      rationale: 'Manufacturing almost always has a legacy app dependency that opens the Cameyo conversation directly.',
      product: 'cameyo',
    }
  }

  if (context.industry === 'retail') {
    return {
      question: 'Do your store staff or contractors access back-office systems on shared or unmanaged devices — and can IT see or control what they do in the browser?',
      rationale: 'Retail\'s high staff turnover and unmanaged devices create both a CEP (DLP/policy) and Cameyo (app delivery to thin clients) opportunity.',
      product: 'both',
    }
  }

  // BYOD / unmanaged device pain
  if (hasByodPain) {
    return {
      question: 'When a contractor or remote worker accesses your systems today — what controls do you actually have on what they can see, copy, or download?',
      rationale: 'Data exfiltration via unmanaged devices is CEP\'s clearest value proposition. Most customers have no answer to this.',
      product: 'cep',
    }
  }

  // Small team — affordability angle
  if (
    (context.companySize === '11-50' || context.companySize === '51-200') &&
    activeStageId === 'pitch'
  ) {
    return {
      question: 'Is browser security something IT has actively looked into — or has it been deprioritised because the team is stretched thin?',
      rationale: 'Smaller IT teams often know they have gaps but lack the bandwidth to fix them. CEP\'s low management overhead is a direct answer.',
      product: 'cep',
    }
  }

  // Close stage — generic use case framing
  if (isClose) {
    return {
      question: 'Before we talk next steps — do you see this primarily as a security play, an infrastructure simplification, or both?',
      rationale: 'Confirming framing before moving to pilot structure avoids misaligned proposals.',
      product: 'both',
    }
  }

  // Default — no strong signal yet
  return {
    question: 'If you could solve one browser-related headache for your IT team this quarter — what would it be?',
    rationale: 'Open-ended question designed to surface a pain point you haven\'t uncovered yet.',
    product: 'both',
  }
}
