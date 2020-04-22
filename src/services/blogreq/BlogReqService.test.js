import BlogReq from '../../models/BlogReq';
import BlogReqService from "./BlogReqService";
import BlogService from "../blog/BlogService";
import mockingoose from "mockingoose";
import {copy} from '../../utils/Utils';
import '@babel/polyfill';
import {ExistsUrlError} from "./error/error";
import {DatabaseError} from "../error/error";

const blogInfo = {
    url: "https://velog.io/@skygl",
};

const savedBlogReqInfo = {
    _id: "4e3444818cde747f02000001",
    url: "https://velog.io/@skygl",
    processed: false,
    accepted: false,
    created_at: new Date(2020, 4, 22).toISOString()
};

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
            .toReturn(savedBlogReqInfo, 'findOne');

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
            .toReturn(savedBlogReqInfo, 'save');

        // When
        let result = await BlogReqService.createBlogReq(blogInfo);

        // Then
        expect(copy(result)).toMatchObject(savedBlogReqInfo);
    });
});