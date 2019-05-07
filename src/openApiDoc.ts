import fs from 'fs';
import yaml from 'js-yaml';

export default class OpenApiDoc {
  doc: any;

  constructor(doc?: any) {
    this.doc = doc;
  }

  static load(filePath: string) {
    const ext = filePath.split('.').pop();

    const ins = new OpenApiDoc();
    switch (ext) {
      case 'yaml':
      case 'yml':
        ins.doc = yaml.safeLoad(fs.readFileSync(filePath, 'utf-8'));
        break;
      case 'json':
        ins.doc = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        break;
      default:
        throw new Error('Unknown extension');
    }

    return ins;
  }

  saveAs(filePath: string, indent = 2) {
    if (this.doc == null) {
      throw new Error('No document to save');
    }
    const ext = filePath.split('.').pop();

    let docStr = null;
    switch (ext) {
      case 'yaml':
      case 'yml':
        docStr = yaml.safeDump(this.doc, { indent });
        break;
      case 'json':
        docStr = JSON.stringify(this.doc, null, ' '.repeat(indent));
        break;
      default:
        throw new Error('Unknown extension');
    }
    fs.writeFileSync(filePath, docStr, 'utf-8');
  }
}
