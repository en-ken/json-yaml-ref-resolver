import OpenApi from './openApiDoc';
import fs from 'fs';
import rimraf from 'rimraf';

describe('openApiDoc', () => {
  const loadDir = 'test-data';
  const saveDir = '.tmp';
  describe('load', () => {
    describe('is successful with', () => {
      test('.yml extension', () => {
        const openApi = OpenApi.load(`${loadDir}/test.template.yml`);

        expect(openApi.doc.info.title).toBe('Petstore.yml');
        expect(openApi.baseFilePath).toBe(`${loadDir}/test.template.yml`);
      });
      test('.yaml extension', () => {
        const openApi = OpenApi.load(`${loadDir}/test.template.yaml`);

        expect(openApi.doc.info.title).toBe('Petstore.yaml');
        expect(openApi.baseFilePath).toBe(`${loadDir}/test.template.yaml`);
      });
      test('.json extension', () => {
        const openApi = OpenApi.load(`${loadDir}/test.template.json`);

        expect(openApi.doc.info.title).toBe('Petstore.json');
        expect(openApi.baseFilePath).toBe(`${loadDir}/test.template.json`);
      });
    });
    describe('failed with', () => {
      test('an unknown extension', () => {
        expect(() => OpenApi.load(`test.template.foo`)).toThrow(
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
        const openApi = new OpenApi({
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
        const openApi = new OpenApi({
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
        const openApi = new OpenApi({
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
        const openApi = new OpenApi({
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
        const openApi = new OpenApi({
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
        const openApi = new OpenApi();

        expect(() => openApi.saveAs(`${saveDir}/saved.json`)).toThrow(
          'No document to save'
        );
      });
      test('an unknown extension', () => {
        const openApi = new OpenApi({
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
});
