import mongoose from 'mongoose';

const BlogSchema = new mongoose.Schema({
    url: String,
    feed: {
        url: String,
        tag: String
    },
    created_at: Date,
    updated_at: {type: Date, default: Date.now()}
});

module.exports = mongoose.model('Blog', BlogSchema);