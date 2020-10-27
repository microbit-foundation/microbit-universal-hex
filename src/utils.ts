/**
 * General utilities.
 *
 * (c) 2020 Micro:bit Educational Foundation and the project contributors.
 * SPDX-License-Identifier: MIT
 */

/**
 * Convert from a string with a hexadecimal number into a Uint8Array byte array.
 *
 * @export
 * @param hexStr A string with a hexadecimal number.
 * @returns A Uint8Array with the number broken down in bytes.
 */
export function hexStrToBytes(hexStr: string): Uint8Array {
  if (hexStr.length % 2 !== 0) {
    throw new Error(`Hex string "${hexStr}" is not divisible by 2.`);
  }
  const byteArray = hexStr.match(/.{1,2}/g);
  if (byteArray) {
    return new Uint8Array(
      byteArray.map((byteStr) => {
        const byteNum = parseInt(byteStr, 16);
        if (Number.isNaN(byteNum)) {
          throw new Error(`There were some non-hex characters in "${hexStr}".`);
        } else {
          return byteNum;
        }
      })
    );
  } else {
    return new Uint8Array();
  }
}

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

/**
 * Converts a Uint8Array into a string with base 16 hex digits. It doesn't
 * include an opening '0x'.
 *
 * @export
 * @param byteArray Uint8Array to convert to hex.
 * @returns String with base 16 hex digits.
 */
export function byteArrayToHexStr(byteArray: Uint8Array): string {
  return byteArray.reduce(
    (accumulator, current) =>
      accumulator + current.toString(16).toUpperCase().padStart(2, '0'),
    ''
  );
}

/**
 * Concatenates an array of Uint8Arrays into a single Uint8Array.
 *
 * @export
 * @param arraysToConcat Arrays to concatenate.
 * @returns Single concatenated Uint8Array.
 */
export function concatUint8Arrays(arraysToConcat: Uint8Array[]): Uint8Array {
  const fullLength = arraysToConcat.reduce(
    (accumulator, currentValue) => accumulator + currentValue.length,
    0
  );
  const combined: Uint8Array = new Uint8Array(fullLength);
  arraysToConcat.reduce((accumulator, currentArray) => {
    combined.set(currentArray, accumulator);
    return accumulator + currentArray.length;
  }, 0);
  return combined;
}
