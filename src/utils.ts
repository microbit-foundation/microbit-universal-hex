/**
 * Convert a positive integer byte (0 to 0xFF) into a hex string.
 *
 * @export
 * @param byte Number to convert into a hex string.
 * @param prefix Boolean to add '0x' to the beginning of the string.
 * @returns String with hex value, padded to always at least 2 characters.
 */
export function byteToHexStr(byte: number, prefix: boolean = false) {
  if (!Number.isInteger(byte)) {
    throw new Error(`Number to convert to hex is not an integer: ${byte}`);
  }
  if (byte < 0 || byte > 0xff) {
    throw new Error(
      `Number to convert to hex does not fit in an unsigned byte: ${byte}`
    );
  }
  const hexStr = byteToHexStrFast(byte);
  return prefix ? `0x${hexStr}` : hexStr;
}

/**
 * A version of byteToHexStr() without input sanitation, only to be called when
 * the caller can guarantee the input is a positive integer between 0 and 0xFF.
 *
 * @export
 * @param byte Number to convert into a hex string.
 * @returns String with hex value, padded to always have 2 characters.
 */
export function byteToHexStrFast(byte: number) {
  return byte.toString(16).toUpperCase().padStart(2, '0');
}

export function byteArrayToHexStr(byteArray: Uint8Array): string {
  return byteArray.reduce(
    (accumulator, current) =>
      accumulator + current.toString(16).toUpperCase().padStart(2, '0'),
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
