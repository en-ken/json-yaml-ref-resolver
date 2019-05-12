import DataDescription from './data-description';
import fs from 'fs';
import rimraf from 'rimraf';

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
        expect(() => DataDescription.load(`test.template.foo`)).toThrow(
          'Unknown extension'
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
          'No document to save'
        );
      });
      test('an unknown extension', () => {
        const openApi = new DataDescription({
          id: '006',
          context: {
            key: 'value'
          }
        });
        expect(() => openApi.saveAs(`${saveDir}/saved.bar`)).toThrow(
          'Unknown extension'
        );
      });
    });
  });
  describe('getReference', () => {
    const pets = DataDescription.load(`${loadDir}/refs/pets.yml`);
    const petstoreTemplate = DataDescription.load(
      `${loadDir}/petstore.template.yml`
    );
    describe('is successful with', () => {
      test('local reference', () => {
        expect(pets.getReference('#/components/schemas/NewPet')).toEqual({
          required: ['name'],
          properties: {
            name: {
              type: 'string'
            },
            tag: {
              type: 'string'
            }
          }
        });
      });
      test('remote reference', () => {
        expect(pets.getReference('./common-schemas.yml#/Error')).toEqual({
          required: ['code', 'message'],
          properties: {
            code: {
              type: 'integer',
              format: 'int32'
            },
            message: {
              type: 'string'
            }
          }
        });
      });
      test('remote reference with ~1', () => {
        expect(
          petstoreTemplate.getReference('./refs/pets.yml#/paths/~1pets')
        ).toEqual(pets.doc['paths']['/pets']);
      });
    });
  });
});
