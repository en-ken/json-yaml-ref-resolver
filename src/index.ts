import program from 'commander';
import parseDoc from './doc-parser';
import dataDescription from './data-description';
import { PathNotFoundError, ExtensionError } from './errors';

let inputPath = '';
let outputPath = '';

program
  .name('json-yaml-ref-resolver')
  .arguments('<targetFilePath> <outputFilePath>')
  .action((targetFilePath: string, outputFilePath: string) => {
    inputPath = targetFilePath;
    outputPath = outputFilePath;
  })
  .option('-i, --indent <size>', 'change indent size', 2)
  .parse(process.argv);

if (!inputPath || !outputPath) {
  program.help();
  process.exit(1);
}

let doc;
// read the target file and parse $ref
try {
  doc = parseDoc(inputPath);
} catch (err) {
  if (err instanceof PathNotFoundError) {
    process.stderr.write('<targetFilePath> does not exist');
  } else if (err instanceof ExtensionError) {
    process.stderr.write('Extension must be json/yaml/yml');
  } else {
    process.stderr.write(err);
  }
  process.exit(-1);
}

// save
try {
  if (program.indent) {
    new dataDescription(doc).saveAs(outputPath, program.indent);
  } else {
    new dataDescription(doc).saveAs(outputPath);
  }
} catch (err) {
  if (err instanceof PathNotFoundError) {
    process.stderr.write('<outputFilePath> does not exist');
  } else if (err instanceof ExtensionError) {
    process.stderr.write('Extension must be json/yaml/yml');
  } else {
    process.stderr.write(err);
  }
  process.exit(-1);
}

process.stdout.write('Done.\n');
