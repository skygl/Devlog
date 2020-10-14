import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
    url: String,
    tags: [String],
    title: String,
    description: String,
    imageUrl: String,
    blog: {type: mongoose.Schema.ObjectId, ref: 'Blog'},
    score: Number,
    published_at: Date,
    created_at: Date
});

module.exports = mongoose.model('Post', PostSchema);
