import mongoose from 'mongoose';

const BlogReqSchema = new mongoose.Schema({
    url: String,
    processed: {type: Boolean, default: false},
    accepted: {type: Boolean, default: false},
    created_at: {type: Date, default: Date.now()}
});

module.exports = mongoose.model('BlogReq', BlogReqSchema);