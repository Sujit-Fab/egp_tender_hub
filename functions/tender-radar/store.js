'use strict';

const { createPublicError } = require('./errors');
const { PARSER_VERSION } = require('./limits');

function createTenderStore(db, serverTimestamp) {
  const references = batch => [db.collection('tenderRadarImports').doc(batch.fileHash),
    ...batch.records.map(record => db.collection('tenderRadarTenders').doc(record.tender_id))];
  function classify(batch, snapshots) {
    let duplicateCount = 0;
    let conflictCount = 0;
    const newRecords = [];
    batch.records.forEach((record, index) => {
      const snapshot = snapshots[index + 1];
      if (!snapshot.exists) newRecords.push({ record, ref: snapshot.ref });
      else if (snapshot.data().contentHash === record.contentHash) duplicateCount++;
      else conflictCount++;
    });
    return { newRecords, duplicateCount, conflictCount };
  }
  return {
    async inspect(batch) {
      try {
        const snapshots = await db.getAll(...references(batch), { fieldMask: ['contentHash'] });
        const { newRecords, duplicateCount, conflictCount } = classify(batch, snapshots);
        return { newCount: newRecords.length, duplicateCount, conflictCount, alreadyImported: snapshots[0].exists };
      } catch { throw createPublicError('SERVICE_UNAVAILABLE'); }
    },
    async persist(batch) {
      try {
        return await db.runTransaction(async transaction => {
          const snapshots = await transaction.getAll(...references(batch), { fieldMask: ['contentHash'] });
          const prior = snapshots[0];
          if (prior.exists) {
            // The same file can never produce a second import, even across
            // retries, concurrent requests, process restarts or administrators.
            return { batchId: batch.fileHash, status: 'already_imported', createdCount: 0,
              duplicateCount: batch.records.length, totalCount: batch.records.length };
          }
          const { newRecords, duplicateCount, conflictCount } = classify(batch, snapshots);
          if (conflictCount > 0) throw createPublicError('TENDER_CONFLICT');
          for (const { record, ref } of newRecords) {
            transaction.create(ref, { ...record, importBatchId: batch.fileHash,
              importedBy: batch.uid, importedAt: serverTimestamp() });
          }
          transaction.create(prior.ref, { fileHash: batch.fileHash, previewHash: batch.previewHash,
            parserVersion: PARSER_VERSION, importedBy: batch.uid, importedAt: serverTimestamp(),
            totalCount: batch.records.length, createdCount: newRecords.length, duplicateCount });
          return { batchId: batch.fileHash, status: 'imported', createdCount: newRecords.length,
            duplicateCount, totalCount: batch.records.length };
        });
      } catch (error) {
        // Preserve only our allowlisted conflict; never expose SDK exceptions.
        const { getErrorStatus } = require('./errors');
        if (getErrorStatus(error) === 409) throw error;
        throw createPublicError('SERVICE_UNAVAILABLE');
      }
    },
  };
}

module.exports = { createTenderStore };
