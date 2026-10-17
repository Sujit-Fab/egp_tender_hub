export interface UploadPreview {
  fileHash: string; previewHash: string; totalCount: number; byCategory: Record<string, number>;
  newCount: number; duplicateCount: number; conflictCount: number; alreadyImported: boolean;
  warningCount: number; infoCount: number;
}
export interface ImportResult {
  batchId: string; status: 'imported' | 'already_imported'; createdCount: number; duplicateCount: number; totalCount: number;
}
export interface UploadState {
  file: File | null; count: string; busy: 'preview' | 'confirm' | null;
  preview: UploadPreview | null; result: ImportResult | null; error: boolean;
}
interface Dependencies {
  currentUid(): string | null;
  request(action: 'preview' | 'confirm', file: File, count: string, previewHash: string | null,
    signal: AbortSignal): Promise<UploadPreview | ImportResult>;
}
export function createAdminUploadSession(uid: string, dependencies: Dependencies, publish: (state: UploadState) => void) {
  let active = true;
  let controller: AbortController | null = null;
  let state: UploadState = { file: null, count: '', busy: null, preview: null, result: null, error: false };
  const current = () => active && dependencies.currentUid() === uid;
  const update = (changes: Partial<UploadState>) => {
    state = { ...state, ...changes };
    if (current()) publish({ ...state });
  };
  async function run(action: 'preview' | 'confirm') {
    if (!current() || state.busy || !state.file || state.file.size > 10 * 1024 * 1024 ||
        !/^[1-9]\d{0,2}$/.test(state.count) || Number(state.count) > 400) return;
    if (action === 'confirm' && (!state.preview || state.preview.conflictCount > 0 || state.result)) return;
    const file = state.file;
    const count = state.count;
    const previewHash = action === 'confirm' ? state.preview!.previewHash : null;
    controller = new AbortController();
    update({ busy: action, error: false, result: null, ...(action === 'preview' ? { preview: null } : {}) });
    try {
      const result = await dependencies.request(action, file, count, previewHash, controller.signal);
      if (!current()) return;
      if (action === 'preview') update({ preview: result as UploadPreview });
      else update({ result: result as ImportResult, preview: null });
    } catch {
      if (current()) update({ error: true, preview: null });
    } finally {
      controller = null;
      update({ busy: null });
    }
  }
  return {
    snapshot: () => ({ ...state }),
    select(file: File | null, count: string) {
      if (current() && !state.busy) update({ file, count, preview: null, result: null, error: false });
    },
    preview: () => run('preview'), confirm: () => run('confirm'),
    dispose() { active = false; controller?.abort(); },
  };
}
