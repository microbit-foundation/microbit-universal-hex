import * as fs from 'fs';
import { sep } from 'path';
import * as process from 'process';
import { Command } from 'commander';
import * as microbitUh from './universal-hex';

/**
 * Combines two micro:bit Intel Hex files into a Universal Hex file.
 *
 * @param v1IntelHexPath - Path to the input micro:bit V1 Intel Hex file.
 * @param v2IntelHexPath - Path to the input micro:bit V2 Intel Hex file.
 * @param universalHexPath - Path to the output Universal Hex file.
 *    If not specified, it will be saved in the current working directory.
 * @param overwrite - Flag indicating whether to overwrite the output file
 *    if it already exists.
 */
function combine(
  v1IntelHexPath: string,
  v2IntelHexPath: string,
  universalHexPath: string | undefined,
  overwrite: boolean | undefined
) {
  console.log('Combining Intel Hex files into Universal Hex');
  console.log(`V1 Intel hex file: ${fs.realpathSync(v1IntelHexPath)}`);
  console.log(`V2 Intel hex file: ${fs.realpathSync(v2IntelHexPath)}`);

  if (!universalHexPath) {
    // If the output path is not specified, save it in the current working directory
    universalHexPath = `${process.cwd()}${sep}universal.hex`;
  }
  if (!overwrite && fs.existsSync(universalHexPath)) {
    throw new Error(
      `Output file already exists: ${fs.realpathSync(universalHexPath)}\n` +
        '\tUse "--overwrite" flag to replace it.'
    );
  }

  const v1IntelHexStr = fs.readFileSync(v1IntelHexPath, 'ascii');
  const v2IntelHexStr = fs.readFileSync(v2IntelHexPath, 'ascii');
  const universalHexStr = microbitUh.createUniversalHex([
    {
      hex: v1IntelHexStr,
      boardId: microbitUh.microbitBoardId.V1,
    },
    {
      hex: v2IntelHexStr,
      boardId: microbitUh.microbitBoardId.V2,
    },
  ]);
  fs.writeFileSync(universalHexPath, universalHexStr, { encoding: 'ascii' });

  console.log(`Universal Hex saved to: ${fs.realpathSync(universalHexPath)}`);
}

/**
 * Separates a Universal Hex file into two micro:bit Intel Hex files.
 *
 * @param universalHexPath - Path to the input Universal Hex file to split.
 * @param v1IntelHexPath - Path to the output micro:bit V1 Intel Hex file to
 *    save. If not specified, it will be saved in the current working directory.
 * @param v2IntelHexPath - Path to the output micro:bit V2 Intel Hex file to
 *    save. If not specified, it will be saved in the current working directory.
 * @param overwrite - Flag indicating whether to overwrite the output files if
 *   they already exist.
 */
function split(
  universalHexPath: string,
  v1IntelHexPath: string | undefined,
  v2IntelHexPath: string | undefined,
  overwrite: boolean | undefined
) {
  console.log(
    `Splitting Universal Hex file: ${fs.realpathSync(universalHexPath)}`
  );
  if (!v1IntelHexPath) {
    v1IntelHexPath = `${process.cwd()}${sep}v1-intel.hex`;
  }
  if (!v2IntelHexPath) {
    v2IntelHexPath = `${process.cwd()}${sep}v2-intel.hex`;
  }
  if (!overwrite && fs.existsSync(v1IntelHexPath)) {
    throw new Error(
      `Output V1 file already exists: ${fs.realpathSync(v1IntelHexPath)}\n` +
        '\tUse "--overwrite" flag to replace it.'
    );
  }
  if (!overwrite && fs.existsSync(v2IntelHexPath)) {
    throw new Error(
      `Output V2 file already exists: ${fs.realpathSync(v2IntelHexPath)}\n` +
        '\tUse "--overwrite" flag to replace it.'
    );
  }

  const universalHexStr = fs.readFileSync(universalHexPath, 'ascii');
  const separatedHexes = microbitUh.separateUniversalHex(universalHexStr);
  if (separatedHexes.length !== 2) {
    const boardIds = separatedHexes.map((hexObj) => hexObj.boardId);
    const errorMsg =
      'Universal Hex should contain only two micro:bit Intel Hexes.\n' +
      `Found ${separatedHexes.length}: ${boardIds.join(', ')}`;
    throw new Error(errorMsg);
  }

  let intelHexV1Str = '';
  let intelHexV2Str = '';
  separatedHexes.forEach((hexObj) => {
    if (microbitUh.V1_BOARD_IDS.includes(hexObj.boardId)) {
      intelHexV1Str = hexObj.hex;
    } else if (microbitUh.V2_BOARD_IDS.includes(hexObj.boardId)) {
      intelHexV2Str = hexObj.hex;
    }
  });
  if (!intelHexV1Str || !intelHexV2Str) {
    const boardIds = separatedHexes.map((hexObj) => hexObj.boardId);
    const errorMsg =
      'Universal Hex does not contain both micro:bit Intel Hexes.\n' +
      `Found hexes for following board IDs: ${boardIds.join(', ')}`;
    throw new Error(errorMsg);
  }
  fs.writeFileSync(v1IntelHexPath, intelHexV1Str, { encoding: 'ascii' });
  fs.writeFileSync(v2IntelHexPath, intelHexV2Str, { encoding: 'ascii' });

  console.log(`V1 Intel Hex saved to: ${fs.realpathSync(v1IntelHexPath)}`);
  console.log(`V2 Intel Hex saved to: ${fs.realpathSync(v2IntelHexPath)}`);
}

/**
 * Command line interface for the Universal Hex tool.
 *
 * @param args - Command line arguments.
 * @returns Exit code.
 */
function cli(args: string[]): number {
  const uHexCli = new Command();

  uHexCli
    .command('combine')
    .requiredOption('-v1, --v1 <path>', 'Path to input micro:bit V1 Intel Hex')
    .requiredOption('-v2, --v2 <path>', 'Path to input micro:bit V2 Intel Hex')
    .option('-u, --universal <path>', 'Path to output Universal Hex')
    .option('-o, --overwrite', 'Overwrite output file if it exists', false)
    .action(
      (options: {
        v1: string;
        v2: string;
        universal?: string;
        overwrite: boolean;
      }) => {
        try {
          combine(options.v1, options.v2, options.universal, options.overwrite);
        } catch (e) {
          console.error('Error:', e.message);
          process.exit(1);
        }
      }
    );

  uHexCli
    .command('split')
    .requiredOption('-u, --universal <path>', 'Path to input Universal Hex')
    .option('-v1, --v1 <path>', 'Path to output micro:bit V1 Intel Hex')
    .option('-v2, --v2 <path>', 'Path to output micro:bit V2 Intel Hex')
    .option('-o, --overwrite', 'Overwrite output files if they exist', false)
    .action(
      (options: {
        v1?: string;
        v2?: string;
        universal: string;
        overwrite: boolean;
      }) => {
        try {
          split(options.universal, options.v1, options.v2, options.overwrite);
        } catch (e) {
          console.error('Error:', e.message);
          process.exit(1);
        }
      }
    );

  uHexCli.parse(args);

  return 0;
}

process.exit(cli(process.argv));
