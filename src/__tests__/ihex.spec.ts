/**
 * Tests for ihex module.
 *
 * (c) 2020 Micro:bit Educational Foundation and contributors.
 * SPDX-License-Identifier: MIT
 */
import * as ihex from '../ihex';

describe('Test createRecord() for standard records', () => {
  it('Creates standard data records', () => {
    let a = [0x64, 0x27, 0x00, 0x20, 0x03, 0x4b, 0x19, 0x60];
    let b = [0x43, 0x68, 0x03, 0x49, 0x9b, 0x00, 0x5a, 0x50];
    // Examples taken from a random micro:bit hex file
    expect(
      ihex.createRecord(
        0x4290,
        ihex.RecordType.Data,
        new Uint8Array(a.concat(b))
      )
    ).toEqual(':1042900064270020034B1960436803499B005A5070');

    a = [0x12, 0xf0, 0xd0, 0xfb, 0x07, 0xee, 0x90, 0x0a, 0xf5, 0xee, 0xc0];
    b = [0x7a, 0xf1, 0xee, 0x10, 0xfa, 0x44, 0xbf, 0x9f, 0xed, 0x08, 0x7a];
    const c = [0x77, 0xee, 0x87, 0x7a, 0xfd, 0xee, 0xe7, 0x7a, 0x17, 0xee];
    expect(
      ihex.createRecord(
        0x07e0,
        ihex.RecordType.Data,
        new Uint8Array(a.concat(b).concat(c))
      )
    ).toEqual(
      ':2007E00012F0D0FB07EE900AF5EEC07AF1EE10FA44BF9FED087A77EE877AFDEEE77A17EECF'
    );

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

  it('Creates an End Of File record', () => {
    expect(
      ihex.createRecord(0, ihex.RecordType.EndOfFile, new Uint8Array([]))
    ).toEqual(':00000001FF');
  });

  // TODO: Add tests for the ExtendedSegmentAddress record
  // TODO: Add tests for the StartSegmentAddress record
  // TODO: Add tests for the ExtendedLinearAddress record
  // TODO: Add tests for the StartLinearAddress record

  it('Throws error when data given is too large', () => {
    let data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
    data = data.concat(data);
    expect(() => {
      ihex.createRecord(0, ihex.RecordType.Data, new Uint8Array(data));
    }).not.toThrow();

    data.push(33);

    expect(() => {
      ihex.createRecord(0, ihex.RecordType.Data, new Uint8Array(data));
    }).toThrow('data has too many bytes');
  });

  it('Throws error when the address is too large', () => {
    expect(() => {
      ihex.createRecord(0x10000, ihex.RecordType.Data, new Uint8Array([]));
    }).toThrow('address out of range');
  });

  it('Throws error when the address is negative', () => {
    expect(() => {
      ihex.createRecord(-1, ihex.RecordType.Data, new Uint8Array([]));
    }).toThrow('address out of range');
  });

  it('Throws error when the record is invalid', () => {
    expect(() => {
      ihex.createRecord(0, 0xff, new Uint8Array([]));
    }).toThrow('is not valid');
  });
});

describe('Test createRecord() for custom records', () => {
  it('Creates a custom BlockStart record', () => {
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
  it('Detects EoF record', () => {
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
  it('Detects Block Start record', () => {
    expect(ihex.getRecordType(':0400000A9901C0DEBA')).toEqual(
      ihex.RecordType.BlockStart
    );
  });

  it('Detects Block End record', () => {
    expect(ihex.getRecordType(':0C00000BFFFFFFFFFFFFFFFFFFFFFFFFF5')).toEqual(
      ihex.RecordType.BlockEnd
    );
    expect(ihex.getRecordType(':0000000BF5')).toEqual(ihex.RecordType.BlockEnd);
  });

  it('Detects Padded Data record', () => {
    expect(
      ihex.getRecordType(':1000000CFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF4')
    ).toEqual(ihex.RecordType.PaddedData);
  });

  it('Detects Custom Data record', () => {
    expect(
      ihex.getRecordType(':102AA00D34000F2D03653A35000C2D03653A3600C1')
    ).toEqual(ihex.RecordType.CustomData);
  });

  it('Detects Other Data record', () => {
    expect(
      ihex.getRecordType(':1002800EE4EA519366D2B52AA5EE1DBDD0414C5578')
    ).toEqual(ihex.RecordType.OtherData);
  });

  it('Throws error with invalid record type', () => {
    expect(() => {
      ihex.getRecordType(':0000000FF5');
    }).toThrow('is not valid');
  });
});

describe('Test getRecordData()', () => {
  it('Empty data field', () => {
    expect(ihex.getRecordData(':00000001FF')).toEqual(new Uint8Array());
  });

  it('Get the data from a Block Start record', () => {
    expect(ihex.getRecordData(':0400000A9903C0DEB8')).toEqual(
      new Uint8Array([0x99, 0x03, 0xc0, 0xde])
    );
  });

  it('Get the data from a half Padding record', () => {
    expect(
      ihex.getRecordData(':1080B00DFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFC3')
    ).toEqual(new Uint8Array(new Array(16).fill(0xff)));
  });

  it('Get the data from a full Padding record', () => {
    expect(
      ihex.getRecordData(
        ':1080B00DFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFC3'
      )
    ).toEqual(new Uint8Array(new Array(32).fill(0xff)));
  });

  it('Empty array when record is too short', () => {
    expect(ihex.getRecordData(':00000001')).toEqual(new Uint8Array());
  });

  it('Throws error with invalid record', () => {
    expect(() => {
      ihex.getRecordData(':0000000F_THIS_IS_NOT_A_HEX_F5');
    }).toThrow('Could not parse');
  });
});

describe('Test parseRecord() for standard records', () => {
  it('Parses data records of different lengths (32)', () => {
    const result = ihex.parseRecord(
      ':201C400010F0D2FF3246CDE900013B463046394610F0EEFC02460B46DDE9000110F09AFE2C'
    );

    expect(result.byteCount).toEqual(0x20);
    expect(result.address).toEqual(0x1c40);
    expect(result.recordType).toEqual(0x00);
    const a = [0x10, 0xf0, 0xd2, 0xff, 0x32, 0x46, 0xcd, 0xe9, 0x00, 0x01];
    const b = [0x3b, 0x46, 0x30, 0x46, 0x39, 0x46, 0x10, 0xf0, 0xee, 0xfc];
    const c = [0x02, 0x46, 0x0b, 0x46, 0xdd, 0xe9, 0x00, 0x01, 0x10, 0xf0];
    const d = [0x9a, 0xfe];
    expect(result.data).toEqual(
      new Uint8Array(a.concat(b).concat(c).concat(d))
    );
    expect(result.checksum).toEqual(0x2c);
  });

  it('Parses data records of different lengths (16)', () => {
    const result = ihex.parseRecord(
      ':10FFF0009B6D9847A06810F039FF0621A06810F0AB'
    );

    expect(result.byteCount).toEqual(0x10);
    expect(result.address).toEqual(0xfff0);
    expect(result.recordType).toEqual(0x00);
    const a = [0x9b, 0x6d, 0x98, 0x47, 0xa0, 0x68, 0x10, 0xf0];
    const b = [0x39, 0xff, 0x06, 0x21, 0xa0, 0x68, 0x10, 0xf0];
    expect(result.data).toEqual(new Uint8Array(a.concat(b)));
    expect(result.checksum).toEqual(0xab);
  });

  it('Parses data records of different lengths (8)', () => {
    const result = ihex.parseRecord(':08AEE0007C53FF7F010000001C');

    expect(result.byteCount).toEqual(0x08);
    expect(result.address).toEqual(0xaee0);
    expect(result.recordType).toEqual(0x00);
    expect(result.data).toEqual(
      new Uint8Array([0x7c, 0x53, 0xff, 0x7f, 0x01, 0x00, 0x00, 0x00])
    );
    expect(result.checksum).toEqual(0x1c);
  });

  it('Parses data records of different lengths (4)', () => {
    const result = ihex.parseRecord(':04F870000000000094');

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

  it('Throws error when record is invalid', () => {
    expect(() => {
      ihex.parseRecord(':0000000F_THIS_IS_NOT_A_HEX_F5');
    }).toThrow('Could not parse');
  });

  it('Throws error when record is invalid', () => {
    expect(() => {
      ihex.parseRecord(':000000');
    }).toThrow('Record length too small');
  });

  it('Throws error when record is too large', () => {
    expect(() => {
      ihex.parseRecord(
        ':2000600031F8000039F8000041F800008FFA00008FFA00008FFA00008FFA00008FFA0000FF40'
      );
    }).toThrow('Record length is too large');
  });

  // TODO: Add tests for parsing EoF records
  // TODO: Add tests for parsing ExtendedSegmentAddress records
  // TODO: Add tests for parsing StartSegmentAddress records
  // TODO: Add tests for parsing ExtendedLinearAddress records
  // TODO: Add tests for parsing StartLinearAddress records
  // TODO: Add tests for parsing BlockStart records
});

describe('Test parseRecord() for custom records', () => {
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
    expect(ihex.extLinAddressRecord(0x40000)).toEqual(':020000040004F6');
    expect(ihex.extLinAddressRecord(0x48264)).toEqual(':020000040004F6');
    expect(ihex.extLinAddressRecord(0x50000)).toEqual(':020000040005F5');
    expect(ihex.extLinAddressRecord(0x55555)).toEqual(':020000040005F5');
    expect(ihex.extLinAddressRecord(0x60000)).toEqual(':020000040006F4');
    expect(ihex.extLinAddressRecord(0x61230)).toEqual(':020000040006F4');
    expect(ihex.extLinAddressRecord(0x70000)).toEqual(':020000040007F3');
    expect(ihex.extLinAddressRecord(0x72946)).toEqual(':020000040007F3');
  });

  it('Throws error when address is out of range', () => {
    expect(() => {
      ihex.extLinAddressRecord(0x100000000);
    }).toThrow('Address record is out of range');
  });
});

describe('Test blockStartRecord()', () => {
  it('Creates a custom Block Start Record', () => {
    expect(ihex.blockStartRecord(0x9901)).toEqual(':0400000A9901C0DEBA');
    expect(ihex.blockStartRecord(0x9903)).toEqual(':0400000A9903C0DEB8');
  });

  it('Throws error when the Board ID larger than 4 bytes', () => {
    expect(() => {
      ihex.blockStartRecord(0x10000);
    }).toThrow('Board ID out of range');
  });

  it('Throws error when the Board ID a negative value', () => {
    expect(() => {
      ihex.blockStartRecord(-1);
    }).toThrow('Board ID out of range');
  });
});

describe('Test blockEndRecord()', () => {
  it('Creates a custom Block End Record', () => {
    expect(ihex.blockEndRecord(0)).toEqual(':0000000BF5');
    expect(ihex.blockEndRecord(1)).toEqual(':0100000BFFF5');
    expect(ihex.blockEndRecord(0x9)).toEqual(':0900000BFFFFFFFFFFFFFFFFFFF5');
    expect(ihex.blockEndRecord(0x10)).toEqual(
      ':1000000BFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5'
    );
    expect(ihex.blockEndRecord(0x20)).toEqual(
      ':2000000BFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5'
    );
  });

  it('Throws error when the number of bytes to pad is a negative value', () => {
    expect(() => {
      ihex.blockEndRecord(-1);
    }).toThrow();
  });

  it('Throws error when the number of bytes to pad is too large', () => {
    expect(() => {
      ihex.blockEndRecord(32);
    }).not.toThrow('has too many bytes');

    expect(() => {
      ihex.blockEndRecord(33);
    }).toThrow('has too many bytes');
  });
});

describe('Test paddedDataRecord()', () => {
  it('Creates a custom Padded Data Record', () => {
    expect(ihex.paddedDataRecord(0)).toEqual(':0000000CF4');
    expect(ihex.paddedDataRecord(1)).toEqual(':0100000CFFF4');
    expect(ihex.paddedDataRecord(0x9)).toEqual(':0900000CFFFFFFFFFFFFFFFFFFF4');
    expect(ihex.paddedDataRecord(0x10)).toEqual(
      ':1000000CFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF4'
    );
    expect(ihex.paddedDataRecord(0x20)).toEqual(
      ':2000000CFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF4'
    );
  });

  it('Throws error when the number of bytes to pad is a negative value', () => {
    expect(() => {
      ihex.paddedDataRecord(-1);
    }).toThrow();
  });

  it('Throws error when the number of bytes to pad is too large', () => {
    expect(() => {
      ihex.paddedDataRecord(32);
    }).not.toThrow('has too many bytes');

    expect(() => {
      ihex.paddedDataRecord(33);
    }).toThrow('has too many bytes');
  });
});

describe('Test convertRecordTo()', () => {
  it('Converts a Data Record into a Custom Data Record', () => {
    expect(
      ihex.convertRecordTo(
        ':105D3000E060E3802046FFF765FF0123A1881A4653',
        ihex.RecordType.CustomData
      )
    ).toEqual(':105D300DE060E3802046FFF765FF0123A1881A4646');

    expect(
      ihex.convertRecordTo(
        ':10B04000D90B08BD40420F0070B5044616460D46A8',
        ihex.RecordType.CustomData
      )
    ).toEqual(':10B0400DD90B08BD40420F0070B5044616460D469B');
  });
});

describe('Test convertExtSegToLinAddressRecord()', () => {
  it('Converts valid Extended Segment Address Records into Linear', () => {
    expect(ihex.convertExtSegToLinAddressRecord(':020000020000FC')).toEqual(
      ':020000040000FA'
    );
    expect(ihex.convertExtSegToLinAddressRecord(':020000021000EC')).toEqual(
      ':020000040001F9'
    );
    expect(ihex.convertExtSegToLinAddressRecord(':020000022000DC')).toEqual(
      ':020000040002F8'
    );
    expect(ihex.convertExtSegToLinAddressRecord(':020000023000CC')).toEqual(
      ':020000040003F7'
    );
    expect(ihex.convertExtSegToLinAddressRecord(':020000024000BC')).toEqual(
      ':020000040004F6'
    );
    expect(ihex.convertExtSegToLinAddressRecord(':0200000270008C')).toEqual(
      ':020000040007F3'
    );
  });

  it('Throws error with an invalid Extended Segment Address', () => {
    expect(() => {
      ihex.convertExtSegToLinAddressRecord(':0200000270018C');
    }).toThrow('Invalid Extended Segment Address record');

    expect(() => {
      ihex.convertExtSegToLinAddressRecord(':0300000271008C');
    }).toThrow('Invalid Extended Segment Address record');

    expect(() => {
      ihex.convertExtSegToLinAddressRecord(':030000027000FF8C');
    }).toThrow('Invalid Extended Segment Address record');
  });
});

describe('Test iHexToRecordStrs()', () => {
  it('Normal hex file string', () => {
    expect(
      ihex.iHexToRecordStrs(
        ':020000040000FA\n' +
          ':1001000D084748204D490968095808474C204B4974\n' +
          ':1001100D096809580847502048490968095808478F\n' +
          ':020000040003F7\n' +
          ':1001200D5420464909680958084758204349096829\n' +
          ':00000001FF\n'
      )
    ).toEqual([
      ':020000040000FA',
      ':1001000D084748204D490968095808474C204B4974',
      ':1001100D096809580847502048490968095808478F',
      ':020000040003F7',
      ':1001200D5420464909680958084758204349096829',
      ':00000001FF',
    ]);
  });

  it('New lines with carriage returns', () => {
    expect(
      ihex.iHexToRecordStrs(
        ':020000040000FA\r\n' +
          ':1001000D084748204D490968095808474C204B4974\r\n' +
          ':1001100D096809580847502048490968095808478F\r\n' +
          ':020000040003F7\r\n' +
          ':1001200D5420464909680958084758204349096829\r\n' +
          ':00000001FF\r\n'
      )
    ).toEqual([
      ':020000040000FA',
      ':1001000D084748204D490968095808474C204B4974',
      ':1001100D096809580847502048490968095808478F',
      ':020000040003F7',
      ':1001200D5420464909680958084758204349096829',
      ':00000001FF',
    ]);
  });

  it('No new lines at the last record', () => {
    const hexStr =
      ':020000040000FA\n' +
      ':1001000D084748204D490968095808474C204B4974\n' +
      ':1001100D096809580847502048490968095808478F\n' +
      ':020000040003F7\n' +
      ':1001200D5420464909680958084758204349096829\n' +
      ':00000001FF';
    const hexStrWin = hexStr.replace(/\n/g, '\r\n');
    const expectedResult = [
      ':020000040000FA',
      ':1001000D084748204D490968095808474C204B4974',
      ':1001100D096809580847502048490968095808478F',
      ':020000040003F7',
      ':1001200D5420464909680958084758204349096829',
      ':00000001FF',
    ];

    expect(ihex.iHexToRecordStrs(hexStr)).toEqual(expectedResult);
    expect(ihex.iHexToRecordStrs(hexStrWin)).toEqual(expectedResult);
  });

  it('Mixed carriage returns and new lines', () => {
    expect(
      ihex.iHexToRecordStrs(
        ':020000040000FA\r\n' +
          ':1001000D084748204D490968095808474C204B4974\r\n' +
          ':1001100D096809580847502048490968095808478F\n' +
          ':020000040003F7\r\n' +
          ':1001200D5420464909680958084758204349096829\n' +
          ':00000001FF\n'
      )
    ).toEqual([
      ':020000040000FA',
      ':1001000D084748204D490968095808474C204B4974',
      ':1001100D096809580847502048490968095808478F',
      ':020000040003F7',
      ':1001200D5420464909680958084758204349096829',
      ':00000001FF',
    ]);
  });

  it('Empty lines are removed from output array', () => {
    expect(
      ihex.iHexToRecordStrs(
        ':1001000D084748204D490968095808474C204B4974\n' +
          '\n' +
          ':1001100D096809580847502048490968095808478F\n' +
          ':00000001FF\n' +
          '\n'
      )
    ).toEqual([
      ':1001000D084748204D490968095808474C204B4974',
      ':1001100D096809580847502048490968095808478F',
      ':00000001FF',
    ]);
  });

  it('Single record without new lines', () => {
    expect(
      ihex.iHexToRecordStrs(':1001000D084748204D490968095808474C204B4974')
    ).toEqual([':1001000D084748204D490968095808474C204B4974']);
  });

  it('Empty input string outputs empty array', () => {
    expect(ihex.iHexToRecordStrs('')).toEqual([]);
  });
});

describe('Test findDataFieldLength()', () => {
  it('Standard 16-byte record hex', () => {
    const records = [
      ':020000040000FA',
      ':10000000C0070000D1060000D1000000B1060000CA',
      ':1000100000000000000000000000000000000000E0',
      ':100020000000000000000000000000005107000078',
      ':100030000000000000000000DB000000E500000000',
      ':10004000EF000000F9000000030100000D010000B6',
      ':1000500017010000210100002B0100003501000004',
      ':100160000968095808477020344909680958084740',
      ':100170007420324909680958084778202F490968CE',
      ':10018000095808477C202D490968095808478020EC',
      ':100190002A490968095808478420284909680958E4',
      ':020000040001F9',
      ':10000000058209E003984179027909021143490404',
      ':10001000490C0171090A417103AA04A90898FFF764',
      ':1000200068FF0028EED0822C02D020460BB0F0BD35',
      ':100030000020FBE730B50446406B002597B0002850',
      ':00000001FF',
    ];

    const recordLength = ihex.findDataFieldLength(records);

    expect(recordLength).toEqual(16);
  });

  it('Finds a mixed of records with enough 32 byte long records', () => {
    const records = [
      ':020000040000FA',
      ':10000000C0070000D1060000D1000000B1060000CA',
      ':1000100000000000000000000000000000000000E0',
      ':100020000000000000000000000000005107000078',
      ':100030000000000000000000DB000000E500000000',
      ':10004000EF000000F9000000030100000D010000B6',
      ':1000500017010000210100002B0100003501000004',
      ':2000600031F8000039F8000041F800008FFA00008FFA00008FFA00008FFA00008FFA000040',
      ':200080008FFA00008FFA00008FFA0000410101008FFA00008FFA00008FFA00008FFA00005E',
      ':2000A0008FFA00008FFA000049F8000051F800008FFA00008FFA0000000000000000000092',
      ':2000C0008FFA00008FFA00008FFA0000350101008FFA00008FFA00008FFA000000000000B3',
      ':2000E000000000000000000000000000000000000000000000000000000000000000000000',
      ':200100000000000000000000000000000000000000000000000000000000000000000000DF',
      ':200120000000000000000000000000000000000000000000000000000000000000000000BF',
      ':2001400000000000000000000000000000000000000000000000000000000000000000009F',
      ':100160000968095808477020344909680958084740',
      ':100170007420324909680958084778202F490968CE',
      ':10018000095808477C202D490968095808478020EC',
      ':100190002A490968095808478420284909680958E4',
      ':1001A0000847882025490968095808478C202349B1',
      ':1001B00009680958084790202049096809580847E4',
      ':1001C00094201E4909680958084798201B49096866',
      ':1001D000095808479C201949096809580847A02070',
      ':020000040001F9',
      ':10000000058209E003984179027909021143490404',
      ':10001000490C0171090A417103AA04A90898FFF764',
      ':1000200068FF0028EED0822C02D020460BB0F0BD35',
      ':100030000020FBE730B50446406B002597B0002850',
      ':200040000098C3F83415C3F83825D3F80012E26141F02001C3F800127A1906EB82025268EB',
      ':2000600052B14FF404722948C3F8042303B0F0BD00293AD1002C3ED1D3F81021D3F8441186',
      ':20008000D3F82441002AF3D03D4421481F4F214B002206EB8506944208BF3846B2619142E0',
      ':2000A00018BF1846E2E70368A261C3F810E1D3F8100101900198C3F844E1D3F844010090A2',
      ':2000C0000120E160C4F81CE0009CC3F83415C3F838251860C0E733B103680F484FF40472D0',
      ':00000001FF',
    ];

    const recordLength = ihex.findDataFieldLength(records);

    expect(recordLength).toEqual(32);
  });

  it('Longer than 32 byte records throws an error', () => {
    const records = [
      ':020000040000FA',
      ':10000000C0070000D1060000D1000000B1060000CA',
      ':2000600031F8000039F8000041F800008FFA00008FFA00008FFA00008FFA00008FFA000040',
      ':300080008FFA00008FFA00008FFA0000410101008FFA00008FFA00008FFA00008FFA0000C0070000D1060000D1000000B106000028',
      ':00000001FF',
    ];
    const throwsError = () => {
      const recordLength = ihex.findDataFieldLength(records);
    };

    expect(throwsError).toThrow('data size is too large');
  });
});
