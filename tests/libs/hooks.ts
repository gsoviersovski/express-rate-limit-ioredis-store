import chai from 'chai';

export const mochaHooks = {
  beforeAll: async () => {
    chai.should();
  },
};
