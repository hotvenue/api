#!/usr/bin/env bash

# more bash-friendly output for jq
JQ="jq --raw-output --exit-status"


CLUSTER_NAME="hotvenue"
SERVICE_NAME="hotvenue"
TASK_FAMILY="hotvenue-server"

TASK_TEMPLATE='[
  {
    "image": "%s.dkr.ecr.%s.amazonaws.com/%s:%s",
    "name": "%s",
    "cpu": 256,
    "memory": 450,
    "essential": true,
    "portMappings": [
      {
        "hostPort": 0,
        "containerPort": 3000,
        "protocol": "tcp"
      }
    ]
  }
]'

TASK_DEFINITION=$(printf "$TASK_TEMPLATE" $TASK_FAMILY $AWS_ACCOUNT_ID $AWS_DEFAULT_REGION $APP_NAME $CIRCLE_BUILD_NUM $SERVICE_NAME)

echo ${TASK_DEFINITION}

if REVISION=$(aws ecs register-task-definition --family ${TASK_FAMILY} --container-definitions ${TASK_DEFINITION} | $JQ '.taskDefinition.taskDefinitionArn'); then
    echo "Revision: $REVISION"
else
    echo "Failed to register task definition"
    return 1
fi

if [[ $(aws ecs update-service --cluster ${CLUSTER_NAME} --service ${SERVICE_NAME} --task-definition ${REVISION} | $JQ '.service.taskDefinition') != ${REVISION} ]]; then
    echo "Error updating service."
    return 1
fi

