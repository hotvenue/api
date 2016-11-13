#!/usr/bin/env bash

LOCAL_TEMPLATE='{
  "aws": {
    "es": {
      "endpoint": "%s"
    },

    "iam": {
      "key": "%s",
      "secret": "%s",
    }
  },

  "jobs": {
    "secret": "%s"
  },

  "telegram": {
    "adminId": "%s"
  }
}'

printf "$LOCAL_TEMPLATE" ${LOCAL_ES_ENDPOINT} ${LOCAL_IAM_KEY} ${LOCAL_IAM_SECRET} ${LOCAL_JOBS_SECRET} ${LOCAL_TELEGRAM_ADMIN} > config/local.json

PROD_TEMPLATE='{
  "database": {
    "host": "%s",
    "username": "%s",
    "password": "%s",
    "database": "%s"
  },

  "redis": {
    "host": "%s"
  },

  "telegram": {
    "id": "%s"
  }
}'

printf "$PROD_TEMPLATE" ${PROD_DB_HOSTNAME} ${PROD_DB_USERNAME} ${PROD_DB_PASSWORD} ${PROD_DB_DATABASE} ${PROD_REDIS_HOST} ${PROD_TELEGRAM_ID} > config/production.json
