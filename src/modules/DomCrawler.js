import cheerio from "cheerio";
import axios from "axios";

const crawlDom = async (url, domInfo) => {
    const html = await axios.get(url);

    let $ = cheerio.load(html.data);
    $ = cheerio.load($(domInfo.from).html());

    $(domInfo.remove).remove();

    if (domInfo.unwrap) {
        $(domInfo.unwrap).each(function () {
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

class DomCrawler {
    constructor() {
    }

    async crawlDom(url, domInfo) {
        return crawlDom(url, domInfo);
    }
}

let domCrawler = new DomCrawler();

module.exports = domCrawler;