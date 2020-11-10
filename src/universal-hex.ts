/**
 * Converts standard Intel Hex strings into a Universal Hex with records
 * organised in self contained 512-byte blocks.
 *
 * (c) 2020 Micro:bit Educational Foundation and the project contributors.
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
 * Converts an Intel Hex file string into a Universal Hex ready hex string using
 * custom records and 512 byte blocks.
 *
 * More information on the format:
 *   https://github.com/microbit-foundation/universal-hex
 *
 * @throws {Error} When the Board ID is not between 0 and 2^16.
 * @throws {Error} When there is an EoF record not at the end of the file.
 *
 * @param iHexStr - Intel Hex string to convert into the custom format with 512
 *    byte blocks and the customer records.
 * @returns New Intel Hex string with the custom format.
 */
function iHexToCustomFormatBlocks(iHexStr: string, boardId: number): string {
  // Hex files for v1.3 and v1.5 continue using the normal Data Record Type
  const replaceDataRecord = !V1_BOARD_IDS.includes(boardId);

  // Generate some constant records
  const startRecord = ihex.blockStartRecord(boardId);
  let currentExtAddr = ihex.extLinAddressRecord(0);

  // Pre-calculate known record lengths
  const extAddrRecordLen = currentExtAddr.length;
  const startRecordLen = startRecord.length;
  const endRecordBaseLen = ihex.blockEndRecord(0).length;
  const padRecordBaseLen = ihex.paddedDataRecord(0).length;

  const hexRecords = ihex.iHexToRecordStrs(iHexStr);
  const recordPaddingCapacity = ihex.findDataFieldLength(hexRecords);

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
    } else if (firstRecordType === ihex.RecordType.ExtendedSegmentAddress) {
      currentExtAddr = ihex.convertExtSegToLinAddressRecord(hexRecords[ih]);
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
      } else if (recordType === ihex.RecordType.ExtendedSegmentAddress) {
        record = ihex.convertExtSegToLinAddressRecord(record);
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
          `EoF record found at record ${ih} of ${hexRecords.length} in Board ID ${boardId} hex`
        );
      }
      // The EoF record goes after the Block End Record, it won't break 512-byte
      // boundary as it was already calculated in the previous loop that it fits
      blockLines.push(ihex.blockEndRecord(0));
      blockLines.push(ihex.endOfFileRecord());
    } else {
      // We might need additional padding records
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
      blockLines.push(ihex.blockEndRecord((BLOCK_SIZE - blockLen) / 2));
    }
  }
  blockLines.push(''); // Ensure there is a blank new line at the end

  return blockLines.join('\n');
}

/**
 * Converts an Intel Hex file string into a Universal Hex ready hex string using
 * custom records and sections aligned with 512-byte boundaries.
 *
 * More information on the format:
 *   https://github.com/microbit-foundation/universal-hex
 *
 * @throws {Error} When the Board ID is not between 0 and 2^16.
 * @throws {Error} When there is an EoF record not at the end of the file.
 *
 * @param iHexStr - Intel Hex string to convert into the custom format with 512
 *    byte blocks and the customer records.
 * @returns New Intel Hex string with the custom format.
 */
function iHexToCustomFormatSection(iHexStr: string, boardId: number): string {
  const sectionLines: string[] = [];
  let sectionLen = 0;
  let ih = 0;

  const addRecordLength = (record: string) => {
    sectionLen += record.length + 1; // Extra character counted for '\n'
  };
  const addRecord = (record: string) => {
    sectionLines.push(record);
    addRecordLength(record);
  };

  const hexRecords = ihex.iHexToRecordStrs(iHexStr);
  if (!hexRecords.length) return '';

  // If first record is not an Extended Segmented/Linear Address we start at 0x0
  const iHexFirstRecordType = ihex.getRecordType(hexRecords[0]);
  if (iHexFirstRecordType === ihex.RecordType.ExtendedLinearAddress) {
    addRecord(hexRecords[0]);
    ih++;
  } else if (iHexFirstRecordType === ihex.RecordType.ExtendedSegmentAddress) {
    addRecord(ihex.convertExtSegToLinAddressRecord(hexRecords[0]));
    ih++;
  } else {
    addRecord(ihex.extLinAddressRecord(0));
  }

  // Add the Block Start record to the beginning of the segment
  addRecord(ihex.blockStartRecord(boardId));

  // Iterate through the rest of the records and add them
  const replaceDataRecord = !V1_BOARD_IDS.includes(boardId);
  let endOfFile = false;
  while (ih < hexRecords.length) {
    const record = hexRecords[ih++];
    const recordType = ihex.getRecordType(record);
    if (recordType === ihex.RecordType.Data) {
      addRecord(
        replaceDataRecord
          ? ihex.convertRecordTo(record, ihex.RecordType.CustomData)
          : record
      );
    } else if (recordType === ihex.RecordType.ExtendedSegmentAddress) {
      addRecord(ihex.convertExtSegToLinAddressRecord(record));
    } else if (recordType === ihex.RecordType.ExtendedLinearAddress) {
      addRecord(record);
    } else if (recordType === ihex.RecordType.EndOfFile) {
      endOfFile = true;
      break;
    }
  }
  if (ih !== hexRecords.length) {
    throw new Error(
      `EoF record found at record ${ih} of ${hexRecords.length} in Board ID ${boardId} hex `
    );
  }

  // Add to the section size calculation the minimum length for the Block End
  // record that will be placed at the end (no padding included yet)
  addRecordLength(ihex.blockEndRecord(0));
  // Calculate padding required to end in a 512-byte boundary
  const recordNoDataLenChars = ihex.paddedDataRecord(0).length + 1;
  const recordDataMaxBytes = ihex.findDataFieldLength(hexRecords);
  const paddingCapacityChars = recordDataMaxBytes * 2;
  let charsNeeded = (BLOCK_SIZE - (sectionLen % BLOCK_SIZE)) % BLOCK_SIZE;
  while (charsNeeded > paddingCapacityChars) {
    const byteLen = (charsNeeded - recordNoDataLenChars) >> 1; // Integer div 2
    const record = ihex.paddedDataRecord(Math.min(byteLen, recordDataMaxBytes));
    addRecord(record);
    charsNeeded = (BLOCK_SIZE - (sectionLen % BLOCK_SIZE)) % BLOCK_SIZE;
  }
  sectionLines.push(ihex.blockEndRecord(charsNeeded >> 1));
  if (endOfFile) sectionLines.push(ihex.endOfFileRecord());
  sectionLines.push(''); // Ensure there is a blank new line at the end

  return sectionLines.join('\n');
}

/**
 * Creates a Universal Hex from an collection of Intel Hex strings and their
 * board IDs.
 *
 * @param hexes An array of objects containing an Intel Hex strings and the
 *     board ID associated with it.
 * @param blocks Indicate if the Universal Hex should be blocks instead of
 *     sections.
 */
function createUniversalHex(hexes: IndividualHex[], blocks = false): string {
  if (!hexes.length) return '';
  const iHexToCustomFormat = blocks
    ? iHexToCustomFormatBlocks
    : iHexToCustomFormatSection;

  const eofNlRecord = ihex.endOfFileRecord() + '\n';
  const customHexes: string[] = [];
  // We remove the EoF record from all but the last hex file so that the last
  // blocks are padded and there is single EoF record
  for (let i = 0; i < hexes.length - 1; i++) {
    let customHex = iHexToCustomFormat(hexes[i].hex, hexes[i].boardId);
    if (customHex.endsWith(eofNlRecord)) {
      customHex = customHex.slice(0, customHex.length - eofNlRecord.length);
    }
    customHexes.push(customHex);
  }
  // Process the last hex file with a guaranteed EoF record
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
 * Checks if the provided hex string is a universal hex.
 *
 * Very simple test only checking for the opening Extended Linear Address and
 * Block Start records.
 *
 * The string is manually checked as this method can be x20 faster than breaking
 * the string into records and checking their types with the ihex functions.
 *
 * @param hexStr Hex string to check
 * @return True if the hex is an Universal Hex.
 */
function isUniversalHex(hexStr: string): boolean {
  // Check the beginning of the Extended Linear Address record
  const elaRecordBeginning = ':02000004';
  if (hexStr.slice(0, elaRecordBeginning.length) !== elaRecordBeginning) {
    return false;
  }
  // Find the index for the next record, as we have unknown line endings
  let i = elaRecordBeginning.length;
  while (hexStr[++i] !== ':' && i < ihex.MAX_RECORD_STR_LEN + 3);
  // Check the beginning of the Block Start record
  const blockStartBeginning = ':0400000A';
  if (hexStr.slice(i, i + blockStartBeginning.length) !== blockStartBeginning) {
    return false;
  }
  return true;
}

/**
 * Separates a Universal Hex into the individual hexes.
 *
 * @param universalHexStr Universal Hex string with the Universal Hex.
 * @returns An array of object with boardId and hex keys.
 */
function separateUniversalHex(universalHexStr: string): IndividualHex[] {
  const records = ihex.iHexToRecordStrs(universalHexStr);
  if (!records.length) throw new Error('Empty Universal Hex.');

  // The format has to start with an Extended Linear Address and Block Start
  if (
    ihex.getRecordType(records[0]) !== ihex.RecordType.ExtendedLinearAddress ||
    ihex.getRecordType(records[1]) !== ihex.RecordType.BlockStart ||
    ihex.getRecordType(records[records.length - 1]) !==
      ihex.RecordType.EndOfFile
  ) {
    throw new Error('Universal Hex block format invalid.');
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
      // No need to check array size as it's confirmed hex ends with an EoF
      const nextRecord = records[i + 1];
      if (ihex.getRecordType(nextRecord) === ihex.RecordType.BlockStart) {
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

  // Form the return object with the same format as createUniversalHex() input
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

export {
  iHexToCustomFormatBlocks,
  iHexToCustomFormatSection,
  createUniversalHex,
  separateUniversalHex,
  isUniversalHex,
};
