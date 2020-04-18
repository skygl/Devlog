import Blog from '../../models/Blog';
import BlogService from "./BlogService";
import {DatabaseError} from "../error/error";
import {DuplicatedBlogUrlExistsError} from "./error/error";
import copy from '../../utils/Utils';
import mockingoose from "mockingoose";
import '@babel/polyfill';

const blogInfo = {
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
    }
};

const savedBlogInfo = copy(blogInfo);
savedBlogInfo["_id"] = '4e3444818cde747f02000001';
savedBlogInfo["posts"] = [];
savedBlogInfo["updated_at"] = new Date().toISOString();

describe('saveBlog', () => {
    test('exitsUrl 함수에서 에러 발생시 saveBlog 함수가 reject를 리턴한다.', () => {
        // Given
        let error = new DatabaseError(new Error("Database Error Occurs"));
        mockingoose(Blog)
            .toReturn(error, 'findOne')
            .reset('save');

        // When & Then
        return expect(BlogService.saveBlog(blogInfo)).rejects.toThrow(error);
    });

    test('이미 해당 URL을 가지고 있으면 saveBlog 함수가 reject를 리턴한다.', () => {
        // Given
        let error = new DuplicatedBlogUrlExistsError();
        mockingoose(Blog)
            .toReturn(savedBlogInfo, 'findOne')
            .reset('save');

        // When & Then
        return expect(BlogService.saveBlog(blogInfo)).rejects.toThrow(error);
    });

    test('Blog Save 함수에서 에러 발생시 saveBlog 함수가 reject를 리턴한다.', () => {
        // Given
        let error = new DatabaseError(new Error("Database Error"));
        mockingoose(Blog)
            .toReturn(error, 'save')
            .toReturn(null, 'findOne');

        // When & Then
        return expect(BlogService.saveBlog(blogInfo)).rejects.toThrow(error);
    });

    test('saveBlog 함수를 성공한다.', async () => {
        // Given
        mockingoose(Blog)
            .toReturn(null, 'findOne')
            .toReturn(savedBlogInfo, 'save');

        // When
        let result = await BlogService.saveBlog(blogInfo);

        // Then
        expect(copy(result)).toMatchObject(savedBlogInfo);
    });
});