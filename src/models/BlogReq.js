import mongoose from 'mongoose';

const BlogReqSchema = new mongoose.Schema({
    url: String,
    status: String,
    reason: String,
    created_at: {type: Date, default: Date.now()},
    updated_at: {type: Date, default: Date.now()},
});

module.exports = mongoose.model('BlogReq', BlogReqSchema);