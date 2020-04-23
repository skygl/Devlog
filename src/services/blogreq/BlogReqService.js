import BlogReq from '../../models/BlogReq';
import BlogService from '../blog/BlogService';
import {BlogReqAlreadyProcessedError, ExistsUrlError, NotExistsUnprocessedBlogReqError} from './error/error';
import '@babel/polyfill';
import {DatabaseError} from "../error/error";
import {copy} from "../../utils/Utils";

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
        .then(savedBlogReq => !!savedBlogReq);
};

const findUnprocessedBlogReq = async () => {
    return BlogReq.findOne({processed: false})
        .catch(error => {
            throw new DatabaseError(error);
        })
        .then(savedBlogReq => {
            if (savedBlogReq) {
                return {
                    _id: savedBlogReq._id,
                    url: savedBlogReq.url
                }
            } else {
                throw new NotExistsUnprocessedBlogReqError();
            }
        });
};

const findById = async (_id) => {
    return BlogReq.findOne({_id: _id})
        .catch(error => {
            throw new DatabaseError(error)
        });
};

const processUnprocessedBlogReq = async (blogReqInfo) => {
    let blogReq = await findById(blogReqInfo._id);

    if (!blogReq) {
        throw new NotExistsUnprocessedBlogReqError();
    }
    if (blogReq.processed) {
        throw new BlogReqAlreadyProcessedError(blogReq.url);
    }

    if (blogReqInfo.accepted) {
        let updatedBlogReq = await BlogReq.findOneAndUpdate({_id: blogReqInfo._id}, {processed: true, accepted: true})
            .catch(error => {
                throw new DatabaseError(error);
            });
        let blogInfo = copy(blogReqInfo);
        delete blogInfo._id;
        delete blogInfo.accepted;
        let savedBlog = await BlogService.saveBlog(blogInfo);
        return {
            blogReq: updatedBlogReq,
            blog: savedBlog
        }
    } else {
        let updatedBlogReq = await BlogReq.findOneAndUpdate({_id: blogReqInfo._id}, {processed: true, accepted: false});
        return {
            blogReq: updatedBlogReq
        }
    }
};

export default {
    createBlogReq: createBlogReq,
    findUnprocessedBlogReq: findUnprocessedBlogReq,
    processUnprocessedBlogReq: processUnprocessedBlogReq,
}