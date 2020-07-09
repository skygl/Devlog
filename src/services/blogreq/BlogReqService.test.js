import BlogReq from '../../models/BlogReq';
import BlogReqService from "./BlogReqService";
import BlogService from "../blog/BlogService";
import mockingoose from "mockingoose";
import {copy} from '../../utils/Utils';
import '@babel/polyfill';
import {ExistsUrlError} from "./error/error";
import {DatabaseError} from "../error/error";
import blogreq from "../../api/blogreq";
import {DuplicatedBlogUrlExistsError} from "../blog/error/error";

const UNHANDLED = "Unhandled";
const SUSPENDED = "Suspended";
const REGISTERED = "Registered";

const blogInfo = {
    url: "https://velog.io/@skygl",
};

const savedBlogReq = {
    _id: "54759eb3c090d83494e2d804",
    url: "https://velog.io/@skygl",
    status: UNHANDLED,
    created_at: new Date("2020-07-09 11:22:33:444"),
    updated_at: new Date("2020-07-09 11:22:33:444"),
};

let error = new Error("Database Error Occurs.");
let databaseError = new DatabaseError(error);

describe('createBlogReq', () => {
    test('BlogService의 existsUrl 함수가 에러를 발생시키면 createBlogReq 함수가 에러를 발생시킨다.', async () => {
        // Given
        BlogService.existsUrl = jest.fn(async () => new Promise(() => {
            throw databaseError
        }));

        // When & Then
        return expect(BlogReqService.createBlogReq(blogInfo)).rejects.toThrow(databaseError);
    });

    test('이미 Blog에 입력받은 URL을 가진 블로그가 있는 경우 createBlogReq 함수가 에러를 발생시킨다.', async () => {
        // Given
        let existsUrlError = new ExistsUrlError("There is a Existed Blog Having Request Url.",
            blogInfo.url, "blog");
        BlogService.existsUrl = jest.fn(async () => new Promise((resolve) => {
            resolve(true)
        }));

        // When & Then
        return expect(BlogReqService.createBlogReq(blogInfo)).rejects.toThrow(existsUrlError);
    });

    test('BlogReq의 findOne 함수가 에러를 발생시키면 createBlogReq 함수가 에러를 발생시킨다.', async () => {
        // Given
        BlogService.existsUrl = jest.fn(async () => new Promise(resolve => resolve(false)));
        mockingoose(BlogReq)
            .toReturn(error, 'findOne');

        // When & Then
        return expect(BlogReqService.createBlogReq(blogInfo)).rejects.toThrow(databaseError);
    });

    test('이미 BlogReq에 URL이 존재하면 createBlogReq 함수가 에러를 발생시킨다.', async () => {
        // Given
        let existsUrlError = new ExistsUrlError("There is a Existed BlogRequest Having Request Url.",
            blogInfo.url, "blogreq");
        BlogService.existsUrl = jest.fn(async () => new Promise(resolve => resolve(false)));
        mockingoose(BlogReq)
            .toReturn(savedBlogReq, 'findOne');

        // When & Then
        return expect(BlogReqService.createBlogReq(blogInfo)).rejects.toThrow(existsUrlError);
    });

    test('BlogRequest의 save 함수가 에러를 발생시키면 createBlogReq 함수가 에러를 발생시킨다.', async () => {
        // Given
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
        let blogreq = await BlogReqService.createBlogReq(blogInfo);

        // Then
        expect(blogreq).toMatchObject(savedBlogReq);
    });
});


describe('getList', () => {
    test('BlogReq의 aggregate 함수가 에러를 발생시키면 getList 함수가 에러를 발생시킨다.', async () => {
        // Given
        mockingoose(BlogReq)
            .toReturn(error, 'aggregate');

        // When & Then
        return expect(BlogReqService.getList({start: 0, end: 20, order: 'ASC', sort: 'id'}))
            .rejects.toThrow(databaseError);
    });

    test('BlogReq의 aggregate 결과에 해당하는 블로그 요청이 존재하지 않는 경우 getList 함수를 성공한다.', async () => {
        // Given
        const countError = new Error(`Cannot read property 'count' of undefined`);
        mockingoose(BlogReq)
            .toReturn(countError, 'aggregate');

        // When
        let result = await BlogReqService.getList({start: 0, end: 20, order: 'ASC', sort: 'id'});

        // Then
        expect(copy(result)).toMatchObject({data: [], count: 0});
    });


    test('BlogReq의 aggregate 결과에 해당하는 블로그 요청이 존재하는 경우 getList 함수를 성공한다.', async () => {
        // Given
        const data = [
            {
                data: [
                    savedBlogReq
                ],
                count: [
                    {
                        count: 1,
                    }
                ]
            }
        ];
        mockingoose(BlogReq)
            .toReturn(data, 'aggregate');

        // When
        let result = await BlogReqService.getList({start: 0, end: 20, order: 'ASC', sort: 'id'});

        // Then
        expect({...result}).toMatchObject({data: [savedBlogReq], count: 1});
    });
});

describe('existsUrl', () => {
    test('BlogService의 existsUrl 함수가 에러를 발생시키면 existsUrl 함수가 에러를 발생시킨다.', async () => {
        // Given
        BlogService.existsUrl = jest.fn(async () => new Promise(() => {
            throw databaseError
        }));

        // When & Then
        return expect(BlogReqService.existsUrl(blogInfo.url)).rejects.toThrow(databaseError);
    });

    test('이미 Blog에 입력받은 URL을 가진 블로그가 있는 경우 existsUrl이 성공한다.', async () => {
        // Given
        BlogService.existsUrl = jest.fn(async () => new Promise((resolve) => {
            resolve(true)
        }));

        // When
        const result = await BlogReqService.existsUrl(blogInfo.url);

        // When & Then
        return expect(result).toMatchObject({
            exists: true,
            message: "There is a Existed Blog Having Request Url.",
            type: 'blog'
        });
    });

    test('BlogReq의 findOne 함수가 에러를 발생시키면 existsUrl 함수가 에러를 발생시킨다.', async () => {
        // Given
        BlogService.existsUrl = jest.fn(async () => new Promise((resolve) => {
            resolve(false)
        }));

        mockingoose(BlogReq)
            .toReturn(error, 'findOne');

        // When & Then
        return expect(BlogReqService.existsUrl(blogInfo.url)).rejects.toThrow(databaseError);
    });

    test('이미 BlogReq에 입력받은 URL을 가진 블로그 요청이 있는 경우 existsUrl이 성공한다.', async () => {
        // Given
        BlogService.existsUrl = jest.fn(async () => new Promise((resolve) => {
            resolve(false)
        }));
        mockingoose(BlogReq)
            .toReturn(savedBlogReq, 'findOne');

        // When
        const result = await BlogReqService.existsUrl(blogInfo.url);

        // When & Then
        return expect(result).toMatchObject({
            exists: true,
            message: "There is a Existed BlogRequest Having Request Url.",
            type: 'blogreq'
        });
    });

    test('이미 BlogReq에 입력받은 URL을 가진 블로그 요청이 없는 경우 existsUrl이 성공한다.', async () => {
        // Given
        BlogService.existsUrl = jest.fn(async () => new Promise((resolve) => {
            resolve(false)
        }));
        mockingoose(BlogReq)
            .toReturn(null, 'findOne');

        // When
        const result = await BlogReqService.existsUrl(blogInfo.url);

        // When & Then
        return expect(result).toMatchObject({exists: false});
    });
});


describe('getOne', () => {
    test('BlogReq의 findOne 함수가 에러를 발생시키면 getOne 함수가 에러를 발생시킨다.', async () => {
        // Given
        mockingoose(BlogReq)
            .toReturn(error, 'findOne');

        // When & Then
        return expect(BlogReqService.getOne({id: savedBlogReq._id})).rejects.toThrow(databaseError);
    });

    test('요청받은 id를 가진 블로그 요청이 없는 경우 exists false를 반환한다.', async () => {
        // Given
        mockingoose(BlogReq)
            .toReturn(null, 'findOne');

        // When
        let result = await BlogReqService.getOne({id: savedBlogReq._id});

        // Then
        expect(copy(result)).toMatchObject({exists: false});
    });

    test('요청받은 id를 가진 블로그 요청이 있는 경우 exists true와 해당 블로그 요청을 반환한다.', async () => {
        // Given
        mockingoose(BlogReq)
            .toReturn(savedBlogReq, 'findOne');

        // When
        let result = await BlogReqService.getOne({id: savedBlogReq._id});

        // Then
        expect(result).toMatchObject({exists: true, post: savedBlogReq});
    });
});

describe('update', () => {
    const willUpdateData = {...savedBlogReq, status: SUSPENDED};
    const willRegisterData = {
        ...savedBlogReq,
        status: REGISTERED,
        feed: {tag: 'tag', url: "https://v2.velog.io/rss/skygl"}
    };

    test('BlogReq의 findOneAndUpdate 함수가 에러를 발생시키면 update 함수가 에러를 발생시킨다.', async () => {
        // Given
        mockingoose(BlogReq)
            .toReturn(error, "findOneAndUpdate");

        // When & Then
        expect(BlogReqService.update({data: willUpdateData})).rejects.toThrow(databaseError);
    });

    test('입력받은 id를 가진 블로그 요청이 없으면 exists false를 리턴한다.', async () => {
        // Given
        mockingoose(BlogReq)
            .toReturn(null, "findOneAndUpdate");

        // When
        const result = await BlogReqService.update({data: willUpdateData});

        // Then
        expect(result).toMatchObject({exists: false});
    });

    test('수정 요청한 블로그 요청이 있고, 변경하려는 상태가 Registered가 아닌경우 exists false를 리턴한다.', async () => {
        // Given
        mockingoose(BlogReq)
            .toReturn(willUpdateData, "findOneAndUpdate");

        // When
        const result = await BlogReqService.update({data: willUpdateData});

        // Then
        expect(result).toMatchObject({exists: true});
    });

    test('BlogService가 DuplicatedUrlExistsError를 발생시키는 경우 update 함수가 에러를 발생시킨다.', async () => {
        const duplicatedError = new DuplicatedBlogUrlExistsError();
        BlogService.saveBlog = jest.fn(async () => new Promise(() => {
            throw duplicatedError;
        }));
        mockingoose(BlogReq)
            .toReturn(willRegisterData, "findOneAndUpdate");

        // When & Then
        expect(BlogReqService.update({data: willRegisterData})).rejects.toThrow(duplicatedError);
    });

    test('BlogService가 DatabaseError를 발생시키는 경우 update 함수가 에러를 발생시킨다.', async () => {
        // Given
        BlogService.saveBlog = jest.fn(async () => new Promise(() => {
            throw databaseError;
        }));
        mockingoose(BlogReq)
            .toReturn(willRegisterData, "findOneAndUpdate");

        // When & Then
        expect(BlogReqService.update({data: willRegisterData})).rejects.toThrow(databaseError);
    });

    test('Blog를 정상적으로 등록하는 경우 update 함수를 성공한다.', async () => {
        // When
        BlogService.saveBlog = jest.fn(async () => new Promise((resolve) => {
            resolve();
        }));
        mockingoose(BlogReq)
            .toReturn(savedBlogReq, "findOneAndUpdate");

        const result = await BlogReqService.update({data: willRegisterData});

        const copiedChangeData = {...savedBlogReq, status: REGISTERED};
        delete copiedChangeData.updated_at;

        delete result.data.updated_at;

        // Then
        expect(result).toMatchObject({
            exists: true,
            id: willRegisterData._id,
            previousData: savedBlogReq,
            data: copiedChangeData
        })
    })
});

describe('deleteBlogReq', () => {
    test('BlogReq의 findOneAndDelete 함수가 에러를 발생시키면 deleteBlogReq 함수가 에러를 발생시킨다.', async () => {
        // Given
        mockingoose(BlogReq)
            .toReturn(error, "findOneAndDelete");

        // When & Then
        return expect(BlogReqService.delete({id: savedBlogReq._id})).rejects.toThrow(databaseError);
    });

    test('요청받은 id를 가진 블로그 요청이 없는 경우 exists false를 반환한다.', async () => {
        // Given
        mockingoose(BlogReq)
            .toReturn(null, 'findOneAndDelete');

        // When
        let result = await BlogReqService.delete({id: savedBlogReq._id});

        // Then
        expect(result).toMatchObject({exists: false});
    });

    test('요청받은 id를 가진 블로그 요청이 있는 경우 exists true와 삭제된 블로그 요청을 반환한다.', async () => {
        // Given
        mockingoose(BlogReq)
            .toReturn(savedBlogReq, 'findOneAndDelete');

        // When
        let result = await BlogReqService.delete({id: savedBlogReq._id});

        // Then
        expect(result).toMatchObject({exists: true, ...savedBlogReq});
    });
});