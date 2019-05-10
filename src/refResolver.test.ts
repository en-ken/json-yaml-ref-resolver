import { loadRef } from './refResolver';
import OpenApiDoc from './openApiDoc';

// mocking
OpenApiDoc.load = jest.fn(() => {
  const doc = {
    paths: {
      '/blogs/{blog_id}/new~posts': {
        get: 'get'
      }
    },
    components: {
      schemas: {
        Pet: {
          key: 'value'
        }
      }
    }
  };

  return new OpenApiDoc(doc);
}) as any;

describe('refResolver', () => {
  describe('loadRef', () => {
    describe('can load', () => {
      test('remote+local reference path', () => {
        const ref = './pets.yml#/components/schemas/Pet';
        expect(loadRef(ref)).toEqual({
          key: 'value'
        });
      });
      test('local reference path', () => {
        const ref = '#/components/schemas/Pet';
        expect(loadRef(ref)).toEqual(ref);
      });
      test('remote reference path', () => {
        const ref = './pets.yml';
        expect(loadRef(ref)).toEqual({
          paths: {
            '/blogs/{blog_id}/new~posts': {
              get: 'get'
            }
          },
          components: {
            schemas: {
              Pet: {
                key: 'value'
              }
            }
          }
        });
      });
      test('remote reference path with ~0 and ~1', () => {
        const ref = './pets.yml#/paths/~1blogs~1{blog_id}~1new~0posts';
        expect(loadRef(ref)).toEqual({
          get: 'get'
        });
      });
    });
  });
});
