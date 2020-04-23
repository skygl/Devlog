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

const savedPostsHavingJavascriptTag = [
    savedPost,
    {
        _id: "507f1f77bcf86cd799439011",
        url: "https://velog.io/@skygl/angular-js",
        tags: ['angularjs', 'javascript'],
        score: 8,
        published_at: new Date(2019, 12, 21, 18, 0, 2).toISOString(),
    },
    {
        _id: "507f191e810c19729de860ea",
        url: "https://velog.io/@skygl/vue-js",
        tags: ['vuejs', 'javascript'],
        score: 7,
        published_at: new Date(2019, 11, 17, 15, 20, 35).toISOString(),
    },
    {
        _id: "507f191e810c19729de860eb",
        url: "https://velog.io/@skygl/react-js",
        tags: ['reactjs', 'javascript'],
        score: 7,
        published_at: new Date(2020, 1, 24, 21, 17, 55).toISOString(),
    },
    {
        _id: "507f191e810c19729de860ec",
        url: "https://velog.io/@skygl/typescript",
        tags: ['typescript', 'javascript'],
        score: 6,
        published_at: new Date(2019, 10, 5, 12, 2, 14).toISOString(),
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

describe('findByTag', () => {
    test('Post의 find 함수가 에러를 발생시키면 findByTag 함수가 에러를 발생시킨다.', async () => {
        // Given
        let error = new Error("Database Error Occurs.");
        let databaseError = new DatabaseError(error);
        mockingoose(Post)
            .toReturn(error, 'find');

        // When & Then
        return expect(PostService.findByTag(tagInfo)).rejects.toThrow(databaseError);
    });

    test('findByTag 함수를 성공한다.', async () => {
        // Given
        mockingoose(Post)
            .toReturn(savedPostsHavingJavascriptTag, 'find');

        // When
        let posts = await PostService.findByTag(tagInfo);

        // Then
        expect(copy(posts)).toMatchObject(savedPostsHavingJavascriptTag);
    });
});