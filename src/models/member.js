const mongoose = require('mongoose');

module.exports = mongoose.model("Member", new mongoose.Schema({

    id: {
        type: String
    },
    guildID: {
        type: String
    },

    registeredAt: {
        type: Number,
        default: Date.now()
    },

    sanctions: {
        type: Array,
        default: []
    },
    ban: {
        type: Object,
        default: {
            banned: false,
            reason: null,
            moderator: {
              id: null,
              tag: null
            },
            duration: null,
            bannedAt: null,
            endDate: null
        }
    },

    economy: {
        type: Object,
        default: {
            pocket: 0,
            bank: 0,
            lastDaily: null,
            lastWeekly: null,
            lastRob: null,
            lastWork: null,
            job: null,
            workedHours: 0,
            lastBeg: null
        }
    }
}));
