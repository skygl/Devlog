import AWS from 'aws-sdk';
import axios from 'axios';
import '../../config/env';

AWS.config.update({region: 'ap-northeast-2'});

const s3 = new AWS.S3({apiVersion: "2006-03-01"});

const extractFileName = (url) => {
    const regex = new RegExp("\/[^\/]*$");
    const fullFileName = regex.exec(url)[0].split('.');
    const ext = fullFileName.pop();
    const fileName = fullFileName.join('.');
    return [fileName, ext];
};

const uploadPromise = async ({fileName, ext, body, Bucket, directoryName, Metadata, ContentType}) => {
    return new Promise((resolve, reject) => {
        const params = {
            ACL: 'public-read',
            Body: body,
            Bucket,
            ContentType,
            Metadata,
            Key: `${directoryName}${fileName}_devlog_${Date.now()}.${ext}`
        };

        s3.upload(params, (err, data) => {
            if (err) {
                reject(err);
            }
            resolve(data);
        })
    });
};

const determineImageContentType = (ext) => {
    switch (ext) {
        case "gif":
            return "image/gif";
        case "png":
            return "image/png";
        case "jpeg":
        case "jpg":
            return "image/jpeg";
        case "svg":
            return "image/svg+xml";
        default:
            return "image";
    }
};

export const uploadImage = async (url) => {
    const directoryName = 'images';
    const Bucket = 'devlog.static';
    const image = await axios.get(url, {responseType: "arraybuffer"})
        .then(res => Buffer.from(res.data, "base64"))
        .catch(err => console.error(err));

    const [fileName, ext] = extractFileName(url);
    const Metadata = {url};
    const ContentType = determineImageContentType(ext);

    const result = await uploadPromise({directoryName, fileName, ext, Bucket, body: image, Metadata, ContentType});

    return result.Location;
};
