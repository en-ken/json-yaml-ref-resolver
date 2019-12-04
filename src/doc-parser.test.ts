import parseDoc from './doc-parser';
import DataDescription from './data-description';

describe('parseDoc', () => {
  describe('unit test', () => {
    describe('is successful with', () => {
      test('reference from objects', () => {
        DataDescription.load = jest.fn(
          () =>
            new DataDescription({
              components: {
                schemas: {
                  Cats: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Cat' }
                  },
                  Cat: {
                    properties: {
                      name: {
                        type: 'string'
                      }
                    }
                  }
                }
              }
            })
        );
        const expected = {
          components: {
            schemas: {
              Cats: {
                type: 'array',
                items: {
                  properties: {
                    name: {
                      type: 'string'
                    }
                  }
                }
              },
              Cat: {
                properties: {
                  name: {
                    type: 'string'
                  }
                }
              }
            }
          }
        };

        const actual = parseDoc('foo.yaml');
        expect(actual).toEqual(expected);
      });
      test('reference from items in array', () => {
        DataDescription.load = jest.fn(
          () =>
            new DataDescription({
              components: {
                schemas: {
                  Pet: {
                    oneOf: [
                      { $ref: '#/components/schemas/Cat' },
                      { $ref: '#/components/schemas/Dog' }
                    ]
                  },
                  Cat: {
                    properties: {
                      name: {
                        type: 'string'
                      }
                    }
                  },
                  Dog: {
                    properties: {
                      name: {
                        type: 'string'
                      },
                      size: {
                        type: 'string'
                      }
                    }
                  }
                }
              }
            })
        );
        const expected = {
          components: {
            schemas: {
              Pet: {
                oneOf: [
                  {
                    properties: {
                      name: {
                        type: 'string'
                      }
                    }
                  },
                  {
                    properties: {
                      name: {
                        type: 'string'
                      },
                      size: {
                        type: 'string'
                      }
                    }
                  }
                ]
              },
              Cat: {
                properties: {
                  name: {
                    type: 'string'
                  }
                }
              },
              Dog: {
                properties: {
                  name: {
                    type: 'string'
                  },
                  size: {
                    type: 'string'
                  }
                }
              }
            }
          }
        };

        const actual = parseDoc('foo.yaml');
        expect(actual).toEqual(expected);
      });
      test('nested references', () => {
        DataDescription.load = jest.fn(
          () =>
            new DataDescription({
              content: {
                a: { $ref: '#/content/ref1' },
                ref1: { $ref: '#/content/ref2' },
                ref2: { $ref: '#/content/ref3' },
                ref3: 'a'
              }
            })
        );
        const expected = {
          content: {
            a: 'a',
            ref1: 'a',
            ref2: 'a',
            ref3: 'a'
          }
        };

        const actual = parseDoc('foo.yaml');
        expect(actual).toEqual(expected);
      });
    });
  });
});
