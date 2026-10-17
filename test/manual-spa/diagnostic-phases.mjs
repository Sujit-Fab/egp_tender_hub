const phaseCodes = Object.freeze({
  readiness: 'phase-readiness',
  authentication: 'phase-authentication',
  upload: 'phase-upload',
  downloadReference: 'phase-download-reference',
  delete: 'phase-delete',
  absenceCheck: 'phase-absence-check',
});

export function createDiagnosticPhaseReporter() {
  let code = phaseCodes.readiness;
  return {
    enter(phase) {
      if (!Object.hasOwn(phaseCodes, phase)) throw new TypeError('Unknown diagnostic phase');
      code = phaseCodes[phase];
    },
    failureRecord() { return { status: 0, code }; },
  };
}
