import * as ihex from './ihex';

/**
 *
 * @throws {Error} When the Board ID is not between 0 and 2^16.
 *
 * @param iHexStr - Intel Hex string to convert into the custom format with 512
 *    byte blocks and the customer records.
 * @returns New Intel Hex string with the custom format.
 */
function iHexToCustomFormat(iHexStr: string, boardId: number): string {
  const startRecord = ihex.blockStartRecord(boardId);

  const blockLines = [];
  const hexRecords = ihex.iHexToRecordStrs(iHexStr);
  let currentExtAddr = ihex.extLinAddressRecord(0);
  let ih = 0;
  const hexLength = hexRecords.length;
  while (ih < hexLength) {
    // First we need to check if the first line is an extended linear record
    const firstRecordType = ihex.getRecordType(hexRecords[ih]);
    if (firstRecordType === ihex.RecordType.ExtendedLinearAddress) {
      currentExtAddr = hexRecords[ih];
      ih++;
    }
    blockLines.push(currentExtAddr);
    blockLines.push(startRecord);

    const loopEnd = Math.min(10, hexLength - ih);
    let endOfFile = false;
    for (let j = 0; j < loopEnd; j++) {
      let record = hexRecords[ih++];
      const recordType = ihex.getRecordType(record);
      if (recordType === ihex.RecordType.Data) {
        record = ihex.convertRecordToCustomData(record);
      } else if (recordType === ihex.RecordType.EndOfFile) {
        endOfFile = true;
        // Error if we encounter an EoF record and it's not the end of the file
        if (ih !== hexLength) {
          throw new Error(`EoF record found at line ${ih} of ${hexLength}`);
        }
        break;
      } else if (ihex.RecordType.ExtendedLinearAddress) {
        currentExtAddr = record;
      }
      blockLines.push(record);
    }
    blockLines.push(ihex.blockEndRecord(0));
    if (endOfFile) {
      blockLines.push(ihex.endOfFileRecord());
    }
  }

  return blockLines.join('\n');
}

export { iHexToCustomFormat };
