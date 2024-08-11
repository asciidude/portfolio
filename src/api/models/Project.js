const { Schema, model } = require('mongoose');

const ProjectSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    
    description: {
        type: String,
        required: true
    },

    link: {
        type: String,
        required: true
    },

    status: {
        type: String,
        enum: ['active', 'inactive', 'archive'],
        default: 'active',
        required: true
    },

    thumbnailUrl: String
}, { timestamps: true });

module.exports = model('Project', ProjectSchema);