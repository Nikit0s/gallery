'use strict';
const Promise = require('bluebird');

const express = require('express');
const app = express();
const listen = Promise.promisify(app.listen, { context: app });

const path = require('path');
const bodyParser = require('body-parser');

const hbs = require('hbs');
const registerPartials = Promise.promisify(hbs.registerPartials, { context: hbs });

const viewsDir = path.join(__dirname, 'bundles');
const publicDir = path.join(__dirname, 'public');

app.set('views', viewsDir);
app.set('view engine', 'hbs');
app.use(express.static(publicDir));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set('port', (process.env.PORT || 8080));

app.use((req, res, next) => {
    req.commonData = {
        meta: {
            charset: 'utf-8'
        },
        page: {
            title: 'Gallery'
        }
    };
    next();
});

require('./routes.js')(app);

module.exports = registerPartials(path.join(__dirname, 'blocks'))
    .then(() => listen(app.get('port')))
    .then(() => {
        console.log(`Listening on port ${app.get('port')}`);
        return app;
    })
    .catch(error => console.error(error));
