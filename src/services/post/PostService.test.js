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