import { exec } from 'child_process';
import path from 'path';

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
      /-V, --version/,
      /-h, --help/
    ];
    match.forEach(x => expect(result.stdout).toMatch(x));
  });
  test.skip('success', async () => {
    const result = await cli([
      'test-data/petstore.template.yml',
      '.tmp/result.yml'
    ]);
    expect(result.stdout).toMatch(/Done./);
  });
  test.skip('error message when <targetFilePath> does not exist', async () => {
    const result = await cli(['foo.yml', 'bar.yml']);
    expect(result.stderr).toMatch(/<targetFilePath> does not exist/);
  });
  test.skip('error message when the directory of <outputFilePath> does not exist', async () => {
    const result = await cli([
      'test-data/petstore.template.yml',
      'foo/bar.yml'
    ]);
    expect(result.stderr).toMatch(/<outputFilePath> does not exist/);
  });
});
