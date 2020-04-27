import * as utils from '../utils';

describe('Test byteArrayToHexStr()', () => {
  it('Convert a Uint8Array to a hexadecimal string', () => {
    const result = utils.byteArrayToHexStr(
      new Uint8Array([1, 2, 3, 10, 17, 255, 128])
    );

    expect(result).toEqual('0102030A11FF80');
  });

  it('Convert an empty Uint8Array into an empty string', () => {
    expect(utils.byteArrayToHexStr(new Uint8Array())).toEqual('');
  });
});

describe('Test byteToHexStrFast()', () => {
  it('A number that fits into a byte into a hexadecimal string', () => {
    expect(utils.byteToHexStrFast(10)).toEqual('0A');
    expect(utils.byteToHexStrFast(0)).toEqual('00');
    expect(utils.byteToHexStrFast(255)).toEqual('FF');
  });
});

describe('Test byteToHexStr()', () => {
  it('Positive integers that fits into a byte', () => {
    expect(utils.byteToHexStr(10)).toEqual('0A');
    expect(utils.byteToHexStr(0, false)).toEqual('00');
    expect(utils.byteToHexStr(255)).toEqual('FF');
  });

  it('Adds a prefix to the hex string', () => {
    expect(utils.byteToHexStr(10, true)).toEqual('0x0A');
    expect(utils.byteToHexStr(0, true)).toEqual('0x00');
    expect(utils.byteToHexStr(255, true)).toEqual('0xFF');
  });

  it('Positive integers that do not fit into a byte throw error', () => {
    expect(() => {
      utils.byteToHexStr(256);
    }).toThrow('does not fit');

    expect(() => {
      utils.byteToHexStr(-1);
    }).toThrow('does not fit');
  });

  it('Floats throw error', () => {
    expect(() => {
      utils.byteToHexStr(100.5);
    }).toThrow('not an integer');

    expect(() => {
      utils.byteToHexStr(-32.9);
    }).toThrow('not an integer');

    expect(() => {
      utils.byteToHexStr(255.000001);
    }).toThrow('not an integer');
  });
});

describe('Test concatUint8Arrays()', () => {
  it('Concatenate Uint8Arrays of different sizes', () => {
    const result = utils.concatUint8Arrays([
      new Uint8Array([1, 2]),
      new Uint8Array([3, 4, 5, 6, 7]),
      new Uint8Array([8]),
      new Uint8Array([9, 10]),
    ]);

    expect(result).toEqual(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]));
  });

  it('Concatenate an empty array into an empty Uint8Arrays', () => {
    expect(utils.concatUint8Arrays([])).toEqual(new Uint8Array());
  });
});
