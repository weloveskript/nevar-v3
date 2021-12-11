const mongoose = require('mongoose');

module.exports = mongoose.model("Log", new mongoose.Schema({
    commandName: { type: String, default: "unknown" },
    args: { type: Array, default: [] },
    commandType: { type: String, default: "unknown" },
    date: { type: Number, default: Date.now() },
    executor: { type: Object, default:
        {
            username: "unknown",
            discriminator: "0000",
            id: null,
            createdAt: { type: Number, default: Date.now()}
        }},
    guild: { type: Object, default:
        {
            name: "unknown",
            id: null,
            createdAt: { type: Number, default: Date.now() }
        }},
}))
