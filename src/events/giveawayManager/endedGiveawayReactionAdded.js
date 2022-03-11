module.exports = class {
    constructor(client) {
        this.client = client;
    }

    async run(giveaway, member, reaction) {
        reaction.users.remove(member.user);
    }
};
