/**
 * Convert between standard Intel Hex strings and Universal Hex strings.
 *
 * This module provides the main functionality to convert Intel Hex strings
 * (with their respective Board IDs) into the Universal Hex format.
 *
 * It can also separate a Universal Hex string into the individual Intel Hex
 * strings that forms it.
 *
 * The content here assumes familiarity with the
 * [Universal Hex Specification](https://github.com/microbit-foundation/spec-universal-hex)
 * and the rest of
 * [this library documentation](https://microbit-foundation.github.io/microbit-universal-hex/).
 * @packageDocumentation
 *
 * (c) 2020 Micro:bit Educational Foundation and the project contributors.
 * SPDX-License-Identifier: MIT
 */
import * as ihex from './ihex';

const V1_BOARD_IDS = [0x9900, 0x9901];
const BLOCK_SIZE = 512;

/**
 * The Board ID is used to identify the different targets from a Universal Hex.
 * In this case the target represents a micro:bit version.
 * For micro:bit V1 (v1.3, v1.3B and v1.5) the `boardId` is `0x9900`, and for
 * V2 `0x9903`.
 */
enum microbitBoardId {
  V1 = 0x9900,
  V2 = 0x9903,
}

/**
 * Very simple interface to group an Intel Hex string with a Board ID.
 *
 * The Board ID is used in an Universal Hex file to identify the target, in this
 * case the micro:bit version.
 */
interface IndividualHex {
  /** The Intel Hex in string format. */
  hex: string;
  /**
   * The Board ID identifies the target for the Intel Hex string.
   * Any number can be used in this field, but to target a micro:bit the
   * micro:bit firmware will process the data
   */
  boardId: number | microbitBoardId;
}

/**
 * Converts an Intel Hex string into a Hex string using the 512 byte blocks
 * format and the Universal Hex specific record types.
 *
 * The output of this function is not a fully formed Universal Hex, but one part
 * of a Universal Hex, ready to be merged by the calling code.
 *
 * More information on this "block" format:
 *   https://github.com/microbit-foundation/spec-universal-hex
 *
 * @throws {Error} When the Board ID is not between 0 and 2^16.
 * @throws {Error} When there is an EoF record not at the end of the file.
 *
 * @param iHexStr - Intel Hex string to convert into the custom format with 512
 *    byte blocks and the customer records.
 * @returns New Intel Hex string with the custom format.
 */
function iHexToCustomFormatBlocks(
  iHexStr: string,
  boardId: number | microbitBoardId
): string {
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

  if (!hexRecords.length) return '';
  if (isUniversalHexRecords(hexRecords)) {
    throw new Error(`Board ID ${boardId} Hex is already a Universal Hex.`);
  }

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
        // Might be MakeCode hex for V1 as they did this with the EoF record
        if (isMakeCodeForV1HexRecords(hexRecords)) {
          throw new Error(
            `Board ID ${boardId} Hex is from MakeCode, import this hex into the MakeCode editor to create a Universal Hex.`
          );
        } else {
          throw new Error(
            `EoF record found at record ${ih} of ${hexRecords.length} in Board ID ${boardId} hex`
          );
        }
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
 * Converts an Intel Hex string into a Hex string using custom records and
 * aligning the content size to a 512-byte boundary.
 *
 * The output of this function is not a fully formed Universal Hex, but one part
 * of a Universal Hex, ready to be merged by the calling code.
 *
 * More information on this "section" format:
 *   https://github.com/microbit-foundation/spec-universal-hex
 *
 * @throws {Error} When the Board ID is not between 0 and 2^16.
 * @throws {Error} When there is an EoF record not at the end of the file.
 *
 * @param iHexStr - Intel Hex string to convert into the custom format with 512
 *    byte blocks and the customer records.
 * @returns New Intel Hex string with the custom format.
 */
function iHexToCustomFormatSection(
  iHexStr: string,
  boardId: number | microbitBoardId
): string {
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
  if (isUniversalHexRecords(hexRecords)) {
    throw new Error(`Board ID ${boardId} Hex is already a Universal Hex.`);
  }

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
    // The End Of File record was encountered mid-file, might be a MakeCode hex
    if (isMakeCodeForV1HexRecords(hexRecords)) {
      throw new Error(
        `Board ID ${boardId} Hex is from MakeCode, import this hex into the MakeCode editor to create a Universal Hex.`
      );
    } else {
      throw new Error(
        `EoF record found at record ${ih} of ${hexRecords.length} in Board ID ${boardId} hex `
      );
    }
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
 * Creates a Universal Hex from a collection of Intel Hex strings and their
 * board IDs.
 *
 * For the current micro:bit board versions use the values from the
 * `microbitBoardId` enum.
 *
 * @param hexes An array of objects containing an Intel Hex string and the board
 *     ID associated with it.
 * @param blocks Indicate if the Universal Hex format should be "blocks"
 *     instead of "sections". The current specification recommends using the
 *     default "sections" format as is much quicker in micro:bits with DAPLink
 *     version 0234.
 * @returns A Universal Hex string.
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
 * Checks if the provided hex string is a Universal Hex.
 *
 * Very simple test only checking for the opening Extended Linear Address and
 * Block Start records.
 *
 * The string is manually iterated as this method can be x20 faster than
 * breaking the string into records and checking their types with the ihex
 * functions.
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
 * Checks if the provided array of hex records form part of a Universal Hex.
 *
 * @param records Array of hex records to check.
 * @return True if the records belong to a Universal Hex.
 */
function isUniversalHexRecords(records: string[]): boolean {
  return (
    ihex.getRecordType(records[0]) === ihex.RecordType.ExtendedLinearAddress &&
    ihex.getRecordType(records[1]) === ihex.RecordType.BlockStart &&
    ihex.getRecordType(records[records.length - 1]) ===
      ihex.RecordType.EndOfFile
  );
}

/**
 * Checks if the array of records belongs to an Intel Hex file from MakeCode for
 * micro:bit V1.
 *
 * @param records Array of hex records to check.
 * @return True if the records belong to a MakeCode hex file for micro:bit V1.
 */
function isMakeCodeForV1HexRecords(records: string[]): boolean {
  let i = records.indexOf(ihex.endOfFileRecord());
  if (i === records.length - 1) {
    // A MakeCode v0 hex file will place the metadata in RAM before the EoF
    while (--i > 0) {
      if (records[i] === ihex.extLinAddressRecord(0x20000000)) {
        return true;
      }
    }
  }
  while (++i < records.length) {
    // Other data records used to store the MakeCode project metadata (v2 and v3)
    if (ihex.getRecordType(records[i]) === ihex.RecordType.OtherData) {
      return true;
    }
    // In MakeCode v1 metadata went to RAM memory space 0x2000_0000
    if (records[i] === ihex.extLinAddressRecord(0x20000000)) {
      return true;
    }
  }
  return false;
}

/**
 * Checks if the Hex string is an Intel Hex file from MakeCode for micro:bit V1.
 *
 * @param hexStr Hex string to check
 * @return True if the hex is an Universal Hex.
 */
function isMakeCodeForV1Hex(hexStr: string): boolean {
  return isMakeCodeForV1HexRecords(ihex.iHexToRecordStrs(hexStr));
}

/**
 * Separates a Universal Hex into its individual Intel Hexes.
 *
 * @param universalHexStr Universal Hex string with the Universal Hex.
 * @returns An array of object with boardId and hex keys.
 */
function separateUniversalHex(universalHexStr: string): IndividualHex[] {
  const records = ihex.iHexToRecordStrs(universalHexStr);
  if (!records.length) throw new Error('Empty Universal Hex.');
  if (!isUniversalHexRecords(records)) {
    throw new Error('Universal Hex format invalid.');
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
  microbitBoardId,
  IndividualHex,
  iHexToCustomFormatBlocks,
  iHexToCustomFormatSection,
  createUniversalHex,
  separateUniversalHex,
  isUniversalHex,
  isMakeCodeForV1Hex,
};
