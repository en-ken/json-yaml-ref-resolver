import path from 'path';
import DataDescription from './data-description';

const parseDoc = (filePath: string) => {
  const dsc = DataDescription.load(filePath);
  return parseRecursively(dsc);
};
export default parseDoc;

const parseRecursively = (
  description: DataDescription,
  targetRef: string = '#'
): any => {
  const part = description.getObject(targetRef);
  if (Array.isArray(part)) {
    part.forEach((item, i) => {
      if (typeof item === 'object') {
        part[i] = parseObject(description, item, targetRef, `${i}`);
      }
    });
  } else if (typeof part === 'object') {
    const keys = Object.keys(part);
    if (keys.length === 1 && keys[0] === '$ref') {
      return parseObject(description, part, targetRef, keys[0]);
    }
    keys.forEach(key => {
      const child = part[key];
      if (typeof child === 'object') {
        part[key] = parseObject(description, child, targetRef, key);
      }
    });
  }
  return part;
};

const parseObject = (
  description: DataDescription,
  obj: any,
  targetRef: string,
  key: string
) => {
  const keys = Object.keys(obj);
  if (keys.length === 1 && keys[0] === '$ref') {
    const { dsc, ref } = loadNewDocumentIfNeeded(description, obj['$ref']);
    return parseRecursively(dsc, ref);
  } else {
    const nextRef = `${targetRef}/${key
      .replace(/~/g, '~0')
      .replace(/\//g, '~1')}`;
    return parseRecursively(description, nextRef);
  }
};

const loadNewDocumentIfNeeded = (dsc: DataDescription, ref: string) => {
  // './remote-ref.yml#/local/ref'
  const [remoteRef, localRef] = ref.split('#');

  // return the parsed oject if only local reference
  if (!remoteRef) {
    return {
      dsc,
      ref
    };
  }

  // load another document
  const filePath = path.resolve(path.dirname(dsc.baseFilePath), remoteRef);
  const newDsc = DataDescription.load(filePath);

  return {
    dsc: newDsc,
    ref: `#${localRef}`
  };
};
