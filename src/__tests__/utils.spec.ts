import { concatUint8Arrays } from '../utils';

describe('Test byteArrayToHexStr()', () => {
  it('Convert a Uint8Array to a hexadecimal string', () => {
    const result = concatUint8Arrays([
      new Uint8Array([1, 2]),
      new Uint8Array([3, 4, 5, 6, 7]),
      new Uint8Array([8]),
      new Uint8Array([9, 10]),
    ]);

    expect(result).toEqual(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]));
  });
});

describe('Test concatUint8Arrays()', () => {
  it('Concatenate Uint8Arrays of different sizes', () => {
    const result = concatUint8Arrays([
      new Uint8Array([1, 2]),
      new Uint8Array([3, 4, 5, 6, 7]),
      new Uint8Array([8]),
      new Uint8Array([9, 10]),
    ]);

    expect(result).toEqual(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]));
  });
});
