import './env';
import axios from "axios";
import NaverApiError from "./error/NaverApiError";

const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID;
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET;

const API_URL = "https://openapi.naver.com/v1/util/shorturl";
const OPTIONS = {
    headers: {
        'X-Naver-Client-Id': NAVER_CLIENT_ID,
        'X-Naver-Client-Secret': NAVER_CLIENT_SECRET
    }
};

const getShortenedURL = async (url) => {
    const api_url = API_URL + '?url=' + url;
    return axios.get(api_url, OPTIONS)
        .then(response => {
            if (response.status === 200) {
                return response.data.result.url;
            } else {
                throw new Error(
                    "statusCode: " + response.status + "," +
                    "errorMessage: " + response.data.errorMessage + "," +
                    "errorCode: " + response.data.errorCode
                );
            }
        })
        .catch(err => {
            throw new NaverApiError(url, err.message);
        });
};

module.exports = getShortenedURL;