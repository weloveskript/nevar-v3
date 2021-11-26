const { client } = require('../app.js');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const sass = require('sass-middleware');
const app = express();
const qs = require('qs');
const axios = require('axios');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoDBStore = require("connect-mongodb-session")(session);
const FileStore = require("session-file-store")(session);

// Controllers
const OAuth2Controller = require('./controller/OAuth2Controller.js');
const GuildsController = require('./controller/GuildsController.js');

const port = client.config.webdashboard.port;

module.exports = async () => {
	const store = new MongoDBStore({
		uri: client.config.general.mongodb_url,
		collection: "sessions"
	});
	store.on("error", (err) => {
		client.logger.error(err);
	})

	app.set('views', path.join(path.resolve('.'), 'src', 'interface', 'views'));
	app.set('view engine', 'pug');

	app.locals.moment = require('moment');
	app.locals.client = client;

	app.use(express.json());
	app.use(
		express.urlencoded({
			extended: false,
		}),
	);
	//app.use(helmet());
	app.use(cookieParser());
	app.use(
		session({
			store: store,
			secret: client.config.webdashboard.session_secret,
			resave: true,
			saveUninitialized: true,
			cookie: {
				maxAge: 31536000000,
			},
		}),
	);
	app.use(
		sass({
			src: path.join(path.resolve('.'), 'src', 'interface', 'public', 'scss'),
			dest: path.join(path.resolve('.'), 'src', 'interface', 'public', 'css'),
			style: 'compressed',
		}),
		express.static(path.join(path.resolve('.'), 'src', 'interface', 'public')),
	);

	app.use(require("./router/oauth2Router.js"));
	app.use(require("./router/guildsRouter.js"));

	app.listen(port, () => {
		client.logger.log('Interface web server is running on port ' + port);
	});

};
