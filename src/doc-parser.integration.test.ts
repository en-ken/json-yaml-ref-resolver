import parseDoc from './doc-parser';
import DataDescription from './data-description';

describe('parseDoc', () => {
  describe('integration test', () => {
    const loadDir = 'test-data';
    test('is successful', () => {
      const actual = parseDoc(`${loadDir}/petstore.template.yml`);
      const expected = DataDescription.load(`${loadDir}/petstore.expanded.yml`)
        .doc;
      expect(actual).toEqual(expected);
    });
  });
});
