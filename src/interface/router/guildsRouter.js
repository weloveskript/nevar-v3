const OAuth2Controller = require('../controller/OAuth2Controller.js');
const GuildsController = require('../controller/GuildsController.js');
const router = require('express').Router();
const { client } = require('../../app')

router.use(require("../middleware/authedMiddleware.js"));

router.get('/', async (req, res) => {
	const guildsController = new GuildsController(req, res);
	await guildsController.guilds();
});

router.get('/guilds/:id(\\d+)/', async (req, res) => {
	const guildsController = new GuildsController(req, res);
	if(await guildsController.isPermitted(req.params.id, req.session['discord_id'])) {
		await guildsController.guild(req.params.id);
	}
});

router.get('/guilds/:id(\\d+)/members', async (req, res) => {
	const guildsController = new GuildsController(req, res);
	if(await guildsController.isPermitted(req.params.id, req.session['discord_id'])) {
		await guildsController.members(req.params.id);
	}
});

router.get('/guilds/:id(\\d+)/commands', async (req, res) => {
	const guildsController = new GuildsController(req, res);
	if(await guildsController.isPermitted(req.params.id, req.session['discord_id'])) {
		await guildsController.commands(req.params.id);
	}
});

router.get('/guilds/:id(\\d+)/premium', async (req, res) => {
	const guildsController = new GuildsController(req, res);
	if(await guildsController.isPermitted(req.params.id, req.session['discord_id'])) {
		await guildsController.premium(req.params.id);
	}
});

router.get('/guilds/:id(\\d+)/settings', async (req, res) => {
	const guildsController = new GuildsController(req, res);
	if(await guildsController.isPermitted(req.params.id, req.session['discord_id'])) {
		await guildsController.settings(req.params.id);
	}
});

router.get('/guilds/:id(\\d+)/bans', async (req, res) => {
	const guildsController = new GuildsController(req, res);
	if(await guildsController.isPermitted(req.params.id, req.session['discord_id'])) {
		await guildsController.bans(req.params.id);
	}
});

router.get('/guilds/:id(\\d+)/members/:userId(\\d+)/kick', async (req, res) => {
	const guildsController = new GuildsController(req, res);
	if(await guildsController.isPermitted(req.params.id, req.session['discord_id'])) {
		await guildsController.kick(req.params.id, req.params.userId);
	}
});


module.exports = router;
