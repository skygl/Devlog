import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
    url: String,
    tags: [String],
    score: Number,
    published_at: Date
});

module.exports = mongoose.model('Post', PostSchema);