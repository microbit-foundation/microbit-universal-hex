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

describe('Test parseRecord() for standard records', () => {
  it('Parses data records of different lengths', () => {
    let result = ihex.parseRecord(
      ':10FFF0009B6D9847A06810F039FF0621A06810F0AB'
    );
    expect(result.byteCount).toEqual(0x10);
    expect(result.address).toEqual(0xfff0);
    expect(result.recordType).toEqual(0x00);
    expect(result.data).toEqual(
      new Uint8Array([
        0x9b,
        0x6d,
        0x98,
        0x47,
        0xa0,
        0x68,
        0x10,
        0xf0,
        0x39,
        0xff,
        0x06,
        0x21,
        0xa0,
        0x68,
        0x10,
        0xf0,
      ])
    );
    expect(result.checksum).toEqual(0xab);

    result = ihex.parseRecord(':08AEE0007C53FF7F010000001C');
    expect(result.byteCount).toEqual(0x08);
    expect(result.address).toEqual(0xaee0);
    expect(result.recordType).toEqual(0x00);
    expect(result.data).toEqual(
      new Uint8Array([0x7c, 0x53, 0xff, 0x7f, 0x01, 0x00, 0x00, 0x00])
    );
    expect(result.checksum).toEqual(0x1c);

    result = ihex.parseRecord(':04F870000000000094');
    expect(result.byteCount).toEqual(0x04);
    expect(result.address).toEqual(0xf870);
    expect(result.recordType).toEqual(0x00);
    expect(result.data).toEqual(new Uint8Array([0x00, 0x00, 0x00, 0x00]));
    expect(result.checksum).toEqual(0x94);
  });

  it('Parses data records of different lengths', () => {
    const result = ihex.parseRecord(':04F870000000000094\r\n');
    expect(result.byteCount).toEqual(0x04);
    expect(result.address).toEqual(0xf870);
    expect(result.recordType).toEqual(0x00);
    expect(result.data).toEqual(new Uint8Array([0x00, 0x00, 0x00, 0x00]));
    expect(result.checksum).toEqual(0x94);
  });

  it('Throws error when record does not start with a colon', () => {
    expect(() => {
      ihex.parseRecord('04F870000000000094');
    }).toThrow('does not start with a ":"');
  });

  it('Throws error when record does not have the even hex characters', () => {
    expect(() => {
      ihex.parseRecord(':04F87000000000094');
    }).toThrow('not divisible by 2');
  });

  it('Throws error when record is larger than indicated by byte count', () => {
    expect(() => {
      ihex.parseRecord(':04F87000000000009400');
    }).toThrow('byte count');
  });

  // TODO: Add tests for parsing EoF records
  // TODO: Add tests for parsing ExtendedSegmentAddress records
  // TODO: Add tests for parsing StartSegmentAddress records
  // TODO: Add tests for parsing ExtendedLinearAddress records
  // TODO: Add tests for parsing StartLinearAddress records
  // TODO: Add tests for parsing BlockStart records
});

describe('Test parseRecord() for standard records', () => {
  // TODO: Add tests for parsing BlockStart records
  // TODO: Add tests for parsing BlockEnd records
  // TODO: Add tests for parsing PaddedData records
  // TODO: Add tests for parsing CustomData records
  // TODO: Add tests for parsing OtherData records
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
