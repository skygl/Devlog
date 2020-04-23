import BlogReq from '../../models/BlogReq';
import BlogReqService from "./BlogReqService";
import BlogService from "../blog/BlogService";
import mockingoose from "mockingoose";
import {copy} from '../../utils/Utils';
import '@babel/polyfill';
import {BlogReqAlreadyProcessedError, ExistsUrlError, NotExistsUnprocessedBlogReqError} from "./error/error";
import {DatabaseError} from "../error/error";
import {DuplicatedBlogUrlExistsError} from "../blog/error/error";

const blogInfo = {
    url: "https://velog.io/@skygl",
};

const savedBlogReq = {
    _id: "4e3444818cde747f02000001",
    url: "https://velog.io/@skygl",
    processed: false,
    accepted: false,
    created_at: new Date(2020, 4, 22).toISOString()
};

const acceptedSavedBlogReq = {
    _id: "4e3444818cde747f02000001",
    url: "https://velog.io/@skygl",
    processed: true,
    accepted: true,
    created_at: new Date(2020, 4, 22).toISOString()
};

const rejectedSavedBlogReq = {
    _id: "4e3444818cde747f02000001",
    url: "https://velog.io/@skygl",
    processed: true,
    accepted: false,
    created_at: new Date(2020, 4, 22).toISOString()
};

const blogReqInfo = {
    _id: "4e3444818cde747f02000001",
    url: 'https://velog.io/@skygl',
    feed: {
        url: 'https://v2.velog.io/rss/skygl',
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

const savedBlog = copy(blogReqInfo);
savedBlog["_id"] = '4e3444818cde747f02000002';
savedBlog["created_at"] = new Date().toISOString();
savedBlog["updated_at"] = new Date().toISOString();

describe('createBlogReq', () => {
    test('existsUrl 함수가 에러를 발생시키면 createBlogReq 함수가 에러를 발생시킨다.', async () => {
        // Given
        let error = new Error("Database Error Occurs.");
        let databaseError = new DatabaseError(error);
        BlogService.existsUrl = jest.fn(async () => new Promise(resolve => resolve(false)));
        mockingoose(BlogReq)
            .toReturn(error, 'findOne');

        // When & Then
        return expect(BlogReqService.createBlogReq(blogInfo)).rejects.toThrow(databaseError);
    });

    test('이미 BlogReq에 URL이 존재하면 createBlogReq 함수가 에러를 발생시킨다.', async () => {
        // Given
        let error = new ExistsUrlError("There is a Existed BlogRequest Having Request Url.", blogInfo.url);
        BlogService.existsUrl = jest.fn(async () => new Promise(resolve => resolve(false)));
        mockingoose(BlogReq)
            .toReturn(savedBlogReq, 'findOne');

        // When & Then
        return expect(BlogReqService.createBlogReq(blogInfo)).rejects.toThrow(error);
    });

    test('BlogService의 ExistsUrl 함수가 에러를 발생시키면 createBlogReq 함수가 에러를 발생시킨다.', async () => {
        // Given
        let error = new Error("Database Error Occurs.");
        let databaseError = new DatabaseError(error);
        BlogService.existsUrl = jest.fn(async () => new Promise((resolve, reject) => reject(databaseError)));

        // When & Then
        return expect(BlogReqService.createBlogReq(blogInfo)).rejects.toThrow(databaseError);
    });

    test('이미 블로그에 요청받은 URL이 존재하면 createBlogReq 함수가 에러를 발생시킨다.', async () => {
        // Given
        let error = new ExistsUrlError("There is a Existed Blog Having Request Url.", blogInfo.url);
        BlogService.existsUrl = jest.fn(async () => new Promise(resolve => resolve(true)));

        // When & Then
        return expect(BlogReqService.createBlogReq(blogInfo)).rejects.toThrow(error);
    });

    test('BlogRequest의 save 함수가 에러를 발생시키면 createBlogReq 함수가 에러를 발생시킨다.', async () => {
        // Given
        let error = new Error("Database Error Occurs.");
        let databaseError = new DatabaseError(error);
        BlogService.existsUrl = jest.fn(async () => new Promise(resolve => resolve(false)));
        mockingoose(BlogReq)
            .toReturn(null, 'findOne')
            .toReturn(error, 'save');

        // When & Then
        return expect(BlogReqService.createBlogReq(blogInfo)).rejects.toThrow(databaseError);
    });

    test('createBlogReq 함수를 성공한다.', async () => {
        // Given
        BlogService.existsUrl = jest.fn(async () => new Promise(resolve => resolve(false)));
        mockingoose(BlogReq)
            .toReturn(null, 'findOne')
            .toReturn(savedBlogReq, 'save');

        // When
        let result = await BlogReqService.createBlogReq(blogInfo);

        // Then
        expect(copy(result)).toMatchObject(savedBlogReq);
    });
});

describe('findUnprocessedBlogReq', () => {
    test('처리되지 않은 BlogReq 가 없는 경우 findUnprocessedBlogReq 함수가 에러를 발생시킨다.', async () => {
        // Given
        let error = new NotExistsUnprocessedBlogReqError();
        mockingoose(BlogReq)
            .toReturn(null, 'findOne');

        // When & Then
        return expect(BlogReqService.findUnprocessedBlogReq()).rejects.toThrow(error);
    });

    test('BlogReq의 findOne 함수가 에러를 발생시키면 findUnprocessedBlogReq 함수가 에러를 발생시킨다.', async () => {
        // Given
        let error = new Error("Database Error Occurs.");
        let databaseError = new DatabaseError(error);
        mockingoose(BlogReq)
            .toReturn(error, 'findOne');

        // When & Then
        return expect(BlogReqService.findUnprocessedBlogReq()).rejects.toThrow(databaseError);
    });

    test('findUnprocessedBlogReq 함수를 성공한다.', async () => {
        // Given
        mockingoose(BlogReq)
            .toReturn(savedBlogReq, 'findOne');

        // When
        let result = await BlogReqService.findUnprocessedBlogReq();

        // Then
        expect(copy(result)).toMatchObject({url: blogInfo.url, _id: savedBlogReq._id})
    });
});

describe('processUnprocessedBlogReq', () => {
    test('BlogReq의 findById 함수가 에러를 발생시키면 processUnprocessedBlogReq 함수가 에러를 발생시킨다.', async () => {
        // Given
        let error = new Error("Database Error Occurs.");
        let databaseError = new DatabaseError(error);
        const acceptBlogReqInfo = copy(blogReqInfo);
        acceptBlogReqInfo.accepted = true;
        mockingoose(BlogReq)
            .toReturn(error, 'findOne');

        // When & Then
        return expect(BlogReqService.processUnprocessedBlogReq(acceptBlogReqInfo)).rejects.toThrow(databaseError);
    });

    test('요청받은 BlogReq 의 Id가 존재하지 않으면 processUnprocessedBlogReq 함수가 에러를 발생시킨다.', async () => {
        // Given
        let error = new NotExistsUnprocessedBlogReqError();
        const acceptBlogReqInfo = copy(blogReqInfo);
        acceptBlogReqInfo.accepted = true;
        mockingoose(BlogReq)
            .toReturn(null, 'findOne');

        // When & Then
        return expect(BlogReqService.processUnprocessedBlogReq(acceptBlogReqInfo)).rejects.toThrow(error);
    });

    test('요청받은 BlogReq 가 이미 처리되었다면 processUnprocessedBlogReq 함수가 에러를 발생시킨다.', async () => {
        // Given
        let error = new BlogReqAlreadyProcessedError();
        const acceptBlogReqInfo = copy(blogReqInfo);
        acceptBlogReqInfo.accepted = true;
        mockingoose(BlogReq)
            .toReturn(acceptedSavedBlogReq, 'findOne');

        // When & Then
        return expect(BlogReqService.processUnprocessedBlogReq(acceptBlogReqInfo)).rejects.toThrow(error);
    });

    test('accept 될 BlogReq 의 findOneAndUpdate 함수가 에러를 발생시키면 processUnprocessedBlogReq 함수가 에러를 발생시킨다.', async () => {
        // Given
        let error = new Error("Database Error Occurs.");
        let databaseError = new DatabaseError(error);
        const acceptBlogReqInfo = copy(blogReqInfo);
        acceptBlogReqInfo.accepted = true;
        mockingoose(BlogReq)
            .toReturn(savedBlogReq, 'findOne')
            .toReturn(error, "findOneAndUpdate");

        // When & Then
        return expect(BlogReqService.processUnprocessedBlogReq(acceptBlogReqInfo)).rejects.toThrow(databaseError);
    });

    test('accept 될 BlogReq 의 URL이 이미 존재한다면 processUnprocessedBlogReq 함수가 에러를 발생시킨다.', async () => {
        // Given
        let error = new DuplicatedBlogUrlExistsError();
        const acceptBlogReqInfo = copy(blogReqInfo);
        acceptBlogReqInfo.accepted = true;
        BlogService.saveBlog = jest.fn(async () => new Promise(() => {
            throw error;
        }));
        mockingoose(BlogReq)
            .toReturn(savedBlogReq, 'findOne')
            .toReturn(acceptedSavedBlogReq, "findOneAndUpdate");

        // When & Then
        return expect(BlogReqService.processUnprocessedBlogReq(acceptBlogReqInfo)).rejects.toThrow(error);
    });

    test('Blog의 saveBlog 함수가 DatabaseError를 발생시키면 processUnprocessedBlogReq 함수가 에러를 발생시킨다.', async () => {
        // Given
        let error = new Error("Database Error Occurs.");
        let databaseError = new DatabaseError(error);
        const acceptBlogReqInfo = copy(blogReqInfo);
        acceptBlogReqInfo.accepted = true;
        BlogService.saveBlog = jest.fn(async () => new Promise(() => {
            throw databaseError;
        }));
        mockingoose(BlogReq)
            .toReturn(savedBlogReq, 'findOne')
            .toReturn(acceptedSavedBlogReq, "findOneAndUpdate");

        // When & Then
        return expect(BlogReqService.processUnprocessedBlogReq(acceptBlogReqInfo)).rejects.toThrow(databaseError);
    });

    test('accept 될 BlogReq 인 경우 processUnprocessedBlogReq 함수가 성공한다.', async () => {
        // Given
        const acceptBlogReqInfo = copy(blogReqInfo);
        acceptBlogReqInfo.accepted = true;
        BlogService.saveBlog = jest.fn(async () => new Promise((resolve) => {
            resolve(savedBlog);
        }));
        mockingoose(BlogReq)
            .toReturn(savedBlogReq, 'findOne')
            .toReturn(acceptedSavedBlogReq, "findOneAndUpdate");

        // When
        let result = await BlogReqService.processUnprocessedBlogReq(acceptBlogReqInfo);

        // Then
        expect(copy(result)).toMatchObject({
            blogReq: acceptedSavedBlogReq,
            blog: savedBlog
        });
    });

    test('reject 될 BlogReq 의 findOneAndUpdate 함수가 에러를 발생시키면 processUnprocessedBlogReq 함수가 에러를 발생시킨다.', async () => {
        // Given
        let error = new Error("Database Error Occurs.");
        let databaseError = new DatabaseError(error);
        const rejectedBlogReqInfo = copy(blogReqInfo);
        rejectedBlogReqInfo.accepted = true;
        mockingoose(BlogReq)
            .toReturn(savedBlogReq, 'findOne')
            .toReturn(error, "findOneAndUpdate");

        // When & Then
        return expect(BlogReqService.processUnprocessedBlogReq(rejectedBlogReqInfo)).rejects.toThrow(databaseError);
    });

    test('reject 될 BlogReq 인 경우 processUnprocessedBlogReq 함수가 성공한다.', async () => {
        // Given
        const rejectedBlogReqInfo = copy(blogReqInfo);
        rejectedBlogReqInfo.accepted = false;
        mockingoose(BlogReq)
            .toReturn(savedBlogReq, 'findOne')
            .toReturn(rejectedSavedBlogReq, "findOneAndUpdate");

        // When
        let result = await BlogReqService.processUnprocessedBlogReq(rejectedBlogReqInfo);

        // Then
        expect(copy(result)).toMatchObject({
            blogReq: rejectedSavedBlogReq,
        });
    });
});