import mongoose from 'mongoose';

const BlogReqSchema = new mongoose.Schema({
    url: String,
    status: String,
    reason: String,
    created_at: Date,
    updated_at: Date,
});

module.exports = mongoose.model('BlogReq', BlogReqSchema);