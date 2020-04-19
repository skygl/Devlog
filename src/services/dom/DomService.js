import cheerio from 'cheerio';
import Dom from '../../models/Dom';
import BlogService from "../blog/BlogService";
import axios from 'axios';
import {DatabaseError} from "../error/error";
import {DuplicatedPostUrlExistsError, HTMLParseError} from "./error/error";
import '@babel/polyfill';

const scoreDom = async (scoreInfo) => {
    const savedBlog = await BlogService.findBlogForPostUrl(scoreInfo.url);

    const savedPost = await existsUrl(scoreInfo.url);
    if (savedPost) {
        throw new DuplicatedPostUrlExistsError();
    }

    const elementsCount = await parseHTML(scoreInfo.url, savedBlog.elements)
        .catch(() => {
            throw new HTMLParseError();
        });

    let dom = new Dom();
    dom.url = scoreInfo.url;
    dom.score = scoreInfo.score;
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

const parseHTML = async (url, domInfo) => {
    const html = await axios.get(url);

    let $ = cheerio.load(html.data);
    $ = cheerio.load($(domInfo.from).html());

    $(domInfo.remove).remove();

    if (domInfo.unwrap) {
        $(domInfo.unwrap).each(function() {
           let $p = $(this).parent();
           $(this).insertAfter($(this).parent());
           $p.remove();
        });
    }

    const elements = ['h1', 'h2', 'h3', 'p', 'code', 'img', 'ul', 'ol', 'li', 'a', 'blockquote', 'table'];

    let doms = {};
    elements.forEach(element => {
       doms[element] = domInfo[element];
    });

    Object.entries(doms).forEach(entry => {
        if (!entry[1]) {
            delete doms[entry[0]];
        }
    });

    const result = {};
    elements.forEach(element => {
        result[element] = 0;
    });

    Object.entries(doms).forEach(entry => {
        $(entry[1]).each(() => {
            result[entry[0]]++;
        });
    });

    return result;
};

export default {
    scoreDom: scoreDom
}