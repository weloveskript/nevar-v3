const { Request, Response } = require('express');
const { client } = require("../../app.js");

class Controller {

	constructor(req, res) {
		this._req = req;
		this._res = res;
	}


	get req() {
		return this._req;
	}

	get res() {
		return this._res;
	}

	set req(value) {
		this._req = value;
	}

	set res(value) {
		this._res = value;
	}

	get baseUrl() {
		return client.config.webdashboard.base_url;
	}
}

module.exports = Controller;
