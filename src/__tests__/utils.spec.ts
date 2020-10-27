/**
 * Tests for utilities.
 *
 * (c) 2020 Micro:bit Educational Foundation and contributors.
 * SPDX-License-Identifier: MIT
 */
import * as utils from '../utils';

describe('Test hexStrToBytes()', () => {
  it('Converts hexadecimal string to a Uint8Array', () => {
    expect(utils.hexStrToBytes('0102030A11FF80')).toEqual(
      new Uint8Array([1, 2, 3, 10, 17, 255, 128])
    );
  });

  it('Converts an empty string into an empty Uint8Array', () => {
    expect(utils.hexStrToBytes('')).toEqual(new Uint8Array());
  });

  it('Converts an non-hex string into an empty Uint8Array', () => {
    expect(() => {
      utils.hexStrToBytes('carlos');
    }).toThrow('non-hex characters');
  });

  it('Throws error when string does not contain even number of chars', () => {
    expect(() => {
      utils.hexStrToBytes('123');
    }).toThrow('not divisible by 2');
  });
});

describe('Test byteArrayToHexStr()', () => {
  it('Converts a Uint8Array to a hexadecimal string', () => {
    const result = utils.byteArrayToHexStr(
      new Uint8Array([1, 2, 3, 10, 17, 255, 128])
    );

    expect(result).toEqual('0102030A11FF80');
  });

  it('Converts an empty Uint8Array into an empty string', () => {
    expect(utils.byteArrayToHexStr(new Uint8Array())).toEqual('');
  });
});

describe('Loop back between byteArrayToHexStr() and hexStrToBytes()', () => {
  it('Converts a Uint8Array to a hexadecimal string and back again', () => {
    const initialArray = new Uint8Array([66, 8, 90, 110, 217, 255, 128, 0]);

    const result = utils.hexStrToBytes(utils.byteArrayToHexStr(initialArray));

    expect(result).toEqual(initialArray);
  });

  it('Converts a hexadecimal string to a Uint8Array and back again', () => {
    const initialStr = '28B1304601F018FF304608F034FB234F';

    const result = utils.byteArrayToHexStr(utils.hexStrToBytes(initialStr));

    expect(result).toEqual(initialStr);
  });
});

describe('Test byteToHexStrFast()', () => {
  it('Converts a 1-byte number into a hexadecimal string', () => {
    expect(utils.byteToHexStrFast(10)).toEqual('0A');
    expect(utils.byteToHexStrFast(0)).toEqual('00');
    expect(utils.byteToHexStrFast(255)).toEqual('FF');
  });
});

describe('Test byteToHexStr()', () => {
  it('Converts a 1-byte positive integer into a hexadecimal string', () => {
    expect(utils.byteToHexStr(10)).toEqual('0A');
    expect(utils.byteToHexStr(0, false)).toEqual('00');
    expect(utils.byteToHexStr(255)).toEqual('FF');
  });

  it('Adds a prefix to the converted hex string', () => {
    expect(utils.byteToHexStr(10, true)).toEqual('0x0A');
    expect(utils.byteToHexStr(0, true)).toEqual('0x00');
    expect(utils.byteToHexStr(255, true)).toEqual('0xFF');
  });

  it('Throws error when integer does not fit into an unsigned byte', () => {
    expect(() => {
      utils.byteToHexStr(256);
    }).toThrow('does not fit');

    expect(() => {
      utils.byteToHexStr(-1);
    }).toThrow('does not fit');
  });

  it('Throws error when input is a float', () => {
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
  it('Concatenates Uint8Arrays of different sizes', () => {
    const result = utils.concatUint8Arrays([
      new Uint8Array([1, 2]),
      new Uint8Array([3, 4, 5, 6, 7]),
      new Uint8Array([8]),
      new Uint8Array([9, 10]),
    ]);

    expect(result).toEqual(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]));
  });

  it('Concatenates an empty array into an empty Uint8Arrays', () => {
    expect(utils.concatUint8Arrays([])).toEqual(new Uint8Array());
  });
});
