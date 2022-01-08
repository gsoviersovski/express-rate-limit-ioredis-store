import chai from 'chai';
import chaiHttp from 'chai-http';

export const mochaHooks = {
  beforeAll: async () => {
    chai.should();
    chai.use(chaiHttp);
  },
};
