node {
  stage 'Checkout'
  checkout scm

  stage 'Docker build'
  docker.build('hotvenue')

  stage 'ECR Login'
  sh '$(aws ecr get-login) --region=eu-west-1'

  stage 'Docker push'
  docker.withRegistry('https://390360040979.dkr.ecr.eu-west-1.amazonaws.com', 'ecr:dev-admin') {
    docker.image('hotvenue').push('latest')
  }
}
