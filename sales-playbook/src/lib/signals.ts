export interface Signal {
  id: string
  label: string
  emoji: string
  color: string
  description: string
  followUps: string[]
  pitchTpIds: string[]
}

export const SIGNALS: Signal[] = [
  {
    id: 'unmanaged-browser',
    label: 'Unmanaged browsers',
    emoji: '🔓',
    color: 'blue',
    description: 'No central browser policy or IT governance',
    followUps: [
      'Who pushed the last browser update across your org — and how would you know if it landed on every machine?',
      'If an employee installed a malicious extension today, how long before IT would know?',
      'Can your IT team see which browser version each user is running right now?',
    ],
    pitchTpIds: ['p-tp-cep', 'p-tp-integration'],
  },
  {
    id: 'has-citrix',
    label: 'Citrix / legacy apps',
    emoji: '🖥️',
    color: 'purple',
    description: 'Windows app dependency — VDI, RDS, or Citrix in use',
    followUps: [
      'What\'s the all-in cost per seat per year — licenses, infrastructure, and IT support time?',
      'Which specific apps are driving the Citrix dependency — is it one critical system or many?',
      'How long did the original deployment take, and how much IT time goes to ongoing maintenance?',
    ],
    pitchTpIds: ['p-tp-cameyo', 'p-tp-deployment'],
  },
  {
    id: 'security-incident',
    label: 'Security incident',
    emoji: '🚨',
    color: 'red',
    description: 'Has experienced phishing, malware, or breach',
    followUps: [
      'Was the browser the entry point — phishing link, drive-by download, or compromised extension?',
      'Did you have any visibility into what the user was doing in the browser when it happened?',
      'What did remediation cost — downtime, IT hours, external support, any regulatory impact?',
    ],
    pitchTpIds: ['p-tp-cep', 'p-tp-byod'],
  },
  {
    id: 'byod-contractors',
    label: 'BYOD / contractors',
    emoji: '📱',
    color: 'amber',
    description: 'Unmanaged personal or contractor devices accessing systems',
    followUps: [
      'When a contractor accesses your systems from their own device, can IT see or control what they do?',
      'How do you offboard a contractor from data access — can you guarantee they can\'t still reach files they downloaded?',
      'How many contractors or remote workers access sensitive systems from devices IT doesn\'t manage?',
    ],
    pitchTpIds: ['p-tp-byod', 'p-tp-cep'],
  },
  {
    id: 'dlp-gap',
    label: 'DLP gap',
    emoji: '📤',
    color: 'orange',
    description: 'No controls on data leaving via the browser',
    followUps: [
      'If an employee uploaded a client file to their personal Dropbox right now, would IT know?',
      'Are there any controls on what users can copy-paste from your web apps into personal tools?',
      'Can IT audit what\'s been downloaded from your internal web applications this week?',
    ],
    pitchTpIds: ['p-tp-cep', 'p-tp-byod'],
  },
  {
    id: 'no-visibility',
    label: 'No IT browser visibility',
    emoji: '👁️',
    color: 'slate',
    description: 'IT blind to browser activity, extensions, downloads',
    followUps: [
      'Is any browser-level activity — site visits, downloads, extension installs — in your SIEM today?',
      'How long would it take to reconstruct what a user did in the browser if you had an incident?',
      'Does your security team know which extensions are running across the org right now?',
    ],
    pitchTpIds: ['p-tp-cep', 'p-tp-integration'],
  },
  {
    id: 'compliance-risk',
    label: 'Compliance / regulatory',
    emoji: '⚖️',
    color: 'indigo',
    description: 'FCA, PCI-DSS, ISO27001, GDPR exposure',
    followUps: [
      'Which regulations are most relevant — FCA, PCI-DSS, ISO27001, GDPR?',
      'Have you had any audit findings related to browser access, data handling, or endpoint controls?',
      'Is your compliance or risk team aware that browser activity is largely unaudited today?',
    ],
    pitchTpIds: ['p-tp-cep'],
  },
]
