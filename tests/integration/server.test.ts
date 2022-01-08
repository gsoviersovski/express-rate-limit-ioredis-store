import chai from 'chai';
import Redis from 'ioredis';
import {before} from 'mocha';
import createServer from '../libs/createServer';

const server = createServer();
const usleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

describe('The store works alongside the express-rate-limit middleware', () => {

  before(done => {
    server.listen(3555, done);
  });

  beforeEach(async () => {
    await new Redis('localhost:6379').flushall();
  });

  it('Limits the requests for an ip after a limit', limitTest);

  it('Resets the ip counter after the window of time passed', resetTest);
});

async function limitTest() {
  for (let i = 0; i < 10; i++) {
    const res = await chai.request(server).get('/');
    res.body.message.should.be.equal('No problems so far');
  }
  for (let i = 0; i < 2; i++) {
    const res = await chai.request(server).get('/');
    res.body.error.should.be.equal('Too many requests');
  }
}

async function resetTest() {
  const client = new Redis('localhost:6379');
  for (let i = 0; i < 10; i++) {
    const res = await chai.request(server).get('/');
    res.body.message.should.be.equal('No problems so far');
  }
  let res = await chai.request(server).get('/');
  res.body.error.should.be.equal('Too many requests');
  let keys = await client.keys('*');
  keys.should.have.length(2);
  await usleep(3000);
  keys = await client.keys('*');
  keys.should.have.length(0);
  res = await chai.request(server).get('/');
  res.body.message.should.be.equal('No problems so far');
}
