# Devlog API Server

<br>

메타 블로그 서비스 Devlog의 API Server 깃허브입니다.

[Devlog 웹사이트](https://devlog.today)

<br>
<br>

# Tech Stack
<br>

## Platform

- [Node.js](https://github.com/nodejs/node)

## Framework

- [Express](https://expressjs.com/)

## Database

- [mongoDB](https://www.mongodb.com/)

## Middleware

- [express-validator](https://express-validator.github.io/docs/) : 입력 데이터의 유효성 검사를 위한 미들웨어

## Library

- [axios](https://github.com/axios/axios) : HTTP 통신을 위한 라이브러리
- [cheerio](https://github.com/cheeriojs/cheerio) : 웹 페이지를 스크래핑하기 위한 라이브러리
- [jest](https://jestjs.io/) : 자바스크립트 테스팅 라이브러리
- [mongoose](https://mongoosejs.com/) : mongoDB ODM 라이브러리
- [moment](https://momentjs.com/) : 시간 데이터를 편하게 다루기 위해 사용하는 라이브러리
- [winston](https://github.com/winstonjs/winston) : 로그를 위한 라이브러리
- [node-cron](https://github.com/node-cron/node-cron) : crontab을 기반으로 한 자바스크립트 스케쥴러
- [parse-numeric-range](https://github.com/euank/node-parse-numeric-range) : 숫자 및 범위 표현을 파싱하는 라이브러리
- [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) : 어드민(현재) 및 유저(구현 예정) 인증, 인가에 쓰이는 라이브러리
<br>
<br>

# Scheme

<br>

## Blog

|Name|Type|Description|
|----|----|-------|
|url|String|블로그의 URL|
|feed.url|String|블로그 피드의 URL|
|feed.tag|String|글에서 태그 정보를 가진 Selector|
|created_at|Date|블로그 정보가 등록된 날짜|
|updated_at|Date|블로그 정보가 수정된 날짜|

<br>

## BlogReq

|Name|Type|Description|
|----|----|-------|
|url	|String	|블로그의 URL|
|status	|String	|블로그 요청의 처리 상태 (Unhandled, Denied, Suspended, Registered)|
|reason	|String	|status(Denied, Suspended)에 대한 이유|
|created_at	|Date	|블로그 요청 정보가 등록된 날짜|
|updated_at	|Date	|블로그 요청 정보가 수정된 날짜|
<br>

## Post

|Name|Type|Description|
|----|----|-------|
|url	|String|	글의 URL
|title	|String	|글의 제목
|description	|String	|글의 세부 정보
|imageUrl	|String	|글의 대표 이미지 URL
|tags	|[ String ]	|글의 태그 정보
|score	|Number	|점수 ( 1 ~ 10 )
|published_at	|Date	|글이 블로그에 올라온 날짜
|created_at	|Date	|글 정보가 등록된 날짜

<br>
<br>

# API Specification

<br>

[Gitbook Link](https://skygl.gitbook.io/devlog/)

<br>
<br>

# Middleware Flow

<br>

![flow](https://user-images.githubusercontent.com/26167700/88250915-124f0600-cce4-11ea-945a-8c4c901f9f97.png)



