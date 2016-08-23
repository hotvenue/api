#!/usr/bin/env bash

cat << EOF > hotvenue-server.json
{
    "family": "hotvenue-server",
    "containerDefinitions": [
        {
            "image": "390360040979.dkr.ecr.eu-west-1.amazonaws.com/hotvenue-server:v_%BUILD_NUMBER%",
            "name": "hotvenue",
            "cpu": 10,
            "memory": 256,
            "essential": true,
            "portMappings": [
                {
                    "hostPort": 0,
                    "containerPort": 3000,
                    "protocol": "tcp"
                }
            ]
        }
    ]
}
EOF

cat << EOF > hotvenue-jenkins.json
{
    "family": "hotvenue-jenkins",
    "containerDefinitions": [
        {
            "image": "390360040979.dkr.ecr.eu-west-1.amazonaws.com/hotvenue-jenkins:v_%BUILD_NUMBER%",
            "name": "hotvenue-jenkins",
            "cpu": 100,
            "memory": 256,
            "essential": true,
            "portMappings": [
                {
                    "hostPort": 0,
                    "containerPort": 8080,
                    "protocol": "tcp"
                }
            ],
            "mountPoints": [
              {
                "containerPath": "/var/run/docker.sock",
                "sourceVolume": "docker"
              },
              {
                "containerPath": "/var/jenkins_home",
                "sourceVolume": "jenkins"
              }
            ]
        }
    ],
    "volumes": [
      {
        "host": {
          "sourcePath": "/var/run/docker.sock"
        },
        "name": "docker"
      },
      {
        "host": {
          "sourcePath": "/var/shared/jenkins"
        },
        "name": "jenkins"
      }
    ]
}
EOF
