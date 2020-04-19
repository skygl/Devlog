import DomService from "./DomService";
import Blog from "../../models/Blog";
import Dom from '../../models/Dom';
import copy from '../../utils/Utils';
import axios from 'axios';
import mockingoose from "mockingoose";
import '@babel/polyfill';
import {DatabaseError} from "../error/error";
import {DuplicatedPostUrlExistsError, HTMLParseError} from "./error/error";
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
    posts: [],
};

const scoreInfo = {
    url: "https://velog.io/@skygl/node-js",
    score: 9,
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

describe('scoreDom', () => {
    test('BlogService 의 findBlogForPostUrl 함수에서 에러가 발생하는 경우 scoreDom 함수가 reject 를 리턴한다.', () => {
        // Given
        let error = new Error("Database Error Occurs.");
        mockingoose(Blog)
            .toReturn(error, 'findOne');

        // When & Then
        return expect(DomService.scoreDom(scoreInfo)).rejects.toThrow(new DatabaseError(error));
    });

    test('URL의 포맷에 맞는 블로그가 등록되어 있지 않은 경우 scoreDom 함수가 reject 를 리턴한다.', () => {
        // Given
        let error = new Error("There is no Blog can handle this post.");
        mockingoose(Blog)
            .toReturn(null, 'findOne');

        // When & Then
        return expect(DomService.scoreDom(scoreInfo)).rejects.toThrow(error);
    });

    test('DomService의 existsUrl 함수에서 에러가 발생하는 경우 scoreDom 함수가 reject 를 리턴한다.', () => {
        // Given
        let error = new Error("Database Error Occurs.");
        mockingoose(Blog)
            .toReturn(savedBlog, 'findOne');
        mockingoose(Dom)
            .toReturn(error, 'findOne');

        // When & Then
        return expect(DomService.scoreDom(scoreInfo)).rejects.toThrow(new DatabaseError(error));
    });

    test('이미 등록된 URL을 가지고 있는 경우 scoreDom 함수가 reject 를 리턴한다.', () => {
        // Given
        let error = new DuplicatedPostUrlExistsError();
        mockingoose(Blog)
            .toReturn(savedBlog, "findOne");
        mockingoose(Dom)
            .toReturn(savedDom, "findOne");

        // When & Then
        return expect(DomService.scoreDom(scoreInfo)).rejects.toThrow(error);
    });

    test('axios get 함수에서 에러가 발생하는 경우 scoreDom 함수가 reject를 리턴한다.', () => {
        // Given
        let error = new Error("Axios Error Occurs.");
        axios.get.mockImplementationOnce(() => {
            return Promise.reject(error);
        });
        mockingoose(Blog)
            .toReturn(savedBlog, "findOne");
        mockingoose(Dom)
            .toReturn(null, "findOne");

        // When & Then
        return expect(DomService.scoreDom(scoreInfo)).rejects.toThrow(new HTMLParseError(error));
    });

    test('Dom save 함수에서 에러가 발생하는 경우 scoreDom 함수가 reject를 리턴한다.', () => {
        // Given
        let error = new Error("Database Error Occurs.");
        axios.get.mockImplementationOnce(() => {
            return Promise.resolve({
                data: postHtml
            })
        });
        mockingoose(Blog)
            .toReturn(savedBlog, "findOne");
        mockingoose(Dom)
            .toReturn(null, "findOne")
            .toReturn(error, "save");

        // When & Then
        return expect(DomService.scoreDom(scoreInfo)).rejects.toThrow(new DatabaseError(error));
    });

    test('scoreDom 함수를 성공한다.', async () => {
        // Given
        axios.get.mockImplementationOnce(() => {
            return Promise.resolve({
                data: postHtml
            })
        });
        mockingoose(Blog)
            .toReturn(savedBlog, "findOne");
        mockingoose(Dom)
            .toReturn(null, "findOne")
            .toReturn(savedDom, "save");

        // When
        let result = await DomService.scoreDom(scoreInfo);

        // Then
        expect(copy(result)).toMatchObject(savedDom);
    });
});