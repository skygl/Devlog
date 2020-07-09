import Blog from '../../models/Blog';
import BlogService from "./BlogService";
import {DatabaseError} from "../error/error";
import {DuplicatedBlogUrlExistsError} from "./error/error";
import {copy} from '../../utils/Utils';
import mockingoose from "mockingoose";
import '@babel/polyfill';

const blogInfo = {
    url: 'https://velog.io/',
    feed: {
        url: 'https://v2.velog.io/rss/',
        tag: '.head-wrapper > div > a'
    }
};

const savedBlog = {...blogInfo};
savedBlog["_id"] = '4e3444818cde747f02000001';
savedBlog["updated_at"] = new Date("2020-07-09 11:22:33:444");
savedBlog["created_at"] = new Date("2020-07-09 11:22:33:444");

const error = new Error("Database Error Occurs");
const databaseError = new DatabaseError(error);

describe('saveBlog', () => {
    test('exitsUrl 함수에서 에러 발생시 saveBlog 함수가 reject를 리턴한다.', () => {
        // Given
        mockingoose(Blog)
            .toReturn(error, 'findOne');

        // When & Then
        return expect(BlogService.saveBlog(blogInfo)).rejects.toThrow(databaseError);
    });

    test('이미 해당 URL을 가지고 있으면 saveBlog 함수가 reject를 리턴한다.', () => {
        // Given
        const duplicatedError = new DuplicatedBlogUrlExistsError();
        mockingoose(Blog)
            .toReturn(savedBlog, 'findOne');

        // When & Then
        return expect(BlogService.saveBlog(blogInfo)).rejects.toThrow(duplicatedError);
    });

    test('Blog Save 함수에서 에러 발생시 saveBlog 함수가 reject를 리턴한다.', () => {
        // Given
        mockingoose(Blog)
            .toReturn(error, 'save')
            .toReturn(null, 'findOne');

        // When & Then
        return expect(BlogService.saveBlog(blogInfo)).rejects.toThrow(databaseError);
    });

    test('saveBlog 함수를 성공한다.', async () => {
        // Given
        mockingoose(Blog)
            .toReturn(null, 'findOne')
            .toReturn(savedBlog, 'save');

        // When
        let result = await BlogService.saveBlog(blogInfo);

        // Then
        expect(result).toMatchObject(savedBlog);
    });
});

describe('existsUrl', () => {
    test('Blog의 findOne 함수에서 에러 발생시 existsUrl 함수가 reject를 리턴한다.', async () => {
        // Given
        mockingoose(Blog)
            .toReturn(error, 'findOne');

        // When & Then
        return expect(BlogService.existsUrl(blogInfo.url)).rejects.toThrow(databaseError);
    });

    test('이미 해당 URL을 가진 블로그가 있으면 existsUrl 함수가 true를 리턴한다.', async () => {
        // Given
        mockingoose(Blog)
            .toReturn(savedBlog, 'findOne');

        // When
        let result = await BlogService.existsUrl(blogInfo.url);

        // Then
        expect(result).toBeTruthy();
    });

    test('해당 URL을 가진 블로그가 없으면 existsUrl 함수가 false를 리턴한다.', async () => {
        // Given
        mockingoose(Blog)
            .toReturn(null, 'findOne');

        // When
        let result = await BlogService.existsUrl(blogInfo.url);

        // Then
        expect(result).toBeFalsy();
    });
});

describe('getList', () => {
    test('Blog의 aggregate 함수가 에러를 발생시키면 getList 함수가 에러를 발생시킨다.', async () => {
        // Given
        mockingoose(Blog)
            .toReturn(error, 'aggregate');

        // When & Then
        return expect(BlogService.getList({start: 0, end: 20, order: 'ASC', sort: 'id'}))
            .rejects.toThrow(databaseError);
    });

    test('Blog의 aggregate 결과에 해당하는 블로그가 존재하지 않는 경우 getList 함수를 성공한다.', async () => {
        // Given
        const countError = new Error(`Cannot read property 'count' of undefined`);
        mockingoose(Blog)
            .toReturn(countError, 'aggregate');

        // When
        let result = await BlogService.getList({start: 0, end: 20, order: 'ASC', sort: 'id'});

        // Then
        expect(result).toMatchObject({data: [], count: 0});
    });


    test('Blog의 aggregate 결과에 해당하는 블로그가 존재하는 경우 getList 함수를 성공한다.', async () => {
        // Given
        const data = [
            {
                data: [
                    savedBlog
                ],
                count: [
                    {
                        count: 1,
                    }
                ]
            }
        ];
        mockingoose(Blog)
            .toReturn(data, 'aggregate');

        // When
        let result = await BlogService.getList({start: 0, end: 20, order: 'ASC', sort: 'id'});

        // Then
        expect({...result}).toMatchObject({data: [savedBlog], count: 1});
    });
});

describe('getOne', () => {
    test('Blog의 findOne 함수가 에러를 발생시키면 getOne 함수가 에러를 발생시킨다.', async () => {
        // Given
        mockingoose(Blog)
            .toReturn(error, 'findOne');

        // When & Then
        return expect(BlogService.getOne({id: savedBlog._id})).rejects.toThrow(databaseError);
    });

    test('요청받은 id를 가진 블로그가 없는 경우 exists false를 반환한다.', async () => {
        // Given
        mockingoose(Blog)
            .toReturn(null, 'findOne');

        // When
        let result = await BlogService.getOne({id: savedBlog._id});

        // Then
        expect(copy(result)).toMatchObject({exists: false});
    });

    test('요청받은 id를 가진 블로그가 있는 경우 exists true와 해당 블로그를 반환한다.', async () => {
        // Given
        mockingoose(Blog)
            .toReturn(savedBlog, 'findOne');

        // When
        let result = await BlogService.getOne({id: savedBlog._id});

        // Then
        expect(result).toMatchObject({exists: true, blog: savedBlog});
    });
});

describe('update', () => {
    const willUpdateBlog = {...savedBlog};
    willUpdateBlog.updated_at = new Date("2020-07-10 11:22:33:444");
    willUpdateBlog.feed.tag = ".tag";

    const updateInfo = {
        _id: savedBlog._id,
        url: savedBlog.url,
        feed: {
            url: savedBlog.feed.url,
            tag: willUpdateBlog.feed.tag,
        },
    };

    test('Blog의 findOneAndUpdate 함수가 에러를 발생시키면 update 함수가 에러를 발생시킨다.', async () => {
        // Given
        mockingoose(Blog)
            .toReturn(error, "findOneAndUpdate");

        // When & Then
        return expect(BlogService.update({data: updateInfo})).rejects.toThrow(databaseError);
    });

    test('Blog의 findOneAndUpdate 함수에 입력한 id를 가진 blog가 없는 경우 update 함수가 성공한다.', async () => {
        // Given
        mockingoose(Blog)
            .toReturn(null, "findOneAndUpdate");

        // When
        const result = await BlogService.update({data: updateInfo});

        // Then
        expect(result).toMatchObject({exists: false});
    });

    test('Blog의 findOne 함수가 에러를 발생시키면 update 함수가 에러를 발생시킨다.', async () => {
        // Given
        mockingoose(Blog)
            .toReturn(savedBlog, "findOneAndUpdate")
            .toReturn(error, "findOne");

        // When & Then
        return expect(BlogService.update({data: updateInfo})).rejects.toThrow(databaseError);
    });

    test('Blog의 findOne 함수에 입력한 id를 가진 blog가 없는 경우 update 함수가 성공한다.', async () => {
        // Given
        mockingoose(Blog)
            .toReturn(savedBlog, "findOneAndUpdate")
            .toReturn(null, "findOne");

        // When
        const result = await BlogService.update({data: updateInfo});

        // Then
        expect(result).toMatchObject({exists: false});
    });


    test('Blog의 findOne 함수에 입력한 id를 가진 blog가 있는 경우 update 함수가 성공한다.', async () => {
        // Given
        mockingoose(Blog)
            .toReturn(savedBlog, "findOneAndUpdate")
            .toReturn(willUpdateBlog, "findOne");

        // When
        const result = await BlogService.update({data: updateInfo});

        // Then
        expect(result).toMatchObject({
            exists: true,
            id: savedBlog._id,
            previousData: savedBlog,
            data: willUpdateBlog
        });
    });
});

describe('deleteBlog', () => {
    test('Blog의 findOneAndDelete 함수가 에러를 발생시키면 deleteBlog 함수가 에러를 발생시킨다.', async () => {
        // Given
        mockingoose(Blog)
            .toReturn(error, "findOneAndDelete");

        // When & Then
        return expect(BlogService.delete({id: savedBlog._id})).rejects.toThrow(databaseError);
    });

    test('요청받은 id를 가진 블로그가 없는 경우 exists false를 반환한다.', async () => {
        // Given
        mockingoose(Blog)
            .toReturn(null, 'findOneAndDelete');

        // When
        let result = await BlogService.delete({id: savedBlog._id});

        // Then
        expect(result).toMatchObject({exists: false});
    });

    test('요청받은 id를 가진 블로그가 있는 경우 exists true와 삭제된 블로그를 반환한다.', async () => {
        // Given
        mockingoose(Blog)
            .toReturn(savedBlog, 'findOneAndDelete');

        // When
        let result = await BlogService.delete({id: savedBlog._id});

        // Then
        expect(result).toMatchObject({exists: true, ...savedBlog});
    });
});