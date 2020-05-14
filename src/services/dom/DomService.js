import Dom from '../../models/Dom';
import BlogService from "../blog/BlogService";
import DomCrawler from "../../modules/DomCrawler"
import {DatabaseError, DuplicatedPostUrlExistsError} from "../error/error";
import {HTMLParseError, NotExistsDomError, NotExistsUnscoredDomError} from "./error/error";
import '@babel/polyfill';

const elements = ['h1', 'h2', 'h3', 'p', 'code', 'img', 'ul', 'ol', 'li', 'a', 'blockquote', 'table'];

const testDom = async (domInfo) => {
    return DomCrawler.crawlDom(domInfo.url, domInfo.domInfo);
};

const createDom = async (domInfo) => {
    let dom = new Dom();
    dom.url = domInfo.url;
    dom.expected_score = domInfo.expected_score;
    dom.score = null;
    dom.created_at = new Date();
    elements.forEach(element => {
        dom[element] = domInfo[element];
    });

    return dom.save()
        .catch(error => {
            throw new DatabaseError(error);
        });
};

const scoreUnscoredDom = async (scoreInfo) => {
    let url = scoreInfo.url;
    let dom = await Dom.findOne({url: scoreInfo.url})
        .catch(error => {
            throw new DatabaseError(error);
        });

    if (!dom) {
        throw new NotExistsDomError(url);
    }

    return Dom.findOneAndUpdate({_id: dom._id}, {score: scoreInfo.score}, {new: true})
        .catch(error => {
            throw new DatabaseError(error);
        })
};

const scoreUnsavedDom = async (scoreInfo) => {
    let dom = new Dom();
    dom.url = scoreInfo.url;
    dom.score = scoreInfo.score;
    dom.created_at = new Date();

    return saveDom(dom);
};

const saveDom = async (dom) => {
    const savedBlog = await BlogService.findBlogForPostUrl(dom.url);

    const savedPost = await existsUrl(dom.url);
    if (savedPost) {
        throw new DuplicatedPostUrlExistsError();
    }

    const elementsCount = await DomCrawler.crawlDom(dom.url, savedBlog.elements)
        .catch(() => {
            throw new HTMLParseError();
        });

    Object.keys(elementsCount).forEach(key => {
        dom[key] = elementsCount[key];
    });

    return dom.save()
        .catch(error => {
            throw new DatabaseError(error);
        });
};

const existsUrl = (url) => {
    return Dom.findOne({url: url})
        .catch(error => {
            throw new DatabaseError(error);
        })
        .then(savedDom => !!savedDom);
};

const findDom = async ({scored, fromDate, endDate} = {}) => {
    let condition = {};
    condition.created_at = {};
    if (scored !== undefined && scored !== null) {
        condition.score = {};
        condition.score.$exists = scored;
        condition.score.$ne = null;
    }
    if (fromDate !== undefined && fromDate !== null) {
        condition.created_at.$gte = fromDate;
    }
    if (endDate !== undefined && endDate !== null) {
        condition.created_at.$lt = endDate;
    }
    if (Object.keys(condition.created_at).length === 0) {
        delete condition.created_at;
    }
    return Dom.find(condition).lean();
};

const findUnscoredDom = async () => {
    let doms = await Dom.findOne({$or: [{score: {$eq: null}}, {score: {$exists: false}}]})
        .catch(error => {
            throw new DatabaseError(error);
        });

    if (doms) {
        return doms;
    } else {
        throw new NotExistsUnscoredDomError();
    }
};

export default {
    testDom: testDom,
    createDom: createDom,
    scoreUnscoredDom: scoreUnscoredDom,
    scoreUnsavedDom: scoreUnsavedDom,
    findDom: findDom,
    findUnscoredDom: findUnscoredDom,
}