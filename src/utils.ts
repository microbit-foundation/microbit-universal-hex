export function byteToHexStr(byte: number) {
  return byte.toString(16).padStart(2, '0');
}

export function byteArrayToHexStr(byteArray: Uint8Array): string {
  return byteArray.reduce(
    (accumulator, current) => accumulator + byteToHexStr(current),
    ''
  );
}

export function concatUint8Arrays(arrayToConcat: Uint8Array[]): Uint8Array {
  const fullLength = arrayToConcat.reduce(
    (accumulator, currentValue) => accumulator + currentValue.length,
    0
  );
  const combined: Uint8Array = new Uint8Array(fullLength);
  arrayToConcat.reduce((accumulator, currentArray) => {
    combined.set(currentArray, accumulator);
    return accumulator + currentArray.length;
  }, 0);
  return combined;
}
