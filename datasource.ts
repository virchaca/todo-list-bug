const { DataSource } = require('typeorm');

export default new DataSource({
    type: 'sqlite',
    database: './db/db.sqlite',
    entities: ['src/**/*.entity.ts'],
    migrations: ['src/migrations/*.ts'],
});
