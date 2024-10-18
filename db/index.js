const pg = require('pg');
const pool = new pg.Pool({
    host : 'localhost',
    port : 5432,
    database : 'challenge4_binar',
    user : 'mazya',
    password : 'binar',
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};