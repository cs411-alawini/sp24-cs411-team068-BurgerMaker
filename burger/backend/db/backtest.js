
const database = require('./connection');

let results = {};

results.scan = (expression) => {
    return new Promise((resolve, reject) => {
        database.query(expression, (err, results) => {
            if (err) {
                return reject(err);
            }

            return resolve(results);
        });
    });
};

module.exports = results;