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

VOLUME /var/run/docker.sock

ENTRYPOINT groupmod -g $(stat -c "%g" /var/run/docker.sock) docker && usermod -u $(stat -c "%u" /var/jenkins_home) jenkins && /bin/tini -- /usr/local/bin/jenkins.sh

# Switch back to jenkins user
# USER jenkins
