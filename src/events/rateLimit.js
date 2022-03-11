module.exports = class {
    constructor(client) {
        this.client = client;
    }

    async run(rateLimit) {
        this.client.logger.log("--------------------------------------------------------------------------------", "warn");
        this.client.logger.log("❗❗ Rate limit exceeded ❗❗", "warn");
        this.client.logger.log("Timeout: " + rateLimit.timeout, "warn")
        this.client.logger.log("Limit: " + rateLimit.limit, "warn")
        this.client.logger.log("Method: " + rateLimit.method, "warn")
        this.client.logger.log("Path: " + rateLimit.path, "warn")
        this.client.logger.log("--------------------------------------------------------------------------------", "warn");
    }
};
