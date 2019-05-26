import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import rimraf from 'rimraf';

function cli(args: any[] = []) {
  return spawnSync('npx', ['ts-node', path.resolve('src'), ...args], {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'pipe',
    encoding: 'utf-8'
  });
}

describe('CLI displays', () => {
  const saveDir = '.tmp';
  beforeEach(() => {
    try {
      fs.statSync(saveDir);
    } catch (_) {
      fs.mkdirSync(saveDir);
    }
  });
  afterEach(() => {
    rimraf(saveDir, () => {});
  });
  test('help', () => {
    const result = cli(['-h']);

    const match = [
      /Usage: json-yaml-ref-resolver \[options\] <targetFilePath> <outputFilePath>/,
      /-i, --indent <size>/,
      /-h, --help/
    ];
    match.forEach(x => expect(result.stdout).toMatch(x));
  });
  test('usage when required input is not enough', () => {
    const result = cli();
    const match = [
      /Usage: json-yaml-ref-resolver \[options\] <targetFilePath> <outputFilePath>/,
      /-i, --indent <size>/,
      /-h, --help/
    ];
    match.forEach(x => expect(result.stdout).toMatch(x));
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
