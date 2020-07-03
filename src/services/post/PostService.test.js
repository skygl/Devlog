import {copy} from '../../utils/Utils';
import PostService from './PostService';
import mockingoose from "mockingoose";
import '@babel/polyfill';
import {DatabaseError, DuplicatedPostUrlExistsError} from "../error/error";
import Post from '../../models/Post';

const postInfo = {
    url: "https://velog.io/@skygl/node-js",
    tags: ['nodejs', 'javascript'],
    score: 9,
    published_at: new Date().toISOString(),
};

const savedPost = copy(postInfo);
savedPost._id = "54759eb3c090d83494e2d804";

const tagInfo = {
    tag: "javascript",
    page: 5
};

const savedPostsTop5Yesterday = [
    postInfo,
    {
        _id: "507f1f77bcf86cd799439011",
        url: "https://velog.io/@skygl/angular-js",
        tags: ['angularjs', 'javascript'],
        score: 9,
        published_at: new Date().toISOString(),
    },
    {
        _id: "507f1f77bcf86cd799439012",
        url: "https://velog.io/@kygls/springboot",
        tags: ['springboot', 'java', 'spring'],
        score: 8,
        published_at: new Date().toISOString(),
    },
    {
        _id: "507f1f77bcf86cd799439013",
        url: "https://velog.io/@yglsk/spring-batch",
        tags: ['spring', 'springbatch', 'java'],
        score: 8,
        published_at: new Date().toISOString(),
    },
    {
        _id: "507f1f77bcf86cd799439014",
        url: "https://velog.io/@glsky/tensorflow",
        tags: ['tensorflow', 'python', 'machinelearning'],
        score: 7,
        published_at: new Date().toISOString(),
    }
];

describe('savePost', () => {
    test('Post의 findOne 함수가 에러를 발생시키면 savePost 함수가 에러를 발생시킨다.', async () => {
        // Given
        let error = new Error("Database Error Occurs.");
        let databaseError = new DatabaseError(error);
        mockingoose(Post)
            .toReturn(error, 'findOne');

        // When & Then
        return expect(PostService.savePost(postInfo)).rejects.toThrow(databaseError);
    });

    test('이미 존재하는 Post Url 인 경우 savePost 함수가 에러를 발생시킨다.', async () => {
        // Given
        let error = new DuplicatedPostUrlExistsError();
        mockingoose(Post)
            .toReturn(savedPost, 'findOne');

        // When & Then
        return expect(PostService.savePost(postInfo)).rejects.toThrow(error);
    });

    test('Post의 save 함수가 에러를 발생시키면 savePost 함수가 에러를 발생시킨다.', async () => {
        // Given
        let error = new Error("Database Error Occurs.");
        let databaseError = new DatabaseError(error);
        mockingoose(Post)
            .toReturn(null, 'findOne')
            .toReturn(error, 'save');

        // When & Then
        return expect(PostService.savePost(postInfo)).rejects.toThrow(databaseError);
    });

    test('savePost 함수를 성공한다.', async () => {
        // Given
        mockingoose(Post)
            .toReturn(null, 'findOne')
            .toReturn(savedPost, 'save');

        // When
        let post = await PostService.savePost(postInfo);

        // Then
        expect(copy(post)).toMatchObject(savedPost);
    });
});

describe('findTop5PostsPublishedYesterday', () => {
    test('Post의 find 함수가 에러를 발생시키면 findTop5PostsPublishedYesterday 함수가 에러를 발생시킨다.', async () => {
        // Given
        let error = new Error("Database Error Occurs.");
        let databaseError = new DatabaseError(error);
        mockingoose(Post)
            .toReturn(error, 'find');

        // When & Then
        return expect(PostService.findTop5PostsPublishedYesterday(tagInfo)).rejects.toThrow(databaseError);
    });

    test('findTop5PostsPublishedYesterday 함수를 성공한다.', async () => {
        // Given
        mockingoose(Post)
            .toReturn(savedPostsTop5Yesterday, 'find');

        // When
        let posts = await PostService.findTop5PostsPublishedYesterday();

        // Then
        expect(copy(posts)).toMatchObject(savedPostsTop5Yesterday);
    });
});