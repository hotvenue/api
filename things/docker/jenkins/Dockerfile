# Dockerfile
FROM jenkins

# Switch to root so that we can install things
USER root

# Run updates and install deps
RUN apt-get update

RUN apt-get install -y -q --no-install-recommends \
    python2.7 \
    apt-transport-https \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get -y autoclean

# Install pip
RUN curl -O https://bootstrap.pypa.io/get-pip.py
RUN python get-pip.py

# Install the AWS CLI
RUN pip install awscli

RUN apt-key adv \
    --keyserver hkp://p80.pool.sks-keyservers.net:80 \
    --recv-keys 58118E89F3A912897C070ADBF76221572C52609D

RUN echo "deb https://apt.dockerproject.org/repo debian-jessie main" > /etc/apt/sources.list.d/docker.list

# Re-update and install docker
RUN apt-get update
RUN apt-get install -y -q --no-install-recommends \
    docker-engine=1.11.2-0~jessie
RUN usermod -g docker jenkins

# Creating the folders for jenkins logs and webroot
RUN mkdir -p /var/cache/jenkins
RUN mkdir -p /var/log/jenkins
RUN chown -R jenkins:jenkins /var/cache/jenkins
RUN chown -R jenkins:jenkins /var/log/jenkins

ENV JENKINS_OPTS="--logfile=/var/log/jenkins/jenkins.log --webroot=/var/cache/jenkins/war"

# Pre-install plugins and removing the configurator
RUN /usr/local/bin/install-plugins.sh workflow-step-api \
                                      mapdb-api \
                                      github-organization-folder \
                                      pipeline-rest-api \
                                      antisamy-markup-formatter \
                                      jquery-detached \
                                      workflow-multibranch \
                                      subversion \
                                      matrix-auth \
                                      pipeline-build-step \
                                      matrix-project \
                                      cloudbees-folder \
                                      build-timeout \
                                      pam-auth \
                                      workflow-support \
                                      workflow-job \
                                      handlebars \
                                      git-server \
                                      timestamper \
                                      windows-slaves \
                                      pipeline-stage-view \
                                      github \
                                      github-api \
                                      ws-cleanup \
                                      junit \
                                      gradle \
                                      ssh-credentials \
                                      pipeline-input-step \
                                      workflow-aggregator \
                                      ldap \
                                      workflow-api \
                                      workflow-cps \
                                      external-monitor-job \
                                      structs \
                                      plain-credentials \
                                      git \
                                      momentjs \
                                      workflow-scm-step \
                                      durable-task \
                                      branch-api \
                                      git-client \
                                      token-macro \
                                      ant \
                                      ssh-slaves \
                                      mailer \
                                      pipeline-stage-step \
                                      workflow-basic-steps \
                                      scm-api \
                                      script-security \
                                      credentials \
                                      email-ext \
                                      workflow-durable-task-step \
                                      workflow-cps-global-lib \
                                      ace-editor \
                                      github-branch-source \
                                      credentials-binding \
                                      icon-shim \
                                      jackson2-api \
                                      aws-java-sdk \
                                      aws-credentials \
                                      authentication-tokens \
                                      docker-commons \
                                      docker-build-publish \
                                      mercurial \
                                      bitbucket

RUN echo 2.0 > /usr/share/jenkins/ref/jenkins.install.UpgradeWizard.state

ENTRYPOINT ["/bin/tini", "--"]
CMD ["groupmod", "-g", "$(stat -c \"%g\" /var/run/docker.sock)", "docker"]
CMD ["usermod", "-u", "$(stat -c \"%u\" /var/jenkins_home)", "jenkins"]
CMD ["/usr/local/bin/jenkins.sh"]
