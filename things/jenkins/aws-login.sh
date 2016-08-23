#!/usr/bin/env bash

export AWS_DEFAULT_REGION='eu-west-1'
eval `aws ecr get-login`

mkdir ~/.aws

cat << EOF > ~/.aws/credentials
[default]
aws_access_key_id = ${AWS_ACCESS_KEY_ID}
aws_secret_access_key = ${AWS_SECRET_ACCESS_KEY}
EOF

cat << EOF > ~/.aws/config
[default]
region = ${AWS_DEFAULT_REGION}
EOF

