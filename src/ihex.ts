import { byteArrayToHexStr, byteToHexStr, concatUint8Arrays } from './utils';

enum RecordType {
  Data = 0x00,
  EndOfFile = 0x01,
  ExtendedSegmentAddress = 0x02,
  StartSegmentAddress = 0x03,
  ExtendedLinearAddress = 0x04,
  StartLinearAddress = 0x05,
  BlockStart = 0x0a,
  BlockEnd = 0x0b,
  PaddedData = 0x0c,
  CustomData = 0x0d,
  OtherData = 0x0e,
}

/**
 * The maximum data bytes per record is 0xFF, 16 and 32 bytes are the two most
 * common lengths, but to start we'll only support 16 bytes
 */
const RECORD_DATA_MAX_LENGTH = 16;

/**
 * Constants for the record character lengths.
 */
const START_CODE_STR = ':';
const START_CODE_STR_LEN = START_CODE_STR.length;
const BYTE_COUNT_STR_LEN = 2;
const ADDRESS_STR_LEN = 4;
const RECORD_TYPE_STR_LEN = 2;
const DATA_STR_LEN_MIN = 0;
const CHECKSUM_STR_LEN = 2;
const MIN_RECORD_STR_LEN =
  START_CODE_STR_LEN +
  BYTE_COUNT_STR_LEN +
  ADDRESS_STR_LEN +
  RECORD_TYPE_STR_LEN +
  DATA_STR_LEN_MIN +
  CHECKSUM_STR_LEN;
const MAX_RECORD_STR_LEN =
  START_CODE_STR_LEN +
  BYTE_COUNT_STR_LEN +
  ADDRESS_STR_LEN +
  RECORD_TYPE_STR_LEN +
  RECORD_DATA_MAX_LENGTH +
  CHECKSUM_STR_LEN;

/**
 * Calculates the Intel Hex checksum.
 *
 * This is basically the LSB of the two's complement of the sum of all bytes.
 *
 * @param dataBytes A byte array to calculate the checksum into.
 * @returns Checksum byte.
 */
function calcChecksumByte(dataBytes: Uint8Array): number {
  const sum = dataBytes.reduce(
    (accumulator, currentValue) => accumulator + currentValue,
    0
  );
  return -sum & 0xff;
}

/**
 * Creates an Intel Hex record with normal or custom record types.
 *
 * @param address - The two least significant bytes for the data address.
 * @param recordType - Record type, could be one of the standard types or any
 *    of the custom types created for forming fat binaries.
 * @param dataBytes - Byte array with the data to include in the record.
 * @returns A string with the Intel Hex record.
 */
function createRecord(
  address: number,
  recordType: RecordType,
  dataBytes: Uint8Array
): string {
  if (address < 0 || address > 0xffff) {
    throw new Error('Custom record address out of range.');
  }
  const byteCount = dataBytes.length;
  if (byteCount > RECORD_DATA_MAX_LENGTH) {
    throw new Error('Custom record data has too many bytes.');
  }

  const recordContent = concatUint8Arrays([
    new Uint8Array([byteCount]),
    new Uint8Array([address >> 8, address & 0xff]),
    new Uint8Array([recordType]),
    dataBytes,
  ]);
  const recordContentStr = byteArrayToHexStr(recordContent);
  const checksumStr = byteToHexStr(calcChecksumByte(recordContent));
  return `${START_CODE_STR}${recordContentStr}${checksumStr}`.toUpperCase();
}

/**
 * Check if the an Intel Hex record conforms to the following rules:
 *  - Correct length of characters
 *  - Starts with a colon
 *
 * TODO: Apply more rules.
 *
 * @param iHexRecord - Single Intel Hex record to check.
 * @returns A boolean indicating if the record is valid.
 */
function isValidRecord(iHexRecord: string): boolean {
  if (
    iHexRecord.length < MIN_RECORD_STR_LEN ||
    iHexRecord.length > MAX_RECORD_STR_LEN ||
    iHexRecord[0] !== ':'
  ) {
    return false;
  }
  return true;
}

/**
 * Retrieves the Record Type form an Intel Hex record line.
 *
 * @param iHexRecord A single Intel Hex record.
 * @returns The RecordType value.
 */
function getRecordType(iHexRecord: string): RecordType {
  // TODO: This will trim white spaces and new lines anywhere, we need to
  // replace it with something that just removes the \r and \n from the end of
  // the line
  iHexRecord = iHexRecord.trim();
  if (!isValidRecord(iHexRecord)) {
    throw new Error('Record is not valid.');
  }
  const recordTypeCharStart =
    START_CODE_STR_LEN + BYTE_COUNT_STR_LEN + ADDRESS_STR_LEN;
  const recordTypeStr = iHexRecord.slice(
    recordTypeCharStart,
    recordTypeCharStart + RECORD_TYPE_STR_LEN
  );
  const recordType = parseInt(recordTypeStr, 16);
  if (!(recordType in RecordType)) {
    throw new Error(`Record type '${recordTypeStr}' is not valid.`);
  }
  return recordType;
}

/**
 * Creates an End Of File Intel Hex record.
 *
 * @returns End of File record with new line.
 */
function endOfFileRecord(): string {
  // No need to use createRecord(), this record is always the same
  return ':00000001FF';
}

/**
 * Creates an Extended Linear Address record from a 4 byte address.
 *
 * @param address - Full 32 bit address.
 * @returns The Extended Linear Address Intel Hex record.
 */
function extLinAddressRecord(address: number): string {
  if (address < 0 || address > 0xffffffff) {
    throw new Error(
      `Address '${address}' for Extended Linear Address record is in range.`
    );
  }
  return createRecord(
    0,
    RecordType.ExtendedLinearAddress,
    new Uint8Array([(address >> 24) & 0xff, (address >> 16) & 0xff])
  );
}

export {
  RecordType,
  createRecord,
  getRecordType,
  endOfFileRecord,
  extLinAddressRecord,
};
