const router = require("express").Router();
const OAuth2Controller = require("../controller/OAuth2Controller.js");

router.get('/oauth2', async (req, res) => {
	const authController = new OAuth2Controller(req, res);
	const code = req.query['code'];
	await authController.authenticate(code);
});

router.get("/logout", async(req, res) => {
	const authController = new OAuth2Controller(req, res);
	authController.logout();
});

module.exports = router;