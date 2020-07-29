const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    createdBy: {
        type: String,
        required: true,
    },
    reward: {
        type: String,
        required: true
    },
    shortDesc: {
        type: String,
        required: true
    },
    about: {
        description: {
            type: String,
            required: true,
        },
        contact: {
            type: String,
            required: true,
        },
        checkpoints: {
            type: [String],
            required: true
        }
    },
});

module.exports = Project = mongoose.model("project", ProjectSchema);