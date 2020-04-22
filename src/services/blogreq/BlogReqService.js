import BlogReq from '../../models/BlogReq';
import BlogService from '../blog/BlogService';
import {ExistsUrlError} from './error/error';
import '@babel/polyfill';
import {DatabaseError} from "../error/error";

const createBlogReq = async (blogInfo) => {
    let url = blogInfo.url;

    let existsBlogUrl = await BlogService.existsUrl(url);
    if (existsBlogUrl) {
        throw new ExistsUrlError("There is a Existed Blog Having Request Url.", url);
    }

    let existsBlogReqUrl = await existsUrl(url);
    if (existsBlogReqUrl) {
        throw new ExistsUrlError("There is a Existed BlogRequest Having Request Url.", url)
    }

    let blogReq = new BlogReq();
    blogReq.url = url;

    return blogReq.save();
};

const existsUrl = async (url) => {
    return BlogReq.findOne({url: url})
        .catch(error => {
            throw new DatabaseError(error);
        })
        .then(savedBlogReq => !!savedBlogReq)
};

export default {
    createBlogReq: createBlogReq,
}