import * as utils from '../utils';

describe('Test byteArrayToHexStr()', () => {
  it('Convert a Uint8Array to a hexadecimal string', () => {
    expect(utils.byteToHexStr(10)).toEqual('0a');
    expect(utils.byteToHexStr(0)).toEqual('00');
    expect(utils.byteToHexStr(255)).toEqual('ff');
  });

  // TODO: Test values larger than 0xff and smaller than 0
});

describe('Test byteArrayToHexStr()', () => {
  it('Convert a Uint8Array to a hexadecimal string', () => {
    const result = utils.byteArrayToHexStr(
      new Uint8Array([1, 2, 3, 10, 17, 255, 128])
    );

    expect(result).toEqual('0102030a11ff80');
  });

  it('Convert an empty Uint8Array into an empty string', () => {
    expect(utils.byteArrayToHexStr(new Uint8Array())).toEqual('');
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
