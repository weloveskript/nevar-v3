const OAuth2Controller = require('../controller/OAuth2Controller.js');
module.exports = (req, res, next) => {
	const authController = new OAuth2Controller(req, res);
	if (!authController.redirect()) {
		next();
	}
}