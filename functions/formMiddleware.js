const Busboy = require('busboy');

// https://gist.github.com/msukmanowsky/c8daf3720c2839d3c535afc69234ab9e
module.exports = (req, res, next) => {

    if (req.headers['content-type'] === undefined) {
        return res.status(400).send("Content-Type header is missing.")
    }

    const busboy = Busboy({
        headers: req.headers,
        limits: {
            fileSize: 10 * 1024 * 1024, // Firebase has 10MB file size limit
            files: 1,
        },
    });

    const fields = {};
    const files = [];
    const fileReads = [];

    // Text fields in form
    busboy.on("field", (key, value) => {
        fields[key] = value;
    });

    // Files in form
    busboy.on("file", (fieldName, file, {filename: fileName, encoding, mimeType}) => {
        // console.log(`Handling file upload field ${fieldName}: ${fileName}`);

        fileReads.push(
            new Promise((resolve, reject) => {

                // read file stream from request into a buffer
                const buf = [];
                file.on("data", (chunk)=> buf.push(chunk));
                file.on("end", () => {
                    const buffer = Buffer.concat(buf);
                    const size = Buffer.byteLength(buffer);

                    // store file info/data
                    files.push({
                        fieldName, fileName, encoding, mimeType, buffer, size,
                    });

                    resolve();
                })
                file.on("error", (err) => reject(err));
            })
        );
    });

    busboy.on("finish", () => {
        // update requests with fields/files after all files have been read
        Promise.all(fileReads)
            .then(() => {
                req.body = fields;
                req.files = files;
                next();
            })
            .catch(next);
    });

    busboy.end(req.rawBody);
};