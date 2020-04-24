import * as ihex from './ihex';

function createStartRecord(boardId: number): string {
  if (boardId < 0 || boardId > 0xffff) {
    throw new Error('Board ID out of range.');
  }
  return ihex.createRecord(
    0,
    ihex.RecordType.BlockStart,
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
  const startRecord = createStartRecord(boardId);
  // const endRecord = createEndRecord();
  const hexLines = iHexStr.split('\r\n');

  const blockLines = [];
  // First we need to check if the first line is an extended linear record
  blockLines.push(
    ihex.getRecordType(hexLines[0]) === ihex.RecordType.ExtendedLinearAddress
      ? hexLines[0]
      : ihex.extLinAddressRecord(0)
  );
  blockLines.push(startRecord);

  // for (let currentLine = 0; currentLine < hexLines.length; currentLine++) {}

  return '';
}

export { iHexToCustomFormat };
