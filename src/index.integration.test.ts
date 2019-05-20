import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import rimraf from 'rimraf';

async function cli(args: any[] = []) {
  return new Promise<{ code: number; stdout: string; stderr: string }>(
    resolve =>
      exec(
        `node ${path.resolve('./')} ${args.join(' ')}`,
        { cwd: '.' },
        (err, stdout, stderr) =>
          resolve({
            code: err && err.code ? err.code : 0,
            stdout,
            stderr
          })
      )
  );
}

describe('CLI displays', () => {
  const saveDir = '.tmp';
  beforeAll(() => {
    try {
      fs.statSync(saveDir);
    } catch (_) {
      fs.mkdirSync(saveDir);
    }
  });
  afterAll(() => {
    rimraf(saveDir, () => {});
  });
  test('help', async () => {
    const result = await cli(['-h']);

    const match = [
      /Usage: json-yaml-ref-resolver \[options\] <targetFilePath> <outputFilePath>/,
      /-i, --indent <size>/,
      /-h, --help/
    ];
    match.forEach(x => expect(result.stdout).toMatch(x));
  });
  test('usage when required input is not enough', async () => {
    const result = await cli();
    const match = [
      /Usage: json-yaml-ref-resolver \[options\] <targetFilePath> <outputFilePath>/,
      /-i, --indent <size>/,
      /-h, --help/
    ];
    match.forEach(x => expect(result.stdout).toMatch(x));
  });
  test('the success message', async () => {
    const result = await cli([
      'test-data/petstore.template.yml',
      `${saveDir}/result.yml`
    ]);
    expect(result.stdout).toMatch(/Done./);
  });
  test('the success message with -i', async () => {
    const result = await cli([
      '-i 4',
      'test-data/petstore.template.yml',
      `${saveDir}/result-i.yml`
    ]);
    expect(result.stdout).toMatch(/Done./);
  });
  test('the success message with --indent', async () => {
    const result = await cli([
      '--indent 4',
      'test-data/petstore.template.yml',
      `${saveDir}/result-indent.yml`
    ]);
    expect(result.stdout).toMatch(/Done./);
  });
  test('the error message when <targetFilePath> does not exist', async () => {
    const result = await cli(['foo.yml', 'bar.yml']);
    expect(result.stderr).toMatch(/<targetFilePath> does not exist/);
  });
  test('the error message when the directory of <outputFilePath> does not exist', async () => {
    const result = await cli([
      'test-data/petstore.template.yml',
      'foo/bar.yml'
    ]);
    expect(result.stderr).toMatch(/<outputFilePath> does not exist/);
  });
  test('the error message when the extension of <targetFilePath> is wrong', async () => {
    const result = await cli(['foo.xml', 'bar.yml']);
    expect(result.stderr).toMatch(/Extension must be json\/yaml\/yml/);
  });
  test('the error message when the extension of <outputFilePath> is wrong', async () => {
    const result = await cli(['test-data/petstore.template.yml', 'bar.xml']);
    expect(result.stderr).toMatch(/Extension must be json\/yaml\/yml/);
  });
});
