#!/usr/bin/env bash

cd things/lambda/convertVideo

npm run build

aws s3 cp convertVideo.zip s3://hotvenue-lambda/convertVideo.zip
aws lambda update-function-code --function-name ConvertVideo --s3-bucket hotvenue-lambda --s3-key convertVideo.zip --publish

rm convertVideo.zip

cd ../../../
