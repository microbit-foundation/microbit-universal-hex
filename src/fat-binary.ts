import { createRecord, RecordType, endOfFileRecord } from './ihex';

function startRecord(boardId: number): string {
  if (boardId < 0 || boardId > 0xffff) {
    throw new Error('Board ID out of range.');
  }
  return createRecord(
    0,
    RecordType.BlockStart,
    new Uint8Array([boardId >> 8, boardId && 0xff, 0xc0, 0xde])
  );
}

/**
 *
 * @throws {Error} When the Board ID is not between 0 and 2^16.
 *
 * @param iHexStr - Intel Hex string to convert into the custom format with 512
 *    byte blocks and the customer records.
 * @returns New Intel Hex string with the custom format.
 */
function iHexToCustomFormat(iHexStr: string, boardId: number): string {
  const start = startRecord(boardId);
  return '';
}

export { iHexToCustomFormat };
