import mongoose from 'mongoose';

const DomSchema = new mongoose.Schema({
    url: String,
    h1: {type: Number, default: 0},
    h2: {type: Number, default: 0},
    h3: {type: Number, default: 0},
    p: {type: Number, default: 0},
    img: {type: Number, default: 0},
    code: {type: Number, default: 0},
    ul: {type: Number, default: 0},
    ol: {type: Number, default: 0},
    li: {type: Number, default: 0},
    blockquote: {type: Number, default: 0},
    a: {type: Number, default: 0},
    table: {type: Number, default: 0},
    score: Number,
    expected_score: Number,
    created_at: {type: Date, default: Date.now()}
});

module.exports = mongoose.model('Dom', DomSchema);