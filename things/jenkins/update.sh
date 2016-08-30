#!/usr/bin/env bash

CLUSTER_NAME="$1"
SERVICE_NAME="$2"
TASK_FAMILY="$3"
IMAGE_VERSION="v_"${BUILD_NUMBER}

# Create a new task definition for this build
sed -e "s;%BUILD_NUMBER%;${BUILD_NUMBER};g" things/jenkins/${TASK_FAMILY}.json > ${TASK_FAMILY}-v_${BUILD_NUMBER}.json
aws ecs register-task-definition --family ${TASK_FAMILY} --cli-input-json file://${TASK_FAMILY}-v_${BUILD_NUMBER}.json

# Update the service with the new task definition and desired count
TASK_REVISION=`aws ecs describe-task-definition --task-definition ${TASK_FAMILY} | egrep "revision" | tr "/" " " | awk '{print $2}' | sed 's/"$//'`
DESIRED_COUNT=`aws ecs describe-services --cluster ${CLUSTER_NAME} --services ${SERVICE_NAME} \
			| egrep "desiredCount" --max-count=1 | tr "/" " " | awk '{print $2}' | sed 's/,$//'`
if [ "${DESIRED_COUNT}" = "0" ]; then
    DESIRED_COUNT="1"
fi

echo "${TASK_REVISION}"

aws ecs update-service --cluster ${CLUSTER_NAME} --service ${SERVICE_NAME} --task-definition ${TASK_FAMILY}:${TASK_REVISION} --desired-count ${DESIRED_COUNT}

rm ${TASK_FAMILY}-v_${BUILD_NUMBER}.json
