import cheerio from 'cheerio';
import Dom from '../../models/Dom';
import BlogService from "../blog/BlogService";
import axios from 'axios';
import {DatabaseError} from "../error/error";
import {DuplicatedPostUrlExistsError, HTMLParseError} from "./error/error";

const scoreDom = (scoreInfo) => {
    return new Promise(((resolve, reject) => {
        BlogService.findBlogForPostUrl(scoreInfo.url)
            .then(blog => {
                existsUrl(scoreInfo.url)
                    .then((exists) => {
                        if (exists) {
                            reject(new DuplicatedPostUrlExistsError());
                        }
                        parseHTML(scoreInfo.url, blog.elements)
                            .then(domCount => {
                                let dom = new Dom();
                                dom.url = scoreInfo.url;
                                Object.keys(domCount).forEach(key => {
                                    dom[key] = domCount[key];
                                });
                                dom.score = scoreInfo.score;

                                dom.save()
                                    .then(savedDom => {
                                        resolve(savedDom);
                                    })
                                    .catch(err => {
                                        reject(new DatabaseError(err));
                                    });
                            })
                            .catch(() => {
                                reject(new HTMLParseError());
                            });
                    })
                    .catch(err => {
                        reject(err);
                    })
            })
            .catch(err => {
                reject(err);
            })
    }));
};

const existsUrl = (url) => {
    return new Promise((resolve, reject) => {
        Dom.findOne({url: url})
            .then(savedDom => {
                if (savedDom) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            })
            .catch(err => {
                reject(new DatabaseError(err));
            })
    });
};

const parseHTML = (url, domInfo) => {
    return new Promise((resolve, reject) => {
        axios.get(url)
            .then(html => {
                let $ = cheerio.load(html.data);

                $ = cheerio.load($(domInfo.from).html());

                $(domInfo.remove).remove();

                $(domInfo.unwrap).each(function () {
                    let $p = $(this).parent();
                    $(this).insertAfter($(this).parent());
                    $p.remove()
                });

                let doms = [
                    domInfo.h1, domInfo.h2, domInfo.h3, domInfo.p, domInfo.code, domInfo.img,
                    domInfo.ul, domInfo.ol, domInfo.ul, domInfo.li, domInfo.a, domInfo.blockquote, domInfo.table
                ];

                const result = {
                    h1: 0,
                    h2: 0,
                    h3: 0,
                    p: 0,
                    img: 0,
                    code: 0,
                    ul: 0,
                    ol: 0,
                    li: 0,
                    blockquote: 0,
                    a: 0,
                    table: 0
                };

                $(doms.join(", ")).each((index, element) => {
                    result[element.name]++;
                });

                resolve(result);
            })
            .catch(err => {
                reject(err);
            })
    });
};

export default {
    scoreDom: scoreDom
}