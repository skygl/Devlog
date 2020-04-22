import mongoose from 'mongoose';

const BlogReqSchema = new mongoose.Schema({
    url: String,
    processed: Boolean,
    accepted: Boolean,
    created_at: {type: Date, default: Date.now()}
});

module.exports = mongoose.model('BlogReq', BlogReqSchema);