export function getPitchOpener(signalIds: string[]): string {
  const has = (id: string) => signalIds.includes(id)

  if (has('has-citrix') && has('security-incident')) {
    return "They've been hit before AND they're running legacy VDI — lead with the urgency, then tie the two together. CEP secures the browser; Cameyo replaces the risky infrastructure. Two problems, one platform — that's your frame."
  }
  if (has('has-citrix') && has('byod-contractors')) {
    return "Citrix cost plus unmanaged contractor access — that's both products in one conversation. Open with Cameyo on the TCO: get their per-seat number on the table. Then show CEP securing the browser on devices IT doesn't own."
  }
  if (has('has-citrix')) {
    return "Get their per-seat Citrix cost on the table before you show Cameyo pricing — the 40–60% TCO gap lands harder when they've just said their own number out loud."
  }
  if (has('security-incident') && (has('byod-contractors') || has('dlp-gap'))) {
    return "They've had a security incident and data is leaving the org uncontrolled. Lead with: 'Corporate controls on personal devices without owning the device.' That's CEP's managed profile — the line that lands."
  }
  if (has('security-incident')) {
    return "They've been hit. Lead with: 'Most security stacks are completely blind inside the browser — and that's where most incidents start.' Connect their specific incident to that gap, then show what CEP's threat protection would have caught."
  }
  if (has('byod-contractors') && has('dlp-gap')) {
    return "Data is walking out the door and no one's watching. Open with: 'If one of your contractors uploaded a client file to Dropbox right now, would you know?' Let the silence land. Then show the DLP controls."
  }
  if (has('compliance-risk') && has('dlp-gap')) {
    return "Compliance and DLP together — this is a strong business case. Frame CEP as the compliance investment their auditors are going to ask for, with the DLP controls as the specific evidence they can point to."
  }
  if (has('compliance-risk')) {
    return "Frame this as a compliance investment first, security second. Regulators are increasingly asking about browser controls — they may not have a good answer today. CEP gives them that answer."
  }
  if (has('dlp-gap')) {
    return "The data exfiltration risk is real and there are zero controls at the browser layer. Open with the Dropbox question — 'if someone uploaded client data right now, would you know?' — then show what CEP blocks."
  }
  if (has('no-visibility') || has('unmanaged-browser')) {
    return "They don't have visibility and they know it. Lead with: 'The browser is the last unmanaged surface in your security stack.' Then show what CEP gives IT — policy, telemetry, threat protection — without any new infrastructure."
  }
  return "Connect each talking point directly to a gap they mentioned. One problem, one solution, one outcome — don't show everything, show what's relevant to them."
}
