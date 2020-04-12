import cheerio from 'cheerio';
import Dom from '../../models/Dom';
import {DatabaseError} from "../error/error";

const saveDom = (domInfo) => {
    return new Promise(((resolve, reject) => {
        const domCount = parseHTML(domInfo.html);

        let dom = new Dom();
        Object.keys(domCount).forEach(key => {
            dom[key] = domCount[key];
        });
        dom.score = domInfo.score;

        dom.save()
            .then(savedDom => {
                resolve(savedDom);
            })
            .catch(err => {
                reject(new DatabaseError(err));
            });
    }));
};

const parseHTML = (html) => {
    const $ = cheerio.load(html);

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

    $("div > div, article > div").remove();

    $("h1, h2, h3, p, img, code, ul, ol, li, blockquote, a, table").each((index, element) => {
        result[element.name]++;
    });

    return result;
};

export default {
    saveDom: saveDom
}