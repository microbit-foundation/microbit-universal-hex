import * as ihex from '../ihex';

describe('Test createRecord() for standard records', () => {
  it('Create standard data records', () => {
    // Examples taken from a random micro:bit hex file
    expect(
      ihex.createRecord(
        0x4290,
        ihex.RecordType.Data,
        new Uint8Array([
          0x64,
          0x27,
          0x00,
          0x20,
          0x03,
          0x4b,
          0x19,
          0x60,
          0x43,
          0x68,
          0x03,
          0x49,
          0x9b,
          0x00,
          0x5a,
          0x50,
        ])
      )
    ).toEqual(':1042900064270020034B1960436803499B005A5070');

    expect(
      ihex.createRecord(
        0xf870,
        ihex.RecordType.Data,
        new Uint8Array([0x00, 0x00, 0x00, 0x00])
      )
    ).toEqual(':04F870000000000094');

    expect(
      ihex.createRecord(
        0xe7d4,
        ihex.RecordType.Data,
        new Uint8Array([0x0c, 0x1a, 0xff, 0x7f, 0x01, 0x00, 0x00, 0x00])
      )
    ).toEqual(':08E7D4000C1AFF7F0100000098');
  });

  it('Create a custom End Of File record', () => {
    expect(
      ihex.createRecord(0, ihex.RecordType.EndOfFile, new Uint8Array([]))
    ).toEqual(':00000001FF');
  });

  // TODO: Add tests for the ExtendedSegmentAddress record
  // TODO: Add tests for the StartSegmentAddress record
  // TODO: Add tests for the ExtendedLinearAddress record
  // TODO: Add tests for the StartLinearAddress record
  // TODO: Add tests for all the thrown exceptions
});

describe('Test createRecord() for custom records', () => {
  it('Create a custom BlockStart record', () => {
    expect(
      ihex.createRecord(
        0,
        ihex.RecordType.BlockStart,
        new Uint8Array([0x99, 0x01, 0xc0, 0xde])
      )
    ).toEqual(':0400000A9901C0DEBA');
  });

  // TODO: Add tests for the BlockEnd record
  // TODO: Add tests for the PaddedData record
  // TODO: Add tests for the CustomData record
  // TODO: Add tests for the OtherData record
});

describe('Test getRecordType() for standard records', () => {
  it('Detect EoF record', () => {
    expect(ihex.getRecordType(':00000001FF')).toEqual(
      ihex.RecordType.EndOfFile
    );
    expect(ihex.getRecordType(':00000001FF\n')).toEqual(
      ihex.RecordType.EndOfFile
    );
    expect(ihex.getRecordType(':00000001FF\r\n')).toEqual(
      ihex.RecordType.EndOfFile
    );
    expect(ihex.getRecordType(':00000001FF\n\r')).toEqual(
      ihex.RecordType.EndOfFile
    );
  });

  // TODO: Add tests for the Data record
  // TODO: Add tests for the ExtendedSegmentAddress record
  // TODO: Add tests for the StartSegmentAddress record
  // TODO: Add tests for the ExtendedLinearAddress record
  // TODO: Add tests for the StartLinearAddress record
  // TODO: Add tests for all the thrown exceptions
});

describe('Test getRecordType() for custom records', () => {
  it('Detect Block Start record', () => {
    expect(ihex.getRecordType(':0400000A9901C0DEBA')).toEqual(
      ihex.RecordType.BlockStart
    );
  });

  // TODO: Add tests for the BlockEnd record
  // TODO: Add tests for the PaddedData record
  // TODO: Add tests for the CustomData record
  // TODO: Add tests for the OtherData record
});

describe('Test endOfFileRecord()', () => {
  it('Create a standard EoF record', () => {
    expect(ihex.endOfFileRecord()).toEqual(':00000001FF');
  });
});

describe('Test extLinAddressRecord()', () => {
  it('Create Extended Linear Address records', () => {
    expect(ihex.extLinAddressRecord(0x00000)).toEqual(':020000040000FA');
    expect(ihex.extLinAddressRecord(0x04321)).toEqual(':020000040000FA');
    expect(ihex.extLinAddressRecord(0x10000)).toEqual(':020000040001F9');
    expect(ihex.extLinAddressRecord(0x20000)).toEqual(':020000040002F8');
    expect(ihex.extLinAddressRecord(0x30000)).toEqual(':020000040003F7');
    expect(ihex.extLinAddressRecord(0x31234)).toEqual(':020000040003F7');
  });

  // TODO: Add tests for all thrown exceptions
});
