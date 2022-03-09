import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';

function cli(args: any[] = []) {
  return spawnSync('npx', ['ts-node', path.resolve('src'), ...args], {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'pipe',
    encoding: 'utf-8'
  });
}

async function sleep(msec: number) {
  return new Promise((resolve) => setTimeout(resolve, msec));
}

function pathExists(path: string) {
  try {
    fs.statSync(path);
    return true;
  } catch (_) {
    return false;
  }
}

describe('App test:', () => {
  const saveDir = '.tmp';
  beforeAll(() => {
    if (!pathExists(saveDir)) {
      try {
        fs.mkdirSync(saveDir);
      } catch (e) {
        console.log(e);
      }
    }
  });
  test('outputs the expected file', async () => {
    const inputPath = 'test-data/petstore.template.yml';
    const outputPath = `${saveDir}/result.yml`;
    const expectedPath = 'test-data/petstore.expanded.yml';

    cli([inputPath, outputPath]);

    while (!pathExists(outputPath)) {
      await sleep(100);
    }

    const expected = fs.readFileSync(expectedPath, 'utf-8');
    const actual = fs.readFileSync(outputPath, 'utf-8');
    expect(actual).toEqual(expected);
  });
  describe('CLI displays', () => {
    test('help', () => {
      const result = cli(['-h']);

      const match = [
        /Usage: ref-resolver \[options\] <targetFilePath> <outputFilePath>/,
        /-i, --indent <size>/,
        /-h, --help/,
        /-V, --version/
      ];
      match.forEach((x) => expect(result.stdout).toMatch(x));
    });
    test('usage when required input is not enough', () => {
      const result = cli();
      const match = [/missing required argument 'targetFilePath'/];
      match.forEach((x) => expect(result.stderr).toMatch(x));
    });
    test('the success message', () => {
      const result = cli([
        'test-data/petstore.template.yml',
        `${saveDir}/result.yml`
      ]);
      expect(result.stderr).toEqual('');
      expect(result.stdout).toMatch(/Done./);
    });
    test('the error message when <targetFilePath> does not exist', () => {
      const result = cli(['foo.yml', 'bar.yml']);
      expect(result.stderr).toMatch(/<targetFilePath> does not exist/);
    });
    test('the error message when the directory of <outputFilePath> does not exist', () => {
      const result = cli(['test-data/petstore.template.yml', 'foo/bar.yml']);
      expect(result.stderr).toMatch(/<outputFilePath> does not exist/);
    });
    test('the error message when the extension of <targetFilePath> is wrong', () => {
      const result = cli(['foo.xml', 'bar.yml']);
      expect(result.stderr).toMatch(/Extension must be json\/yaml\/yml/);
    });
    test('the error message when the extension of <outputFilePath> is wrong', () => {
      const result = cli(['test-data/petstore.template.yml', 'bar.xml']);
      expect(result.stderr).toMatch(/Extension must be json\/yaml\/yml/);
    });
  });
});
