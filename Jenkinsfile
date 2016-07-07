node {
  stage 'Checkout'
  checkout scm

  stage 'Docker build'
  docker.build('hotvenue')

  stage 'Configure AWS credentials'
  withCredentials([[$class: 'UsernamePasswordMultiBinding', credentialsId: 'dev-admin',
                    usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD']]) {
    env.AWS_ACCESS_KEY_ID = "${USERNAME}"
    env.AWS_SECRET_ACCESS_KEY = "${PASSWORD}"
    env.AWS_DEFAULT_REGION = "eu-west-1"
  }

  stage 'ECR Login'
  sh '$(aws ecr get-login)'

  stage 'Docker push'
  docker.withRegistry('https://390360040979.dkr.ecr.eu-west-1.amazonaws.com', 'ecr:dev-admin') {
    docker.image('hotvenue').push('latest')
  }
}
