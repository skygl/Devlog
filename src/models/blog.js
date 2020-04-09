import mongoose from 'mongoose';

const BlogSchema = new mongoose.Schema({
    url: String,
    created_at: Date,
    updated_at: {type: Date, default: Date.now()},
    posts: [{
        post_id: Number,
        url: String,
        tags: [String],
        created_at: Date,
        published_at: Date,
        updated_at: Date
    }]
});

module.exports = mongoose.model('Blog', BlogSchema);