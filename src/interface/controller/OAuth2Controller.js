const { client } = require('../../app.js');
const Controller = require('./Controller.js');
const qs = require('qs');
const axios = require('axios');

class OAuth2Controller extends Controller {

	redirect() {
		if (!this.req.session['discord_id']) {
			let url = client.config.webdashboard.oauth2_url
				.replace('{clientId}', client.user.id)
				.replace('{redirectUrl}', encodeURIComponent(client.config.webdashboard.redirect_uri))
				.replace('{scopes}', encodeURIComponent(client.config.webdashboard.scopes.join(' ')))
			this.res.redirect(url);
			return true;
		}

		return false;
	}

	logout() {
		this.req.session.destroy();
		this.req.session = null;
		this.res.clearCookie("connect.sid");
		this.res.redirect(client.config.general.website);
	}

	async authenticate(code) {
		const token_response = await axios.post(
			'https://discord.com/api/oauth2/token',
			qs.stringify({
				client_id: client.user.id,
				client_secret: client.config.webdashboard.client_secret,
				grant_type: 'authorization_code',
				code: code,
				redirect_uri: client.config.webdashboard.redirect_uri,
				scope: client.config.webdashboard.scopes.join(' '),
			}),
		);

		const access_token = token_response.data['access_token'];
		const users_response = await axios.get(
			'https://discord.com/api/users/@me',
			{
				headers: {
					Authorization: 'Bearer ' + access_token,
				},
			},
		);
		this.req.session['access_token'] = access_token;
		this.req.session['discord_id'] = users_response.data['id'];
		this.req.session['username'] = users_response.data['username'];
		this.req.session['avatar'] = users_response.data['avatar'];
		this.req.session['discriminator'] = users_response.data['discriminator'];
		this.req.session['locale'] = users_response.data['locale'];
		this.res.redirect(this.baseUrl);
	}
}

module.exports = OAuth2Controller;
