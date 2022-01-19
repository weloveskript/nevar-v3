const OAuth2Controller = require('../controller/OAuth2Controller.js');
const GuildsController = require('../controller/GuildsController.js');
const router = require('express').Router();
const { client } = require('../../app')

router.use(require("../middleware/authedMiddleware.js"));

router.get('/', async (req, res) => {
	const guildsController = new GuildsController(req, res);
	await guildsController.guilds();
});

router.get('/oauth2/authorized', async (req, res) => {
	res.send("<script>\n" +
		"if(window.opener && window.opener !== window){\n" +
		"	let url = window.location.href;\n" +
		"	let uri = new URL(url);\n" +
		"	if(uri.searchParams.get('code') && uri.searchParams.get('permissions')){\n" +
		"		window.self.close();\n" +
		"	}else{\n" +
		"		if(uri.searchParams.get('error')){\n" +
		"			window.self.close();\n" +
		"		}else{\n" +
		"			document.title = '403: Forbidden'\n" +
		"		}\n" +
		"	}\n" +
		"}else{\n" +
		"	document.title = '403: Forbidden'\n" +
		"}\n" +
		"</script > ")
})
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
