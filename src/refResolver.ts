import OpenApiDoc from './openApiDoc';

export const loadRef = (ref: string) => {
  // './remote-ref.yml#/local/ref'
  const [remoteRef, localRef] = ref.split('#');

  // return if only local reference
  if (!remoteRef) return ref;

  const doc = OpenApiDoc.load(remoteRef).doc;
  if (!localRef) return doc;

  const parsed = parseLocalRef(localRef);
  let tmp = doc;
  parsed.forEach(x => {
    tmp = tmp[x];
  });
  return tmp;
};

const parseLocalRef = (ref: string) =>
  ref
    .split('/')
    .filter(x => x !== '')
    .map(x => x.replace(/~1/g, '/').replace(/~0/g, '~'));
