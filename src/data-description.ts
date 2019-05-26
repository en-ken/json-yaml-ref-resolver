import fs from 'fs';
import yaml from 'js-yaml';
import { ExtensionError, UsageError, PathNotFoundError } from './errors';

export default class DataDescription {
  doc: any;
  baseFilePath: string = '/';

  constructor(doc?: any) {
    this.doc = doc;
  }

  static load(filePath: string) {
    const ext = filePath.split('.').pop();

    const ins = new DataDescription();
    let func;
    switch (ext) {
      case 'yaml':
      case 'yml':
        func = yaml.safeLoad;
        break;
      case 'json':
        func = JSON.parse;
        break;
      default:
        throw new ExtensionError('Unknown extension');
    }

    try {
      ins.doc = func(fs.readFileSync(filePath, 'utf-8'));
    } catch (e) {
      throw new PathNotFoundError('File not found');
    }
    ins.baseFilePath = filePath;
    return ins;
  }

  saveAs(filePath: string, indent = 2) {
    if (this.doc == null) {
      throw new UsageError('No document to save');
    }
    const ext = filePath.split('.').pop();

    let docStr = null;
    switch (ext) {
      case 'yaml':
      case 'yml':
        docStr = yaml.safeDump(this.doc, { indent, noRefs: true });
        break;
      case 'json':
        docStr = JSON.stringify(this.doc, null, ' '.repeat(indent));
        break;
      default:
        throw new ExtensionError('Unknown extension');
    }

    try {
      fs.writeFileSync(filePath, docStr, 'utf-8');
    } catch (e) {
      throw new PathNotFoundError('Directory not found');
    }
  }

  setObject(ref: string, obj: {}) {
    const [remoteRef, localRef] = ref.split('#');
    if (remoteRef) {
      throw new UsageError('Remote reference unavailable');
    }

    const pathKeys = parseLocalPath(localRef);
    const lastKey = pathKeys.pop()!;

    let tmp = this.doc;
    pathKeys.forEach(x => {
      if (!tmp[x]) {
        tmp[x] = {};
      }
      tmp = tmp[x];
    });

    tmp[lastKey] = obj;
  }

  getObject(ref: string) {
    const [remoteRef, localRef] = ref.split('#');
    if (remoteRef) {
      throw new UsageError('Remote reference unavailable');
    }

    const pathKeys = parseLocalPath(localRef);

    let tmp = this.doc;
    pathKeys.forEach(x => {
      if (!tmp[x]) {
        tmp[x] = {};
      }
      tmp = tmp[x];
    });

    return tmp;
  }
}

const parseLocalPath = (ref: string) =>
  ref
    .split('/')
    .filter(x => x !== '')
    .map(x => x.replace(/~1/g, '/').replace(/~0/g, '~'));
