const Controller = require("./Controller.js");
const axios = require('axios');
const { client } = require("../../app.js");
const { Permissions } = require('discord.js');

class GuildsController extends Controller {

	async isPermitted(guildId, userId){
		let guild = client.guilds.cache.get(guildId);
		let isPermitted = false;
		if(guild){
			let owner = await guild.fetchOwner();
			if(userId === owner.user.id){
				isPermitted = true;
			}else{
				let member = await guild.members.fetch(userId);
				if(member.permissions.has(Permissions.FLAGS.MANAGE_GUILD) || member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
					isPermitted = true;
				}
			}
		}
		return isPermitted;
	}

	async guilds() {
		const guilds = await this.getGuilds();
		let supportedGuilds = [];
		let unsupportedGuilds = [];

		for (let guild of guilds) {
			let hasPermissions = false;

			// Check if the bot is on the guild
			let cachedGuild = client.guilds.cache.get(guild.id);
			if(cachedGuild){
				//Check whether the user is the owner or just an admin
				let member = await cachedGuild.members.fetch(this.req.session['discord_id'])
				if(member.permissions.has(Permissions.FLAGS.MANAGE_GUILD) || member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
					hasPermissions = true;
				}
			}else{
				//Bot is not on the guild
				let userPerms = new Permissions(guild.permissions).toArray();
				if(userPerms.includes('MANAGE_GUILD') || userPerms.includes('ADMINISTRATOR')){
					if(!guild.owner) unsupportedGuilds.push(guild);
				}
			}
			if(!guild.owner){
				if(!hasPermissions) continue;
			}
			if (await client.findGuild(guild.id)) {
				supportedGuilds.push(guild);
			} else {
				unsupportedGuilds.push(guild);
			}
		}

		this.res.render('guilds', {
			baseUrl: this.baseUrl,
			client: client,
			supportedGuilds: supportedGuilds,
			unsupportedGuilds: unsupportedGuilds,
			discordId: this.req.session['discord_id'],
		});
	}

	async isOwner(guildId) {
		const guild = await client.guilds.fetch(guildId, false, true);
		let owner = await guild.fetchOwner();
		return this.req.session['discord_id'] == owner.user.id;
	}

	async premium(guildId) {
		const guild = await client.guilds.fetch(guildId, false, true);
		let perms = await this.isPermitted(guildId, this.req.session['discord_id']);
		let owner = await guild.fetchOwner();
		this.res.render('guild', {
			baseUrl: this.baseUrl,
			client: client,
			owner: owner,
			isPermitted: perms,
			guild: guild.toJSON(),
			subView: "premium",
			discordId: this.req.session['discord_id'],
		});
	}

	async settings(guildId) {
		const guild = await client.guilds.fetch(guildId, false, true);
		let perms = await this.isPermitted(guildId, this.req.session['discord_id']);
		let owner = await guild.fetchOwner();
		this.res.render('guild', {
			baseUrl: this.baseUrl,
			client: client,
			owner: owner,
			isPermitted: perms,
			guild: guild.toJSON(),
			subView: "settings",
			discordId: this.req.session['discord_id'],
		});
	}

	async commands(guildId) {
		const guild = await client.guilds.fetch(guildId, false, true);
		let perms = await this.isPermitted(guildId, this.req.session['discord_id']);
		let owner = await guild.fetchOwner();
		this.res.render('guild', {
			baseUrl: this.baseUrl,
			client: client,
			owner: owner,
			isPermitted: perms,
			guild: guild.toJSON(),
			subView: "commands",
			discordId: this.req.session['discord_id'],
		});
	}

	async bans(guildId) {
		const members = [];
		const guild = await client.guilds.fetch(guildId, false, true);
		let owner = await guild.fetchOwner();
		for(let member of await client.membersData.find({ "ban.banned": true })) {
			if(member.guildID == guild.id) {
				const user = await client.users.fetch(member.id);
				const ban = await guild.fetchBan(user);
				member["tag"] = user.tag;
				member["iconURL"] = user.avatarURL();
				member["ban"]["reason"] = ban.reason;
				members.push(member);
			}
		}
		let perms = await this.isPermitted(guildId, this.req.session['discord_id']);
		this.res.render('guild', {
			baseUrl: this.baseUrl,
			client: client,
			owner: owner,
			isPermitted: perms,
			guild: guild.toJSON(),
			members: members,
			subView: "bans",
			discordId: this.req.session['discord_id'],
		});
	}

	async kick(guildId, userId) {
		const access_token = this.req.session['access_token'];
		const guild = await client.guilds.fetch(guildId, false, true);
		if(await this.isPermitted(guildId, this.req.session['discord_id'])){
			const member = await guild.members.fetch(userId);
			const kicker = await guild.members.fetch(this.req.session['discord_id']);
			await member.kick({ reason: 'Kicked by ' + kicker.user.username + ' on the web dashboard'});
			this.res.redirect(this.baseUrl + "guilds/" + guildId + "/members");
		}
	}

	async guild(guildId) {
		const access_token = this.req.session['access_token'];
		const guild = await client.guilds.fetch(guildId, false, true);
		let owner = await guild.fetchOwner();
		let perms = await this.isPermitted(guildId, this.req.session['discord_id']);
		this.res.render('guild', {
			baseUrl: this.baseUrl,
			guild: guild.toJSON(),
			owner: owner,
			isPermitted: perms,
			discordId: this.req.session['discord_id'],
		});
	}

	async members(guildId) {
		const access_token = this.req.session['access_token'];
		const guild = await client.guilds.fetch(guildId, false, true);
		const members = []
		for(let member of (await guild.members.fetch()).values()) {
			let memberData = member.toJSON();
			memberData["iconURL"] = member.user.avatarURL();
			memberData["tag"] = member.user.tag;
			members.push(memberData);
		}
		let perms = await this.isPermitted(guildId, this.req.session['discord_id']);
		let owner = await guild.fetchOwner();
		this.res.render('guild', {
			baseUrl: this.baseUrl,
			guild: guild.toJSON(),
			owner: owner,
			isPermitted: perms,
			members: members,
			subView: "members",
			discordId: this.req.session['discord_id'],
		});
	}

	async getGuilds() {
		const access_token = this.req.session['access_token'];
		const guilds_response = await axios.get(
			'https://discord.com/api/v8/users/@me/guilds',
			{
				headers: {
					Authorization: 'Bearer ' + access_token,
				},
			},
		);
		return guilds_response.data;
	}

}

module.exports = GuildsController;
