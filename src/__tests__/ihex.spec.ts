import { createRecord, RecordType, endOfFileRecord } from '../ihex';

describe('Test createRecord()', () => {
  it('Create standard data records', () => {
    // Examples taken from a random micro:bit hex file
    expect(
      createRecord(
        0x4290,
        RecordType.Data,
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
      createRecord(
        0xf870,
        RecordType.Data,
        new Uint8Array([0x00, 0x00, 0x00, 0x00])
      )
    ).toEqual(':04F870000000000094');

    expect(
      createRecord(
        0xe7d4,
        RecordType.Data,
        new Uint8Array([0x0c, 0x1a, 0xff, 0x7f, 0x01, 0x00, 0x00, 0x00])
      )
    ).toEqual(':08E7D4000C1AFF7F0100000098');
  });

  it('Create a custom BlockStart record', () => {
    const result = createRecord(
      0,
      RecordType.BlockStart,
      new Uint8Array([0x99, 0x01, 0xc0, 0xde])
    );

    expect(result).toEqual(':0400000A9901C0DEBA');
  });
});

describe('Test endOfFileRecord()', () => {
  it('Create a standard EoF record', () => {
    const result = endOfFileRecord();

    expect(result).toEqual(':00000001FF\n');
  });
});
