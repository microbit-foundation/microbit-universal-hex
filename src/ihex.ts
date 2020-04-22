import { byteArrayToHexStr, concatUint8Arrays } from './utils';

const enum RecordType {
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

const RECORD_LENGTH = 16;

function calcChecksum(dataBytes: Uint8Array): number {
  const sum = dataBytes.reduce(
    (accumulator, currentValue) => accumulator + currentValue,
    0
  );
  return -sum & 0xff;
}

function createRecord(
  address: number,
  recordType: RecordType,
  dataBytes: Uint8Array
): string {
  if (address < 0 || address > 0xffff) {
    throw new Error('Custom record address out of range.');
  }
  const byteCount = dataBytes.length;
  if (byteCount > RECORD_LENGTH) {
    throw new Error('Custom record data has to many bytes.');
  }

  const recordData = concatUint8Arrays([
    new Uint8Array([byteCount]),
    new Uint8Array([address >> 8, address & 0xff]),
    new Uint8Array([recordType]),
    dataBytes,
  ]);
  const recordDataStr = byteArrayToHexStr(recordData);
  const checksumStr = calcChecksum(recordData).toString(16).padStart(2, '0');
  return `:${recordDataStr}${checksumStr}`.toUpperCase();
}

/**
 * No need to use createRecord() in this case as this record is always the same.
 *
 * @returns End of File record with new line.
 */
function endOfFileRecord(): string {
  return ':00000001FF\n';
}

export { RecordType, createRecord, endOfFileRecord };
