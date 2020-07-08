import * as fs from 'fs';

import * as uh from '../universal-hex';

const hex1 = fs.readFileSync(
  './src/__tests__/hex-files/1-duck-umbrella.hex',
  'utf8'
);
const hex2 = fs.readFileSync(
  './src/__tests__/hex-files/2-ghost-music.hex',
  'utf8'
);

const hexCombined = fs.readFileSync(
  './src/__tests__/hex-files/combined-1-9901-2-9903.hex',
  'utf8'
);

describe('Test iHexToCustomFormat()', () => {
  it('Pads blocks with additional records to reach 512 bytes', () => {
    const hexStr =
      ':020000040000FA\n' +
      ':10F39000002070470E207047002803D00A490861FA\n' +
      ':10F3E00010C9121FA342F8D018BA21BA884201D915\n' +
      ':020000040003F7\n' +
      ':103F40006A4623C210A82A46FF21808A0C9B02F0F1\n';
    const expected =
      ':020000040000FA\n' +
      ':0400000A9903C0DEB8\n' +
      ':10F3900D002070470E207047002803D00A490861ED\n' +
      ':10F3E00D10C9121FA342F8D018BA21BA884201D908\n' +
      ':020000040003F7\n' +
      ':103F400D6A4623C210A82A46FF21808A0C9B02F0E4\n' +
      ':1000000CFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF4\n' +
      ':1000000CFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF4\n' +
      ':1000000CFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF4\n' +
      ':1000000CFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF4\n' +
      ':1000000CFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF4\n' +
      ':1000000CFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF4\n' +
      ':1000000CFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF4\n' +
      ':0400000BFFFFFFFFF5\n';

    const result = uh.iHexToCustomFormat(hexStr, 0x9903);

    expect(result).toEqual(expected);
    expect(result.length).toEqual(512);
  });

  it("There isn't an off-by-one error for a block that fits exactly", () => {
    const hexStr =
      ':020000040003F7\n' +
      ':108D800003F09F928E203D20496D6167652E444916\n' +
      ':108D9000414D4F4E440AF09F8FA0203D20496D6108\n' +
      ':108DA00067652E484F5553450AFFFFFFFFFFFFFF42\n' +
      ':108DB000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFC3\n' +
      ':108DC000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFB3\n' +
      ':108DD000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFA3\n' +
      ':108DE000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF93\n' +
      ':108DF000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF83\n' +
      ':01F80000FDFF0A\n' +
      ':020000041000EA\n' +
      ':1010C0007CB0EE17FFFFFFFF0A0000000000E30006\n' +
      ':0C10D000FFFFFFFF2D6D0300000000007B\n';
    const expected =
      ':020000040003F7\n' +
      ':0400000A9901C0DEBA\n' +
      ':108D800003F09F928E203D20496D6167652E444916\n' +
      ':108D9000414D4F4E440AF09F8FA0203D20496D6108\n' +
      ':108DA00067652E484F5553450AFFFFFFFFFFFFFF42\n' +
      ':108DB000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFC3\n' +
      ':108DC000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFB3\n' +
      ':108DD000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFA3\n' +
      ':108DE000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF93\n' +
      ':108DF000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF83\n' +
      ':01F80000FDFF0A\n' +
      ':020000041000EA\n' +
      ':1010C0007CB0EE17FFFFFFFF0A0000000000E30006\n' +
      ':0C10D000FFFFFFFF2D6D0300000000007B\n' +
      ':0000000BF5\n';

    const result = uh.iHexToCustomFormat(hexStr, 0x9901);

    expect(result).toEqual(expected);
    expect(result.length).toEqual(512);
  });

  it('One byte too large and the last record is moved to a new padded block', () => {
    const hexStr =
      ':020000040003F7\n' +
      ':108D800003F09F928E203D20496D6167652E444916\n' +
      ':108D9000414D4F4E440AF09F8FA0203D20496D6108\n' +
      ':108DA00067652E484F5553450AFFFFFFFFFFFFFF42\n' +
      ':108DB000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFC3\n' +
      ':108DC000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFB3\n' +
      ':108DD000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFA3\n' +
      ':108DE000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF93\n' +
      ':108DF000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF83\n' +
      ':03F80000FDFFFF0A\n' +
      ':020000041000EA\n' +
      ':1010C0007CB0EE17FFFFFFFF0A0000000000E30006\n' +
      ':0C10D000FFFFFFFF2D6D0300000000007B\n';
    const expected =
      // First block with padding as last record doesn't fit
      ':020000040003F7\n' +
      ':0400000A9901C0DEBA\n' +
      ':108D800003F09F928E203D20496D6167652E444916\n' +
      ':108D9000414D4F4E440AF09F8FA0203D20496D6108\n' +
      ':108DA00067652E484F5553450AFFFFFFFFFFFFFF42\n' +
      ':108DB000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFC3\n' +
      ':108DC000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFB3\n' +
      ':108DD000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFA3\n' +
      ':108DE000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF93\n' +
      ':108DF000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF83\n' +
      ':03F80000FDFFFF0A\n' +
      ':020000041000EA\n' +
      ':1010C0007CB0EE17FFFFFFFF0A0000000000E30006\n' +
      ':0B00000CFFFFFFFFFFFFFFFFFFFFFFF4\n' +
      ':0000000BF5\n' +
      // Second block with the last record plus padding
      ':020000041000EA\n' +
      ':0400000A9901C0DEBA\n' +
      ':0C10D000FFFFFFFF2D6D0300000000007B\n' +
      ':1000000CFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF4\n' +
      ':1000000CFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF4\n' +
      ':1000000CFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF4\n' +
      ':1000000CFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF4\n' +
      ':1000000CFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF4\n' +
      ':1000000CFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF4\n' +
      ':1000000CFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF4\n' +
      ':1000000CFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF4\n' +
      ':1000000CFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF4\n' +
      ':1000000BFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5\n';

    const result = uh.iHexToCustomFormat(hexStr, 0x9901);

    expect(result).toEqual(expected);
    expect(result.length).toEqual(1024);
  });

  it('9901 and 9903 IDs left data records untouched', () => {
    const hexStr =
      ':020000040000FA\n' +
      ':10F39000002070470E207047002803D00A490861FA\n' +
      ':10F3E00010C9121FA342F8D018BA21BA884201D915\n' +
      ':020000040003F7\n' +
      ':103F40006A4623C210A82A46FF21808A0C9B02F0F1\n';
    const expected9900 = [
      ':020000040000FA\n',
      ':0400000A9900C0DEBB\n',
      ':10F39000002070470E207047002803D00A490861FA\n',
      ':10F3E00010C9121FA342F8D018BA21BA884201D915\n',
      ':020000040003F7\n',
      ':103F40006A4623C210A82A46FF21808A0C9B02F0F1\n',
      ':1000000CFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF4\n',
      ':1000000CFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF4\n',
      ':1000000CFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF4\n',
      ':1000000CFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF4\n',
      ':1000000CFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF4\n',
      ':1000000CFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF4\n',
      ':1000000CFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF4\n',
      ':0400000BFFFFFFFFF5\n',
    ];
    const expected9901 = [...expected9900];
    expected9901[1] = ':0400000A9901C0DEBA\n';

    const result9900 = uh.iHexToCustomFormat(hexStr, 0x9900);
    const result9901 = uh.iHexToCustomFormat(hexStr, 0x9901);

    expect(result9900).toEqual(expected9900.join(''));
    expect(result9900.length).toEqual(512);
    expect(result9901).toEqual(expected9901.join(''));
    expect(result9901.length).toEqual(512);
  });

  it('9903+ IDs change the data record type', () => {
    const hexStr =
      ':020000040000FA\n' +
      ':10F39000002070470E207047002803D00A490861FA\n' +
      ':10F3E00010C9121FA342F8D018BA21BA884201D915\n' +
      ':020000040003F7\n' +
      ':103F40006A4623C210A82A46FF21808A0C9B02F0F1\n' +
      ':00000001FF\n';
    const expected9903 = [
      ':020000040000FA\n',
      ':0400000A9903C0DEB8\n',
      ':10F3900D002070470E207047002803D00A490861ED\n',
      ':10F3E00D10C9121FA342F8D018BA21BA884201D908\n',
      ':020000040003F7\n',
      ':103F400D6A4623C210A82A46FF21808A0C9B02F0E4\n',
      ':0000000BF5\n',
      ':00000001FF\n',
    ];
    const expected9904 = [...expected9903];
    expected9904[1] = ':0400000A9904C0DEB7\n';
    const expected9910 = [...expected9903];
    expected9910[1] = ':0400000A9910C0DEAB\n';
    const expected0000 = [...expected9903];
    expected0000[1] = ':0400000A0000C0DE54\n';
    const expectedFFFF = [...expected9903];
    expectedFFFF[1] = ':0400000AFFFFC0DE56\n';

    const result9903 = uh.iHexToCustomFormat(hexStr, 0x9903);
    const result9904 = uh.iHexToCustomFormat(hexStr, 0x9904);
    const result9910 = uh.iHexToCustomFormat(hexStr, 0x9910);
    const result0000 = uh.iHexToCustomFormat(hexStr, 0);
    const resultFFFF = uh.iHexToCustomFormat(hexStr, 0xffff);

    expect(result9903).toEqual(expected9903.join(''));
    expect(result9904).toEqual(expected9904.join(''));
    expect(result9910).toEqual(expected9910.join(''));
    expect(result0000).toEqual(expected0000.join(''));
    expect(resultFFFF).toEqual(expectedFFFF.join(''));
  });

  it('EoF record placed after the block if it fits', () => {
    const hexStr =
      ':020000040000FA\n' +
      ':109C40001ED0A180287A012805D00320A0715F488A\n' +
      ':109C5000EF22817F6FE70220F8E721462846029A2B\n' +
      ':020000040003F7\n' +
      ':1072400019D0134B9C421BD00123A54206D0180035\n' +
      ':00000001FF\n';
    const expected =
      ':020000040000FA\n' +
      ':0400000A9903C0DEB8\n' +
      ':109C400D1ED0A180287A012805D00320A0715F487D\n' +
      ':109C500DEF22817F6FE70220F8E721462846029A1E\n' +
      ':020000040003F7\n' +
      ':1072400D19D0134B9C421BD00123A54206D0180028\n' +
      ':0000000BF5\n' +
      ':00000001FF\n';

    const result = uh.iHexToCustomFormat(hexStr, 0x9903);

    expect(result).toEqual(expected);
  });

  it('EoF record placed in a new block if it does not fit', () => {
    const hexStr =
      ':020000040003F7\n' +
      ':108D800003F09F928E203D20496D6167652E444916\n' +
      ':108D9000414D4F4E440AF09F8FA0203D20496D6108\n' +
      ':108DA00067652E484F5553450AFFFFFFFFFFFFFF42\n' +
      ':108DB000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFC3\n' +
      ':108DC000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFB3\n' +
      ':108DD000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFA3\n' +
      ':108DE000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF93\n' +
      ':108DF000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF83\n' +
      ':02F80000FDFF0A\n' +
      ':020000041000EA\n' +
      ':1010C0007CB0EE17FFFFFFFF0A0000000000E30006\n' +
      ':0C10D000FFFFFFFF2D6D0300000000007B\n' +
      ':00000001FF\n';
    const expected =
      // First block
      ':020000040003F7\n' +
      ':0400000A9901C0DEBA\n' +
      ':108D800003F09F928E203D20496D6167652E444916\n' +
      ':108D9000414D4F4E440AF09F8FA0203D20496D6108\n' +
      ':108DA00067652E484F5553450AFFFFFFFFFFFFFF42\n' +
      ':108DB000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFC3\n' +
      ':108DC000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFB3\n' +
      ':108DD000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFA3\n' +
      ':108DE000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF93\n' +
      ':108DF000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF83\n' +
      ':02F80000FDFF0A\n' +
      ':020000041000EA\n' +
      ':1010C0007CB0EE17FFFFFFFF0A0000000000E30006\n' +
      ':0C10D000FFFFFFFF2D6D0300000000007B\n' +
      ':0000000BF5\n' +
      // Second block with only the EoF record
      ':020000041000EA\n' +
      ':0400000A9901C0DEBA\n' +
      ':0000000BF5\n' +
      ':00000001FF\n';

    const result = uh.iHexToCustomFormat(hexStr, 0x9901);

    expect(result).toEqual(expected);
  });

  it('Extended Linear Address record correctly parsed and used', () => {
    const hexStr =
      ':10558000002EEDD1E9E70020EAE7C0464302F0B57E\n' +
      ':1055900042005D0AC30F4802440A4800120E000E82\n' +
      ':1055A000C90FFF2A1FD0FF2822D0002A09D16E423E\n' +
      ':1055B0006E4100280FD1002C0DD10020002D09D004\n' +
      ':1055C00005E0002801D1002C01D08B4213D05842B5\n' +
      ':1055D00001231843F0BD002EF7D04842414101207D\n' +
      ':1055E00049420843F6E7002DDDD002204042F1E7B2\n' +
      ':1055F000002CDAD0F9E78242E9DC04DBA542E6D8E8\n' +
      ':105600000020A542E6D25842434101205B421843A4\n' +
      // This Extended Linear Address record falls inside the first block
      ':020000040002F8\n' +
      ':10561000E0E7C0464302F0B542004C005E0AC30F0B\n' +
      ':105620004802120E450A240EC90FFF2A17D0FF2C7C\n' +
      ':1056300019D0002A0BD170427041002C17D00028DD\n' +
      ':1056400007D048424141012049420843F0BD002CA7\n' +
      ':1056500013D08B4214D0584201231843F6E702209E\n' +
      ':10566000002EF3D1E3E70220002DEFD1E1E7002D7A\n' +
      ':10567000E5D10020002EE9D0EDE7002DE9D1EAE7E1\n' +
      ':10568000A242E8DC04DBAE42E5D80020AE42DDD227\n' +
      ':105690005842434101205B421843D7E7F0B55746D3\n' +
      ':1056A0004E4645464300E0B446028846760A1F0E41\n' +
      ':1056B000C40F002F47D0FF2F25D0002380259A4606\n' +
      ':06F80000FDFFFFFFFFFF0A\n' +
      // This Extended Linear Address record falls as the first block record
      ':020000040003F7\n' +
      ':1056C0009946F600ED042E437F3F434642465D0275\n' +
      ':1056D000D20F5B006D0A1B0E904640D0FF2B39D0D5\n' +
      ':1056E00080220020ED00D20415437F3BFB18424688\n' +
      ':1056F0005746591C62408C4607430F2F5CD86F49B0\n' +
      ':00000001FF\n';
    const expected =
      // First block starts at Extended Linear Address 0
      ':020000040000FA\n' +
      ':0400000A9901C0DEBA\n' +
      ':10558000002EEDD1E9E70020EAE7C0464302F0B57E\n' +
      ':1055900042005D0AC30F4802440A4800120E000E82\n' +
      ':1055A000C90FFF2A1FD0FF2822D0002A09D16E423E\n' +
      ':1055B0006E4100280FD1002C0DD10020002D09D004\n' +
      ':1055C00005E0002801D1002C01D08B4213D05842B5\n' +
      ':1055D00001231843F0BD002EF7D04842414101207D\n' +
      ':1055E00049420843F6E7002DDDD002204042F1E7B2\n' +
      ':1055F000002CDAD0F9E78242E9DC04DBA542E6D8E8\n' +
      ':105600000020A542E6D25842434101205B421843A4\n' +
      // The Extended Linear Address record inside the first block
      ':020000040002F8\n' +
      ':10561000E0E7C0464302F0B542004C005E0AC30F0B\n' +
      ':0400000BFFFFFFFFF5\n' +
      // Second block Extended Linear Address opening record is now 0x0003
      ':020000040002F8\n' +
      ':0400000A9901C0DEBA\n' +
      ':105620004802120E450A240EC90FFF2A17D0FF2C7C\n' +
      ':1056300019D0002A0BD170427041002C17D00028DD\n' +
      ':1056400007D048424141012049420843F0BD002CA7\n' +
      ':1056500013D08B4214D0584201231843F6E702209E\n' +
      ':10566000002EF3D1E3E70220002DEFD1E1E7002D7A\n' +
      ':10567000E5D10020002EE9D0EDE7002DE9D1EAE7E1\n' +
      ':10568000A242E8DC04DBAE42E5D80020AE42DDD227\n' +
      ':105690005842434101205B421843D7E7F0B55746D3\n' +
      ':1056A0004E4645464300E0B446028846760A1F0E41\n' +
      ':1056B000C40F002F47D0FF2F25D0002380259A4606\n' +
      ':06F80000FDFFFFFFFFFF0A\n' +
      ':0000000BF5\n' +
      // The next block starts with an Extended Linear Address record, so here
      // it makes sure it doesn't translate to two consecutive ELA records
      ':020000040003F7\n' +
      ':0400000A9901C0DEBA\n' +
      ':1056C0009946F600ED042E437F3F434642465D0275\n' +
      ':1056D000D20F5B006D0A1B0E904640D0FF2B39D0D5\n' +
      ':1056E00080220020ED00D20415437F3BFB18424688\n' +
      ':1056F0005746591C62408C4607430F2F5CD86F49B0\n' +
      ':0000000BF5\n' +
      ':00000001FF\n';

    const result = uh.iHexToCustomFormat(hexStr, 0x9901);

    expect(result).toEqual(expected);
  });

  it('Empty Hex string produces an empty-ish output', () => {
    const result = uh.iHexToCustomFormat('', 0x9903);

    expect(result).toEqual('');
  });
});

describe('Test createUniversalHex()', () => {
  it('Empty input equals empty output', () => {
    const result = uh.createUniversalHex([]);

    expect(result).toEqual('');
  });

  /*
  // Not real unit tests, just converting files for manual testing
  const hex1 = fs.readFileSync(
    './src/__tests__/hex-files/1-duck-umbrella.hex',
    'utf8'
  );
  const hex2 = fs.readFileSync(
    './src/__tests__/hex-files/2-ghost-music.hex',
    'utf8'
  );

  it('.', () => {
    const result1 = uh.iHexToCustomFormat(hex1, 0x9901);
    fs.writeFileSync('./src/__tests__/hex-files/test-output-1.hex', result1);
    const result2 = uh.iHexToCustomFormat(hex2, 0x9903);
    fs.writeFileSync('./src/__tests__/hex-files/test-output-2.hex', result2);

    expect('').toEqual('');
  });

  it('..', () => {
    const result = uh.createUniversalHex([
      { hex: hex1, boardID: 0x9901 },
      { hex: hex2, boardID: 0x9903 },
    ]);
    fs.writeFileSync('./src/__tests__/hex-files/test-output-universal.hex', result);

    expect('').toEqual('');
  });
*/
});

describe('Test isUniversalHex()', () => {
  it('Detects a Universal Intel Hex.', () => {
    const normalHex =
      ':020000040000FA\n' +
      ':0400000A9900C0DEBB\n' +
      ':1000000000400020218E01005D8E01005F8E010006\n' +
      ':1000100000000000000000000000000000000000E0\n' +
      ':10002000000000000000000000000000618E0100E0\n' +
      ':100030000000000000000000638E0100658E0100DA\n' +
      ':10004000678E01005D3D000065950100678E01002F\n' +
      ':10005000678E010000000000218F0100678E010003\n' +
      ':1000600069E80000D59A0100D9930100678E01006C\n' +
      ':10007000678E0100678E0100678E0100678E0100A8\n' +
      ':10008000678E0100678E0100678E0100678E010098\n' +
      ':10009000678E01000D8A0100D98A0100A5E90000E0\n' +
      ':0C00000BFFFFFFFFFFFFFFFFFFFFFFFFF5\n' +
      ':00000001FF\n';

    const result = uh.isUniversalHex(normalHex);

    expect(result).toBeTruthy();
  });

  it('Detects a Universal Intel Hex with Windows line endings.', () => {
    const normalHex =
      ':020000040000FA\r\n' +
      ':0400000A9900C0DEBB\r\n' +
      ':1000000000400020218E01005D8E01005F8E010006\r\n' +
      ':1000100000000000000000000000000000000000E0\r\n' +
      ':10002000000000000000000000000000618E0100E0\r\n' +
      ':100030000000000000000000638E0100658E0100DA\r\n' +
      ':10004000678E01005D3D000065950100678E01002F\r\n' +
      ':10005000678E010000000000218F0100678E010003\r\n' +
      ':1000600069E80000D59A0100D9930100678E01006C\r\n' +
      ':10007000678E0100678E0100678E0100678E0100A8\r\n' +
      ':10008000678E0100678E0100678E0100678E010098\r\n' +
      ':10009000678E01000D8A0100D98A0100A5E90000E0\r\n' +
      ':0C00000BFFFFFFFFFFFFFFFFFFFFFFFFF5\r\n' +
      ':00000001FF\r\n';

    const result = uh.isUniversalHex(normalHex);

    expect(result).toBeTruthy();
  });

  it('Detects an empty string as false', () => {
    expect(uh.isUniversalHex('')).toBeFalsy();
  });

  it('Detects a normal Intel Hex as false.', () => {
    const normalHex =
      ':020000040000FA\n' +
      ':10558000002EEDD1E9E70020EAE7C0464302F0B57E\n' +
      ':1055900042005D0AC30F4802440A4800120E000E82\n' +
      ':00000001FF\n';

    const result = uh.isUniversalHex(normalHex);

    expect(result).toBeFalsy();
  });

  it('Detects a random string as false.', () => {
    const normalHex = 'This is just a random string';

    const result = uh.isUniversalHex(normalHex);

    expect(result).toBeFalsy();
  });

  it('Returns false when failing to find the second record.', () => {
    const normalHex = ':02000004\nThis is just a random string, nor a record.';

    const result = uh.isUniversalHex(normalHex);

    expect(result).toBeFalsy();
  });
});

describe('Separate a Universal Hex', () => {
  it('Throws an error on empty input', () => {
    expect(() => {
      const result = uh.separateUniversalHex('');
    }).toThrow('Empty');
  });

  it('A normal hex cannot be separated.', () => {
    const normalHex =
      ':020000040000FA\n' +
      ':10558000002EEDD1E9E70020EAE7C0464302F0B57E\n' +
      ':1055900042005D0AC30F4802440A4800120E000E82\n' +
      ':00000001FF\n';

    expect(() => {
      uh.separateUniversalHex(normalHex);
    }).toThrow('format invalid');
  });

  it('Throws error on malformed BlockStart.', () => {
    const simpleBlock =
      ':020000040003F7\n' +
      ':0400000A9901BA\n' +
      ':1056C0009946F600ED042E437F3F434642465D0275\n' +
      ':1056D000D20F5B006D0A1B0E904640D0FF2B39D0D5\n' +
      ':1056E00080220020ED00D20415437F3BFB18424688\n' +
      ':1056F0005746591C62408C4607430F2F5CD86F49B0\n' +
      ':0000000BF5\n' +
      ':00000001FF\n';

    expect(() => {
      uh.separateUniversalHex(simpleBlock);
    }).toThrow('Block Start record invalid: :0400000A9901BA');
  });

  it('Ensure all hexes have EoF records.', () => {
    const firstBlock =
      ':020000040002F8\n' +
      ':0400000A9901C0DEBA\n' +
      ':105620004802120E450A240EC90FFF2A17D0FF2C7C\n' +
      ':1056300019D0002A0BD170427041002C17D00028DD\n' +
      ':1056400007D048424141012049420843F0BD002CA7\n' +
      ':1056500013D08B4214D0584201231843F6E702209E\n' +
      ':10566000002EF3D1E3E70220002DEFD1E1E7002D7A\n' +
      ':10567000E5D10020002EE9D0EDE7002DE9D1EAE7E1\n' +
      ':10568000A242E8DC04DBAE42E5D80020AE42DDD227\n' +
      ':105690005842434101205B421843D7E7F0B55746D3\n' +
      ':1056A0004E4645464300E0B446028846760A1F0E41\n' +
      ':1056B000C40F002F47D0FF2F25D0002380259A4606\n' +
      ':06F80000FDFFFFFFFFFF0A\n' +
      ':0000000BF5\n';
    const firstHex =
      ':020000040002F8\n' +
      ':105620004802120E450A240EC90FFF2A17D0FF2C7C\n' +
      ':1056300019D0002A0BD170427041002C17D00028DD\n' +
      ':1056400007D048424141012049420843F0BD002CA7\n' +
      ':1056500013D08B4214D0584201231843F6E702209E\n' +
      ':10566000002EF3D1E3E70220002DEFD1E1E7002D7A\n' +
      ':10567000E5D10020002EE9D0EDE7002DE9D1EAE7E1\n' +
      ':10568000A242E8DC04DBAE42E5D80020AE42DDD227\n' +
      ':105690005842434101205B421843D7E7F0B55746D3\n' +
      ':1056A0004E4645464300E0B446028846760A1F0E41\n' +
      ':1056B000C40F002F47D0FF2F25D0002380259A4606\n' +
      ':06F80000FDFFFFFFFFFF0A\n' +
      ':00000001FF\n';
    const secondBlock =
      ':020000040003F7\n' +
      ':0400000A9903C0DEB8\n' +
      ':1056C0009946F600ED042E437F3F434642465D0275\n' +
      ':1056D000D20F5B006D0A1B0E904640D0FF2B39D0D5\n' +
      ':1056E00080220020ED00D20415437F3BFB18424688\n' +
      ':1056F0005746591C62408C4607430F2F5CD86F49B0\n' +
      ':0000000BF5\n' +
      ':00000001FF\n';
    const secondHex =
      ':020000040003F7\n' +
      ':1056C0009946F600ED042E437F3F434642465D0275\n' +
      ':1056D000D20F5B006D0A1B0E904640D0FF2B39D0D5\n' +
      ':1056E00080220020ED00D20415437F3BFB18424688\n' +
      ':1056F0005746591C62408C4607430F2F5CD86F49B0\n' +
      ':00000001FF\n';

    const result = uh.separateUniversalHex(firstBlock + secondBlock);
    expect(result[0].boardId).toEqual(0x9901);
    expect(result[0].hex).toEqual(firstHex);
    expect(result[1].boardId).toEqual(0x9903);
    expect(result[1].hex).toEqual(secondHex);
  });

  it('Separate a full hex file', () => {
    const result = uh.separateUniversalHex(hexCombined);
    // fs.writeFileSync(
    //  './src/__tests__/hex-files/test-separate-0.hex',
    //  result[0].hex
    // );
    // fs.writeFileSync(
    //  './src/__tests__/hex-files/test-separate-1.hex',
    //  result[1].hex
    // );

    expect(result[0].boardId).toEqual(0x9901);
    expect(result[0].hex).toEqual(hex1);
    expect(result[1].boardId).toEqual(0x9903);
    // 2-ghost-music.hex does not open with the optional :020000040000FA record
    expect(result[1].hex).toEqual(':020000040000FA\n' + hex2);
  });
});

describe('Loopback Intel Hex to Universal Hex', () => {
  it('From a small sample', () => {
    const hexStr =
      ':020000040000FA\n' +
      ':10558000002EEDD1E9E70020EAE7C0464302F0B57E\n' +
      ':1055900042005D0AC30F4802440A4800120E000E82\n' +
      ':1055A000C90FFF2A1FD0FF2822D0002A09D16E423E\n' +
      ':1055B0006E4100280FD1002C0DD10020002D09D004\n' +
      ':1055C00005E0002801D1002C01D08B4213D05842B5\n' +
      ':1055D00001231843F0BD002EF7D04842414101207D\n' +
      ':1055E00049420843F6E7002DDDD002204042F1E7B2\n' +
      ':1055F000002CDAD0F9E78242E9DC04DBA542E6D8E8\n' +
      ':105600000020A542E6D25842434101205B421843A4\n' +
      // This Extended Linear Address record falls inside the first block
      ':020000040002F8\n' +
      ':10561000E0E7C0464302F0B542004C005E0AC30F0B\n' +
      ':105620004802120E450A240EC90FFF2A17D0FF2C7C\n' +
      ':1056300019D0002A0BD170427041002C17D00028DD\n' +
      ':1056400007D048424141012049420843F0BD002CA7\n' +
      ':1056500013D08B4214D0584201231843F6E702209E\n' +
      ':10566000002EF3D1E3E70220002DEFD1E1E7002D7A\n' +
      ':10567000E5D10020002EE9D0EDE7002DE9D1EAE7E1\n' +
      ':10568000A242E8DC04DBAE42E5D80020AE42DDD227\n' +
      ':105690005842434101205B421843D7E7F0B55746D3\n' +
      ':1056A0004E4645464300E0B446028846760A1F0E41\n' +
      ':1056B000C40F002F47D0FF2F25D0002380259A4606\n' +
      ':06F80000FDFFFFFFFFFF0A\n' +
      // This Extended Linear Address record falls as the first block record
      ':020000040003F7\n' +
      ':1056C0009946F600ED042E437F3F434642465D0275\n' +
      ':1056D000D20F5B006D0A1B0E904640D0FF2B39D0D5\n' +
      ':1056E00080220020ED00D20415437F3BFB18424688\n' +
      ':1056F0005746591C62408C4607430F2F5CD86F49B0\n' +
      ':00000001FF\n';
    const universalHex = uh.iHexToCustomFormat(hexStr, 0x9901);

    const result = uh.separateUniversalHex(universalHex);

    expect(result[0].hex).toEqual(hexStr);
  });

  it('From full MakeCode files', () => {
    const universalHex = uh.createUniversalHex([
      {
        hex: hex1,
        boardId: 0x1,
      },
      {
        hex: hex2,
        boardId: 0x2,
      },
    ]);

    const result = uh.separateUniversalHex(universalHex);

    expect(result[0].boardId).toEqual(1);
    expect(result[0].hex).toEqual(hex1);
    expect(result[1].boardId).toEqual(2);
    // 2-ghost-music.hex does not open with the optional :020000040000FA record
    expect(result[1].hex).toEqual(':020000040000FA\n' + hex2);
  });
});
