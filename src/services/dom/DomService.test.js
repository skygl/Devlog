import DomService from "./DomService";
import Blog from "../../models/Blog";
import Dom from '../../models/Dom';
import {copy} from '../../utils/Utils';
import axios from 'axios';
import mockingoose from "mockingoose";
import DomCrawler from "../../modules/DomCrawler";
import '@babel/polyfill';
import {DatabaseError, DuplicatedPostUrlExistsError} from "../error/error";
import {HTMLParseError, NotExistsDomError, NotExistsUnscoredDomError} from "./error/error";
import {NotExistsHandleableBlogError} from "../blog/error/error";

jest.mock('axios');

const savedBlog = {
    _id: '4e3444818cde747f02000001',
    url: 'https://velog.io/',
    feed: {
        url: 'https://v2.velog.io/rss/',
        tag: '.head-wrapper > div > a'
    },
    post_regex: '^(https:\\/\\/velog.io\\/@)[0-9a-z_-]+(\\/)[0-9A-Za-z%-.]+$',
    elements: {
        from: '.atom-one-light',
        remove: 'p > code',
        unwrap: 'unwrap-target',
        h1: 'h1',
        h2: 'h2',
        h3: 'h3',
        p: 'p',
        img: 'img',
        code: 'pre > code',
        ul: 'ul',
        ol: 'ol',
        li: 'li',
        blockquote: 'blockquote',
        a: 'a',
        table: 'table'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
};

const scoreInfo = {
    url: "https://velog.io/@skygl/node-js",
    score: 9,
};

const expectedDomInfo = {
    url: "https://velog.io/@skygl/node-js",
    expected_score: 9,
    score: null,
    h1: 1,
    h2: 2,
    h3: 3,
    p: 4,
    img: 5,
    code: 2,
    ul: 3,
    ol: 1,
    li: 5,
    blockquote: 2,
    a: 2,
    table: 1,
};

const domInfo = {
    h1: 1,
    h2: 2,
    h3: 3,
    p: 4,
    img: 5,
    code: 2,
    ul: 3,
    ol: 1,
    li: 5,
    blockquote: 2,
    a: 2,
    table: 1
};

const savedDom = {
    _id: '5e9bcadbea0c206f9ee0efb1',
    url: "https://velog.io/@skygl/node-js",
    h1: 1,
    h2: 2,
    h3: 3,
    p: 4,
    img: 5,
    code: 2,
    ul: 3,
    ol: 1,
    li: 5,
    blockquote: 2,
    a: 2,
    table: 1,
    score: 9,
    created_at: new Date().toISOString(),
};
const savedExpectedScoreDom = {
    _id: '5e9bcadbea0c206f9ee0efb1',
    url: "https://velog.io/@skygl/node-js",
    h1: 1,
    h2: 2,
    h3: 3,
    p: 4,
    img: 5,
    code: 2,
    ul: 3,
    ol: 1,
    li: 5,
    blockquote: 2,
    a: 2,
    table: 1,
    score: null,
    expected_score: 9,
    created_at: new Date().toISOString(),
};

const savedScoredAndExpectedScoredDom = copy(savedExpectedScoreDom);
savedScoredAndExpectedScoredDom.score = 8;

const postHtml =
    `
    <div>
        <div class="head-wrapper">
            <div>
                <div>
                    <a>Javascript</a>
                    <a>Nodejs</a>
                    </div>
            </div>
        </div>
        <div>
            <div class="atom-one-light">
                <h1>a</h1>
                <h2>b</h2><h2>b</h2>
                <h3>c</h3><h3>c</h3><h3>c</h3>
                <p>d</p><p>d</p><p>d</p><p>d</p>
                <img><img><img><img><img>
                <pre><code>1</code></pre><pre><code>1</code></pre>
                <ul><li>3</li></ul><ul><li>3</li></ul><ul><li>3</li></ul>
                <ol><li>2</li><li>1</li></ol>
                <blockquote>1</blockquote><blockquote>1</blockquote>
                <a>3</a><a>2</a>
                <table>2</table>
            </div>
        </div>
    </div>
    `;

describe('scoreUnsavedDom', () => {
    test('BlogService 의 findBlogForPostUrl 함수에서 에러가 발생하는 경우 scoreDom 함수가 reject 를 리턴한다.', () => {
        // Given
        let error = new Error("Database Error Occurs.");
        mockingoose(Blog)
            .toReturn(error, 'findOne');

        // When & Then
        return expect(DomService.scoreUnsavedDom(scoreInfo)).rejects.toThrow(new DatabaseError(error));
    });

    test('URL의 포맷에 맞는 블로그가 등록되어 있지 않은 경우 scoreDom 함수가 reject 를 리턴한다.', () => {
        // Given
        let error = new NotExistsHandleableBlogError();
        mockingoose(Blog)
            .toReturn(null, 'findOne');

        // When & Then
        return expect(DomService.scoreUnsavedDom(scoreInfo)).rejects.toThrow(error);
    });

    test('DomService의 existsUrl 함수에서 에러가 발생하는 경우 scoreDom 함수가 reject 를 리턴한다.', () => {
        // Given
        let error = new Error("Database Error Occurs.");
        mockingoose(Blog)
            .toReturn(savedBlog, 'findOne');
        mockingoose(Dom)
            .toReturn(error, 'findOne');

        // When & Then
        return expect(DomService.scoreUnsavedDom(scoreInfo)).rejects.toThrow(new DatabaseError(error));
    });

    test('이미 등록된 URL을 가지고 있는 경우 scoreDom 함수가 reject 를 리턴한다.', () => {
        // Given
        let error = new DuplicatedPostUrlExistsError();
        mockingoose(Blog)
            .toReturn(savedBlog, "findOne");
        mockingoose(Dom)
            .toReturn(savedDom, "findOne");

        // When & Then
        return expect(DomService.scoreUnsavedDom(scoreInfo)).rejects.toThrow(error);
    });

    test('DomCrawler 모듈의 crawlDom 함수에서 에러가 발생하는 경우 scoreDom 함수가 reject를 리턴한다.', () => {
        // Given
        let error = new Error("Axios Error Occurs.");
        DomCrawler.crawlDom = jest.fn(async () => {
            throw new error
        });
        mockingoose(Blog)
            .toReturn(savedBlog, "findOne");
        mockingoose(Dom)
            .toReturn(null, "findOne");

        // When & Then
        return expect(DomService.scoreUnsavedDom(scoreInfo)).rejects.toThrow(new HTMLParseError());
    });

    test('Dom save 함수에서 에러가 발생하는 경우 scoreDom 함수가 reject를 리턴한다.', () => {
        // Given
        let error = new Error("Database Error Occurs.");
        DomCrawler.crawlDom = jest.fn(async () => {
                return domInfo;
            }
        );
        mockingoose(Blog)
            .toReturn(savedBlog, "findOne");
        mockingoose(Dom)
            .toReturn(null, "findOne")
            .toReturn(error, "save");

        // When & Then
        return expect(DomService.scoreUnsavedDom(scoreInfo)).rejects.toThrow(new DatabaseError(error));
    });

    test('scoreDom 함수를 성공한다.', async () => {
        // Given
        DomCrawler.crawlDom = jest.fn(async () => {
                return domInfo;
            }
        );
        mockingoose(Blog)
            .toReturn(savedBlog, "findOne");
        mockingoose(Dom)
            .toReturn(null, "findOne")
            .toReturn(savedDom, "save");

        // When
        let result = await DomService.scoreUnsavedDom(scoreInfo);

        // Then
        expect(copy(result)).toMatchObject(savedDom);
    });
});

describe('createDom', () => {
    test('Dom save 함수에서 에러가 발생하는 경우 createDom 함수가 reject를 리턴한다.', () => {
        // Given
        let error = new Error("Database Error Occurs.");
        mockingoose(Dom)
            .toReturn(error, "save");

        // When & Then
        return expect(DomService.createDom(expectedDomInfo)).rejects.toThrow(new DatabaseError(error));
    });

    test('scoreDom 함수를 성공한다.', async () => {
        // Given
        mockingoose(Dom)
            .toReturn(savedExpectedScoreDom, "save");

        // When
        let result = await DomService.createDom(expectedDomInfo);

        // Then
        expect(copy(result)).toMatchObject(savedExpectedScoreDom);
    });
});

describe('findUnscoredDom', () => {
    test('Dom의 findOne 함수가 에러를 발생시키면 findUnscoredDom 함수가 에러를 발생시킨다.', async () => {
        // Given
        let error = new Error("Database Error Occurs.");
        let databaseError = new DatabaseError(error);
        mockingoose(Dom)
            .toReturn(error, 'findOne');

        // When & Then
        return expect(DomService.findUnscoredDom()).rejects.toThrow(databaseError);
    });

    test('점수를 매겨야하는 Dom 이 존재하지 않으면 findUnscoredDom 함수가 에러를 발생시킨다.', async () => {
        // Given
        let error = new NotExistsUnscoredDomError();
        mockingoose(Dom)
            .toReturn(null, 'findOne');

        // When & Then
        return expect(DomService.findUnscoredDom()).rejects.toThrow(error);
    });

    test('findUnscoredDom 함수를 성공한다.', async () => {
        // Given
        mockingoose(Dom)
            .toReturn(savedExpectedScoreDom, 'findOne');

        // When
        let savedDom = await DomService.findUnscoredDom();

        // Then
        expect(copy(savedDom)).toMatchObject(savedExpectedScoreDom);
    });
});

describe('scoreUnscoredDom', () => {
    test('Dom의 findOne 함수가 에러를 발생시키면 scoreUnscoredDom 함수가 에러를 발생시킨다.', async () => {
        // Given
        let error = new Error("Database Error Occurs.");
        let databaseError = new DatabaseError(error);
        mockingoose(Dom)
            .toReturn(error, 'findOne');

        // When & Then
        return expect(DomService.scoreUnscoredDom(scoreInfo)).rejects.toThrow(databaseError);
    });

    test('점수 등록을 요청 받은 Dom 의 Url 이 존재하지 않으면 scoreUnscoredDom 함수가 에러를 발생시킨다.', async () => {
        // Given
        let error = new NotExistsDomError(scoreInfo.url);
        mockingoose(Dom)
            .toReturn(null, 'findOne');

        // When & Then
        return expect(DomService.scoreUnscoredDom(scoreInfo)).rejects.toThrow(error);
    });

    test('Dom의 findOneAndUpdate 함수가 에러를 발생시키면 scoreUnscoredDom 함수가 에러를 발생시킨다.', async () => {
        // Given
        let error = new Error("Database Error Occurs.");
        let databaseError = new DatabaseError(error);
        mockingoose(Dom)
            .toReturn(savedExpectedScoreDom, 'findOne')
            .toReturn(error, 'findOneAndUpdate');

        // When & Then
        return expect(DomService.scoreUnscoredDom(scoreInfo)).rejects.toThrow(databaseError);
    });

    test('scoreUnscoredDom 함수를 성공한다.', async () => {
        // Given
        mockingoose(Dom)
            .toReturn(savedExpectedScoreDom, 'findOne')
            .toReturn(savedScoredAndExpectedScoredDom, 'findOneAndUpdate');

        // When
        let result = await DomService.scoreUnscoredDom(scoreInfo);

        // Then
        expect(copy(result)).toMatchObject(savedScoredAndExpectedScoredDom);
    });
});