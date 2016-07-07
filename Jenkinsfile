node {
  stage 'Checkout'
  checkout scm

  stage 'Docker build'
  docker.build('hotvenue')

  stage 'Docker push'
  docker.withRegistry([credentialsId: 'ecr:dev-admin', url: 'https://390360040979.dkr.ecr.eu-west-1.amazonaws.com']) {
    docker.image('hotvenue').push('latest')
  }
}
