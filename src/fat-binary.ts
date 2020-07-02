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

interface IndividualHex {
  hex: string;
  boardId: number;
}

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
  let currentExtAddr = ihex.extLinAddressRecord(0);

  // Pre-calculate known record lengths
  const extAddrRecordLen = currentExtAddr.length;
  const startRecordLen = startRecord.length;
  const endRecordBaseLen = ihex.blockEndRecord(0).length;
  const recordPaddingCapacity = ihex.recordPaddingCapacity();
  const padRecordBaseLen = ihex.paddedDataRecord(0).length;

  const hexRecords = ihex.iHexToRecordStrs(iHexStr);

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
        record = ihex.convertRecordTo(record, ihex.RecordType.CustomData);
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
      // TODO: Can we end up with a block needing an odd number of padded chars?
      blockLines.push(ihex.blockEndRecord((BLOCK_SIZE - blockLen) / 2));
    }
  }

  return blockLines.length ? blockLines.join('\n') + '\n' : '';
}

function createFatBinary(hexes: IndividualHex[]): string {
  if (!hexes.length) return '';

  const eofRecord = ihex.endOfFileRecord();
  const eofNlRecord = eofRecord + '\n';
  const customHexes: string[] = [];
  // We remove the EoF record from all but the last hex file so that the last
  // blocks are padded and there is single EoF record
  for (let i = 0; i < hexes.length - 1; i++) {
    let customHex = hexes[i].hex;
    if (customHex.endsWith(eofNlRecord)) {
      customHex = customHex.slice(0, customHex.length - eofNlRecord.length);
    } else if (customHex.endsWith(eofRecord)) {
      customHex = customHex.slice(0, customHex.length - eofRecord.length);
    } else {
      throw Error(
        `Could not fine the End Of File record on hex with Board ID ${hexes[i].boardId}`
      );
    }
    customHex = iHexToCustomFormat(customHex, hexes[i].boardId);
    customHexes.push(customHex);
  }
  // Process the last hex file with a guarantee EoF record
  const lastCustomHex = iHexToCustomFormat(
    hexes[hexes.length - 1].hex,
    hexes[hexes.length - 1].boardId
  );
  customHexes.push(lastCustomHex);
  if (!lastCustomHex.endsWith(eofNlRecord)) {
    customHexes.push(eofNlRecord);
  }
  return customHexes.join('');
}

/**
 * Separates a Fat Binary into the individual hexes.
 *
 * @param intelHexStr Intel Hex string with the Fat Binary.
 * @returns An array of object with boardId and hex keys.
 */
function separateFatBinary(intelHexStr: string): IndividualHex[] {
  const records = ihex.iHexToRecordStrs(intelHexStr);
  if (!records.length) throw new Error('Empty fat binary.');

  // The format has to start with an Extended Linear Address and Block Start
  if (
    ihex.getRecordType(records[0]) !== ihex.RecordType.ExtendedLinearAddress ||
    ihex.getRecordType(records[1]) !== ihex.RecordType.BlockStart ||
    ihex.getRecordType(records[records.length - 1]) !==
      ihex.RecordType.EndOfFile
  ) {
    throw new Error('Fat binary block format invalid.');
  }

  const passThroughRecords = [
    ihex.RecordType.Data,
    ihex.RecordType.EndOfFile,
    ihex.RecordType.ExtendedSegmentAddress,
    ihex.RecordType.StartSegmentAddress,
  ];

  // Initialise the structure to hold the different hexes
  const hexes: {
    [boarId: string]: {
      boardId: number;
      lastExtAdd: string;
      hex: string[];
    };
  } = {};
  let currentBoardId = 0;
  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    const recordType = ihex.getRecordType(record);
    if (passThroughRecords.includes(recordType)) {
      hexes[currentBoardId].hex.push(record);
    } else if (recordType === ihex.RecordType.CustomData) {
      hexes[currentBoardId].hex.push(
        ihex.convertRecordTo(record, ihex.RecordType.Data)
      );
    } else if (recordType === ihex.RecordType.ExtendedLinearAddress) {
      // Extended Linear Address can be found as the start of a new block
      // No need to check array size as we known there will always be an EoF
      const nextRecord = records[i + 1];
      const nextRecordType = ihex.getRecordType(nextRecord);
      if (nextRecordType === ihex.RecordType.BlockStart) {
        // Processes the Block Start record (only first 2 bytes for Board ID)
        const blockStartData = ihex.getRecordData(nextRecord);
        if (blockStartData.length !== 4) {
          throw new Error(`Block Start record invalid: ${nextRecord}`);
        }
        currentBoardId = (blockStartData[0] << 8) + blockStartData[1];
        hexes[currentBoardId] = hexes[currentBoardId] || {
          boardId: currentBoardId,
          lastExtAdd: record,
          hex: [record],
        };
        i++;
      }
      if (hexes[currentBoardId].lastExtAdd !== record) {
        hexes[currentBoardId].lastExtAdd = record;
        hexes[currentBoardId].hex.push(record);
      }
    }
  }

  // Form the return object with the same format as createFatBinary() input
  const returnArray: IndividualHex[] = [];
  Object.keys(hexes).forEach((boardId: string) => {
    // Ensure all hexes (and not just the last) contain the EoF record
    const hex = hexes[boardId].hex;
    if (hex[hex.length - 1] !== ihex.endOfFileRecord()) {
      hex[hex.length] = ihex.endOfFileRecord();
    }
    returnArray.push({
      boardId: hexes[boardId].boardId,
      hex: hex.join('\n') + '\n',
    });
  });
  return returnArray;
}

export { iHexToCustomFormat, createFatBinary, separateFatBinary };
