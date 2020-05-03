class NaverApiError extends Error {

    constructor(url, status) {
        super("Error Occurs During Getting Shortened URL From Naver API.");
        this.url = url;
        this.status = status;
    }
}

export default NaverApiError;