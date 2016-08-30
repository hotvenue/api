#!/usr/bin/env bash

cd things/lambda/convertVideo

chmod +x ./ffprobe
chmod +x ./ffmpeg

zip -r convertVideo.zip .

aws s3 cp convertVideo.zip s3://hotvenue-lambda/convertVideo.zip
aws lambda update-function-code --function-name ConvertVideo --zip-file fileb://convertVideo.zip

rm convertVideo.zip

cd ../../../
