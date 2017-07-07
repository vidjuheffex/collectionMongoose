var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var zappaShowSchema = new Schema({
    date: {
        type: Date,
        required: true
    },
    lineup: [String],
    time: {
        type: String,
        enum: ["early", "late", "only"]
    },
    location: {
        venue: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        },
        state_province: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        }
    },
    setlist: [String]
});

module.exports = mongoose.model("ZappaShow", zappaShowSchema);
