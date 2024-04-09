const app = require('./app');

app.listen(process.env.PORT || '3000', () => {
    console.log("server running on port ${process.envPORT || '3000' }");
});

module.exports = app;
