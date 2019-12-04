import path from 'path';
import DataDescription from './data-description';

const parseDoc = (filePath: string) => {
  const dsc = DataDescription.load(filePath);
  return parse(dsc);
};
export default parseDoc;

const parse = (description: DataDescription, targetRef: string = '#'): any => {
  const part = description.getObject(targetRef);
  if (Array.isArray(part)) {
    part.forEach((item, i) => {
      if (typeof item === 'object') {
        part[i] = parse(description, joinRefPath(targetRef, `${i}`));
      }
    });
  } else if (typeof part === 'object') {
    const keys = Object.keys(part);
    if (keys.length === 1 && keys[0] === '$ref') {
      const { dsc, ref } = loadNewDocumentIfNeeded(description, part['$ref']);
      return parse(dsc, ref);
    } else {
      keys.forEach(key => {
        if (typeof part[key] === 'object') {
          part[key] = parse(description, joinRefPath(targetRef, key));
        }
      });
    }
  }
  return part;
};

const joinRefPath = (targetRef: string, key: string) =>
  `${targetRef}/${key.replace(/~/g, '~0').replace(/\//g, '~1')}`;

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
