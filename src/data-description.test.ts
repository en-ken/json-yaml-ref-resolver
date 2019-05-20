import DataDescription from './data-description';
import fs from 'fs';
import rimraf from 'rimraf';
import { UsageError, ExtensionError, PathNotFoundError } from './errors';

describe('DataDescription', () => {
  const loadDir = 'test-data';
  const saveDir = '.tmp';
  describe('load', () => {
    describe('is successful with', () => {
      test('.yml extension', () => {
        const openApi = DataDescription.load(
          `${loadDir}/petstore.template.yml`
        );

        expect(openApi.doc.info.title).toBe('Swagger Petstore');
        expect(openApi.baseFilePath).toBe(`${loadDir}/petstore.template.yml`);
      });
      test('.yaml extension', () => {
        const openApi = DataDescription.load(
          `${loadDir}/petstore.template.yaml`
        );

        expect(openApi.doc.info.title).toBe('Swagger Petstore');
        expect(openApi.baseFilePath).toBe(`${loadDir}/petstore.template.yaml`);
      });
      test('.json extension', () => {
        const openApi = DataDescription.load(
          `${loadDir}/petstore.template.json`
        );

        expect(openApi.doc.info.title).toBe('Swagger Petstore');
        expect(openApi.baseFilePath).toBe(`${loadDir}/petstore.template.json`);
      });
    });
    describe('failed with', () => {
      test('an unknown extension', () => {
        expect(() => DataDescription.load(`load.foo`)).toThrow(
          new ExtensionError('Unknown extension')
        );
      });
      test('a file which does not exist', () => {
        expect(() => DataDescription.load(`load.yml`)).toThrow(
          new PathNotFoundError('File not found')
        );
      });
    });
  });
  describe('save', () => {
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
    describe('is successful with', () => {
      test('.yml extension', () => {
        const openApi = new DataDescription({
          id: '001',
          context: {
            key: 'value'
          }
        });
        openApi.saveAs(`${saveDir}/saved.yml`);

        const data = fs.readFileSync(`${saveDir}/saved.yml`, 'utf-8');
        expect(data).toBe("id: '001'\ncontext:\n  key: value\n");
      });
      test('.yaml extension', () => {
        const openApi = new DataDescription({
          id: '002',
          context: {
            key: 'value'
          }
        });
        openApi.saveAs(`${saveDir}/saved.yaml`);

        const data = fs.readFileSync(`${saveDir}/saved.yaml`, 'utf-8');
        expect(data).toBe("id: '002'\ncontext:\n  key: value\n");
      });
      test('.json extension', () => {
        const openApi = new DataDescription({
          id: '003',
          context: {
            key: 'value'
          }
        });
        openApi.saveAs(`${saveDir}/saved.json`);

        const data = fs.readFileSync(`${saveDir}/saved.json`, 'utf-8');
        expect(data).toBe(
          '{\n  "id": "003",\n  "context": {\n    "key": "value"\n  }\n}'
        );
      });
      test('.yaml extension, indent size = 4', () => {
        const openApi = new DataDescription({
          id: '004',
          context: {
            key: 'value'
          }
        });
        openApi.saveAs(`${saveDir}/saved-indent4.yaml`, 4);

        const data = fs.readFileSync(`${saveDir}/saved-indent4.yaml`, 'utf-8');
        expect(data).toBe("id: '004'\ncontext:\n    key: value\n");
      });
      test('.json extension, indent size = 4', () => {
        const openApi = new DataDescription({
          id: '005',
          context: {
            key: 'value'
          }
        });
        openApi.saveAs(`${saveDir}/saved-indent4.json`, 4);

        const data = fs.readFileSync(`${saveDir}/saved-indent4.json`, 'utf-8');
        expect(data).toBe(
          '{\n    "id": "005",\n    "context": {\n        "key": "value"\n    }\n}'
        );
      });
    });
    describe('failed with', () => {
      test('an empty document', () => {
        const openApi = new DataDescription();

        expect(() => openApi.saveAs(`${saveDir}/saved.json`)).toThrow(
          new UsageError('No document to save')
        );
      });
      test('an unknown extension', () => {
        const openApi = new DataDescription({});
        expect(() => openApi.saveAs(`${saveDir}/saved.bar`)).toThrow(
          new ExtensionError('Unknown extension')
        );
      });
      test('a directory which does not exist', () => {
        const openApi = new DataDescription({});
        expect(() => openApi.saveAs(`foo/saved.yml`)).toThrow(
          new PathNotFoundError('Directory not found')
        );
      });
    });
  });
  describe('setObject', () => {
    const petstoreTemplate = DataDescription.load(
      `${loadDir}/petstore.template.yml`
    );
    describe('is successful with', () => {
      test('a local reference', () => {
        const obj = {
          required: ['name'],
          properties: {
            name: {
              type: 'string'
            },
            tag: {
              type: 'string'
            }
          }
        };

        petstoreTemplate.setObject('#/components/schemas/NewPet', obj);
        const expected =
          petstoreTemplate.doc['components']['schemas']['NewPet'];
        expect(obj).toEqual(expected);
      });
      test('a local reference with ~1', () => {
        const obj = {
          get: {
            response: {
              200: {
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/Pet'
                    }
                  }
                }
              }
            }
          }
        };
        petstoreTemplate.setObject('#/paths/~1pets~1{id}', obj);

        expect(obj).toEqual(petstoreTemplate.doc['paths']['/pets/{id}']);
      });
      test('a local reference to an item in array', () => {
        const path = 'https://petstore.swagger.io/v1';
        petstoreTemplate.setObject('#/servers/1', path);
        expect(path).toEqual(petstoreTemplate.doc['servers'][1]);
      });
    });
    describe('failed with', () => {
      test('remote reference', () => {
        expect(() =>
          petstoreTemplate.setObject('foo.yml#/components/schemas/NewPet', {})
        ).toThrow(new UsageError('Remote reference unavailable'));
      });
    });
  });
  describe('getObject', () => {
    const pets = DataDescription.load(`${loadDir}/refs/pets.yml`);
    describe('is successful with', () => {
      test('a local reference', () => {
        expect(pets.getObject('#/components/schemas/NewPet')).toEqual(
          pets.doc['components']['schemas']['NewPet']
        );
      });
      test('a local reference with ~1', () => {
        expect(pets.getObject('#/paths/~1pets')).toEqual(
          pets.doc['paths']['/pets']
        );
      });
      test('a local reference to an item in array', () => {
        expect(pets.getObject('#/components/schemas/Pet/required/1')).toEqual(
          pets.doc['components']['schemas']['Pet']['required'][1]
        );
      });
    });
    describe('failed with', () => {
      test('a remote reference', () => {
        expect(() => pets.getObject('./common-schemas.yml#/Error')).toThrow(
          new UsageError('Remote reference unavailable')
        );
      });
    });
  });
});
