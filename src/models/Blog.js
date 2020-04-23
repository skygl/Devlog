import mongoose from 'mongoose';

const BlogSchema = new mongoose.Schema({
    url: String,
    post_regex: String,
    elements: {
        from: String,
        remove: String,
        unwrap: String,
        h1: {type: String, default: 'h1'},
        h2: {type: String, default: 'h2'},
        h3: {type: String, default: 'h3'},
        p: {type: String, default: 'p'},
        img: {type: String, default: 'img'},
        code: {type: String, default: 'code'},
        ul: {type: String, default: 'ul'},
        ol: {type: String, default: 'ol'},
        li: {type: String, default: 'li'},
        blockquote: {type: String, default: 'blockquote'},
        a: {type: String, default: 'a'},
        table: {type: String, default: 'table'}
    },
    feed: {
        url: String,
        tag: String
    },
    created_at: Date,
    updated_at: {type: Date, default: Date.now()}
});

module.exports = mongoose.model('Blog', BlogSchema);