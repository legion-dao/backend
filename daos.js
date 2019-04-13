const createDao = async (db, { name, symbol }) => {
  await db.collection('daos').insertOne({
    name,
    symbol,
  });

  return;
}

module.exports = { 
  createDao,
}