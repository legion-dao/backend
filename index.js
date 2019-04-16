require('dotenv').config();
const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');

const app = new Koa();
const router = new Router();

const { createDao, getDao, getDaos } = require('./controllers/daos');
const { createPlayers } = require('./controllers/players');
const { createProposal, getProposal, getProposals, vote } = require('./controllers/proposals');

app.use(bodyParser());
app.use(cors());

// Initialize database
const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_URL}/test?retryWrites=true`;
const client = new MongoClient(uri, { useNewUrlParser: true });

const connectDb = async () => {
  await client.connect();
  app.context.db = client.db('legion-dao');
}

connectDb()

router.get('/', ctx => {
  ctx.body = 'You mades it kid.';
});

router.get('/daos', async ctx => {
  ctx.body = await getDaos(ctx.db);
});

router.get('/daos/:id', async ctx => {
  ctx.body = await getDao(ctx.db, ctx.params.id);
});

router.post('/create-dao', async ctx => {
  const { name, symbol, players } = ctx.request.body;

  await createDao(ctx.db, { name, symbol });

  createPlayers(ctx.db, { dao: name, players });

  ctx.status = 201;
});

router.get('/players', async ctx => {
  ctx.body = await ctx.db.collection('players').find().toArray();
});

router.get('/proposals', async ctx => {
  ctx.body = await getProposals(ctx.db);
});

router.get('/proposals/:address', async ctx => {
  ctx.body = await getProposal(ctx.db, ctx.params.address);
});

router.post('/proposals/create', async ctx => {
  ctx.body = await createProposal(ctx.db, ctx.request.body);
});

router.post('/proposals/vote', async ctx => {
  ctx.body = await vote(ctx.db, ctx.request.body);
});

app.use(router.routes());

app.listen(3000);

console.log('Your server is running on port 3000... I think?');
