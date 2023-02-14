const dbConfig = {
  synchronize: true,
};

Object.assign(dbConfig, {
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'meme',
  password: 'KDTletsgo1!',
  database: 'meme_db',
  entities: ['**/*.entity.js'],
});

module.exports = dbConfig;