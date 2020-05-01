/**
 * Converts standard Intel Hex strings into fat binaries with records organised
 * in self contained 512-byte blocks.
 *
 * (c) 2020 Micro:bit Educational Foundation and the microbit-fb contributors.
 * SPDX-License-Identifier: MIT
 */
import * as ihex from './ihex';

const V1_BOARD_IDS = [0x9900, 0x9901];
const BLOCK_SIZE = 512;

/**
 * Converts a hex file string into a fat-binary ready hex string using custom
 * records and 512 byte blocks.
 *
 * Block format:
 *  - Extended linear address record
 *
 * More information on the format:
 *  https://github.com/microbit-foundation/fat-binaries
 *
 * @throws {Error} When the Board ID is not between 0 and 2^16.
 *
 * @param iHexStr - Intel Hex string to convert into the custom format with 512
 *    byte blocks and the customer records.
 * @returns New Intel Hex string with the custom format.
 */
function iHexToCustomFormat(iHexStr: string, boardId: number): string {
  // Hex files for v1.3 and v1.5 continue using the normal Data Record Type
  const replaceDataRecord = !V1_BOARD_IDS.includes(boardId);

  // Generate some constant records
  const startRecord = ihex.blockStartRecord(boardId);
  const hexRecords = ihex.iHexToRecordStrs(iHexStr);
  let currentExtAddr = ihex.extLinAddressRecord(0);

  // Pre-calculate known record lengths
  const extAddrRecordLen = currentExtAddr.length;
  const startRecordLen = startRecord.length;
  const endRecordBaseLen = ihex.blockEndRecord(0).length;
  const recordPaddingCapacity = ihex.recordPaddingCapacity();
  const padRecordBaseLen = ihex.paddedDataRecord(0).length;

  // Each loop iteration corresponds to a 512-bytes block
  let ih = 0;
  const blockLines = [];
  while (ih < hexRecords.length) {
    let blockLen = 0;
    // Check for an extended linear record to not repeat it after a block start
    const firstRecordType = ihex.getRecordType(hexRecords[ih]);
    if (firstRecordType === ihex.RecordType.ExtendedLinearAddress) {
      currentExtAddr = hexRecords[ih];
      ih++;
    }
    blockLines.push(currentExtAddr);
    blockLen += extAddrRecordLen + 1;
    blockLines.push(startRecord);
    blockLen += startRecordLen + 1;
    blockLen += endRecordBaseLen + 1;

    let endOfFile = false;
    while (
      hexRecords[ih] &&
      BLOCK_SIZE >= blockLen + hexRecords[ih].length + 1
    ) {
      let record = hexRecords[ih++];
      const recordType = ihex.getRecordType(record);
      if (replaceDataRecord && recordType === ihex.RecordType.Data) {
        record = ihex.convertRecordToCustomData(record);
      } else if (recordType === ihex.RecordType.ExtendedLinearAddress) {
        currentExtAddr = record;
      } else if (recordType === ihex.RecordType.EndOfFile) {
        endOfFile = true;
        break;
      }
      blockLines.push(record);
      blockLen += record.length + 1;
    }

    if (endOfFile) {
      // Error if we encounter an EoF record and it's not the end of the file
      if (ih !== hexRecords.length) {
        throw new Error(
          `EoF record found at line ${ih} of ${hexRecords.length}`
        );
      }
      // The EoF record goes after the Block End Record, it won't break 512-byte
      // boundary as it was already calculated in the previous loop that it fits
      blockLines.push(ihex.blockEndRecord(0));
      blockLines.push(ihex.endOfFileRecord());
    } else {
      // We might need an additional padding records
      // const charsLeft = BLOCK_SIZE - blockLen;
      while (BLOCK_SIZE - blockLen > recordPaddingCapacity * 2) {
        const record = ihex.paddedDataRecord(
          Math.min(
            (BLOCK_SIZE - blockLen - (padRecordBaseLen + 1)) / 2,
            recordPaddingCapacity
          )
        );
        blockLines.push(record);
        blockLen += record.length + 1;
      }
      // TODO: Can we have a block that needs an odd number of padded chars?
      blockLines.push(ihex.blockEndRecord((BLOCK_SIZE - blockLen) / 2));
    }
  }

  return blockLines.join('\n') + '\n';
}

function createFatBinary(hexes: { hex: string; boardID: number }[]): string {
  const endOfFileRecord = ihex.endOfFileRecord() + '\n';
  const customHexes: string[] = [];
  // We remove the EoF record from all but the last hex file
  for (let i = 0; i < hexes.length - 1; i++) {
    let customHex = iHexToCustomFormat(hexes[i].hex, hexes[i].boardID);
    if (customHex.endsWith(endOfFileRecord)) {
      customHex = customHex.slice(0, customHex.length - endOfFileRecord.length);
    }
    customHexes.push(customHex);
  }
  // Process the last hex file with a guarantee EoF record
  const lastCustomHex = iHexToCustomFormat(
    hexes[hexes.length - 1].hex,
    hexes[hexes.length - 1].boardID
  );
  customHexes.push(lastCustomHex);
  if (!lastCustomHex.endsWith(endOfFileRecord)) {
    customHexes.push(endOfFileRecord);
  }
  return customHexes.join('\n');
}

export { iHexToCustomFormat, createFatBinary };
