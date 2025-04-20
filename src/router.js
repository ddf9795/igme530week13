const controllers = require('./controllers.js');
const cors = require('cors')

const router = (app) => {
    app.get('/', controllers.handleHomepage);
};

module.exports = router;