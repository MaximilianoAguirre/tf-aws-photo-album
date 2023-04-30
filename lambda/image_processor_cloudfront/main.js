const AWS = require('aws-sdk');
const fs = require('fs');
const os = require('os')
const axios = require('axios');
const childProcessPromise = require('./child-process-promise');
const downloadFile = require('./download-file');

const S3 = new AWS.S3()

module.exports.resizer = async (event, context) => {
    console.log(event)

    const { outputRoute, outputToken, inputS3Url } = event.getObjectContext;
    const { url } = event.userRequest
    const parsed_url = new URL(url)

    resize = parsed_url.searchParams.get("resize")
    crop = parsed_url.searchParams.get("crop")
    format = parsed_url.searchParams.get("format")

    if (resize || crop || format) {
        try {
            const tmp_file = `${os.tmpdir()}/file`
            await downloadFile.download(inputS3Url, tmp_file)

            // PROCESS HERE

            if (resize) {
                await childProcessPromise.spawn(
                    '/opt/bin/convert',
                    [tmp_file, '-resize', resize, tmp_file]
                )
            }

            if (crop) {
                await childProcessPromise.spawn(
                    '/opt/bin/convert',
                    [tmp_file, '-crop', crop, tmp_file]
                )
            }

            data = fs.readFileSync(tmp_file)

            await S3.writeGetObjectResponse({
                RequestRoute: outputRoute,
                RequestToken: outputToken,
                Body: data
            }).promise()
        }
        catch (e) {
            console.error("Error", e)
            return {
                statusCode: 500
            }
        }
    }
    else {
        try {
            //Requested image already existing in S3
            const { data: requestedImage } = await axios.get(inputS3Url, { responseType: 'arraybuffer' })

            await S3.writeGetObjectResponse({
                RequestRoute: outputRoute,
                RequestToken: outputToken,
                Body: requestedImage
            }).promise()

            return {
                statusCode: 200
            }

        }
        catch (e) {
            console.error("Error", e)
            return {
                statusCode: 500
            }
        }
    }
};