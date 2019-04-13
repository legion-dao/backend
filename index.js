require('dotenv').config();
const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');

const app = new Koa();
const router = new Router();

const { createDao } = require('./controllers/daos');
const { createPlayers } = require('./controllers/players');

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
  ctx.body = await ctx.db.collection('daos').find().toArray();
});

router.get('/daos/:id', async ctx => {
  const dao = await ctx.db.collection('daos').find({
    $or: [
      { name: ctx.params.id },
      { tokenAddress: ctx.params.id }
    ]
  }).toArray();

  ctx.body = (dao.length) ? dao[0] : [];
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

app.use(router.routes());

app.listen(3000);

console.log('Your server is running on port 3000... I think?');
