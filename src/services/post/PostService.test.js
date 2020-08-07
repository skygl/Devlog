import {copy} from '../../utils/Utils';
import PostService from './PostService';
import mockingoose from "mockingoose";
import '@babel/polyfill';
import {DatabaseError, DuplicatedPostUrlExistsError} from "../error/error";
import Post from '../../models/Post';

const postInfo = {
    url: "https://velog.io/@skygl/node-js",
    title: "Devlog Title",
    description: "Devlog Description",
    imageUrl: "https://techcourse.woowahan.com/images/logo/logo_full_dark.png",
    tags: ['nodejs', 'javascript'],
    score: 9,
    published_at: new Date("2020-07-09 11:22:33:444"),
};

let error = new Error("Database Error Occurs.");
let databaseError = new DatabaseError(error);

const savedPost = {...postInfo};
savedPost._id = "54759eb3c090d83494e2d804";

describe('savePost', () => {
    test('Post의 findOne 함수가 에러를 발생시키면 savePost 함수가 에러를 발생시킨다.', async () => {
        // Given
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

        console.log(post);
        console.log(savedPost);

        // Then
        expect(post).toMatchObject(savedPost);
    });
});

describe('getList', () => {
    test('Post의 aggregate 함수가 에러를 발생시키면 getList 함수가 에러를 발생시킨다.', async () => {
        // Given
        mockingoose(Post)
            .toReturn(error, 'aggregate');

        // When & Then
        return expect(PostService.getList({start: 0, end: 20, order: 'ASC', sort: 'id'}))
            .rejects.toThrow(databaseError);
    });

    test('Post의 aggregate 결과에 해당하는 post가 존재하지 않는 경우 getList 함수를 성공한다.', async () => {
        // Given
        const countError = new Error(`Cannot read property 'count' of undefined`);
        mockingoose(Post)
            .toReturn(countError, 'aggregate');

        // When
        let result = await PostService.getList({start: 0, end: 20, order: 'ASC', sort: 'id'});

        // Then
        expect(copy(result)).toMatchObject({data: [], count: 0});
    });


    test('Post의 aggregate 결과에 해당하는 post가 존재하는 경우 getList 함수를 성공한다.', async () => {
        // Given
        const data = [
            {
                data: [
                    savedPost
                ],
                count: [
                    {
                        count: 1,
                    }
                ]
            }
        ];
        mockingoose(Post)
            .toReturn(data, 'aggregate');

        // When
        let result = await PostService.getList({start: 0, end: 20, order: 'ASC', sort: 'id'});

        // Then
        expect(result).toMatchObject({data: [savedPost], count: 1});
    });
});

describe('getOne', () => {
    test('Post의 findOne 함수가 에러를 발생시키면 getOne 함수가 에러를 발생시킨다.', async () => {
        // Given
        mockingoose(Post)
            .toReturn(error, 'findOne');

        // When & Then
        return expect(PostService.getOne({id: savedPost._id})).rejects.toThrow(databaseError);
    });

    test('요청받은 id를 가진 Post가 없는 경우 exists false를 반환한다.', async () => {
        // Given
        mockingoose(Post)
            .toReturn(null, 'findOne');

        // When
        let result = await PostService.getOne({id: savedPost._id});

        // Then
        expect(copy(result)).toMatchObject({exists: false});
    });

    test('요청받은 id를 가진 Post가 있는 경우 exists true와 해당 post를 반환한다.', async () => {
        // Given
        mockingoose(Post)
            .toReturn(savedPost, 'findOne');

        // When
        let result = await PostService.getOne({id: savedPost._id});

        // Then
        expect(result).toMatchObject({exists: true, post: savedPost});
    });
});

describe('update', () => {
    test('Post의 findOneAndUpdate 함수가 에러를 발생시키면 update 함수가 에러를 발생시킨다.', async () => {
        // Given
        mockingoose(Post)
            .toReturn(error, "findOneAndUpdate");

        // When & Then
        return expect(PostService.update({id: savedPost._id, score: 8})).rejects.toThrow(databaseError);
    });

    test('Post의 findOneAndUpdate 함수에 입력한 id를 가진 post가 없는 경우 update 함수가 성공한다.', async () => {
        // Given
        mockingoose(Post)
            .toReturn(null, "findOneAndUpdate");

        // When
        const result = await PostService.update({id: savedPost._id, score: 8});

        // Then
        expect(copy(result)).toMatchObject({exists: false});
    });

    test('Post의 findOne 함수가 에러를 발생시키면 update 함수가 에러를 발생시킨다.', async () => {
        // Given
        mockingoose(Post)
            .toReturn({...savedPost, score: 8}, "findOneAndUpdate")
            .toReturn(error, "findOne");

        // When & Then
        return expect(PostService.update({id: savedPost._id, score: 8})).rejects.toThrow(databaseError);
    });

    test('Post의 findOne 함수에 입력한 id를 가진 post가 없는 경우 update 함수가 성공한다.', async () => {
        // Given
        mockingoose(Post)
            .toReturn({...savedPost, score: 8}, "findOneAndUpdate")
            .toReturn(null, "findOne");

        // When
        const result = await PostService.update({id: savedPost._id, score: 8});

        // Then
        expect(copy(result)).toMatchObject({exists: false});
    });


    test('Post의 findOne 함수에 입력한 id를 가진 post가 있는 경우 update 함수가 성공한다.', async () => {
        // Given
        mockingoose(Post)
            .toReturn(savedPost, "findOneAndUpdate")
            .toReturn({...savedPost, score: 8}, "findOne");

        // When
        const result = await PostService.update({id: savedPost._id, score: 8});

        // Then
        expect(result).toMatchObject({
            exists: true,
            id: savedPost._id,
            previousData: savedPost,
            data: {...savedPost, score: 8}
        });
    });
});

describe('deletePost', () => {
    test('Post의 findOneAndDelete 함수가 에러를 발생시키면 deletePost 함수가 에러를 발생시킨다.', async () => {
        // Given
        mockingoose(Post)
            .toReturn(error, "findOneAndDelete");

        // When & Then
        return expect(PostService.delete({id: savedPost._id})).rejects.toThrow(databaseError);
    });

    test('요청받은 id를 가진 Post가 없는 경우 exists false를 반환한다.', async () => {
        // Given
        mockingoose(Post)
            .toReturn(null, 'findOneAndDelete');

        // When
        let result = await PostService.delete({id: savedPost._id});

        // Then
        expect(result).toMatchObject({exists: false});
    });

    test('요청받은 id를 가진 Post가 있는 경우 exists true와 삭제된 Post를 반환한다.', async () => {
        // Given
        mockingoose(Post)
            .toReturn(savedPost, 'findOneAndDelete');

        // When
        let result = await PostService.delete({id: savedPost._id});

        // Then
        expect(result).toMatchObject({exists: true, ...savedPost});
    });
});