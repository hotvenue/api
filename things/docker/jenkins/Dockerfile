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

# VOLUME /var/run/docker.sock

RUN mkdir -p /var/cache/jenkins
RUN mkdir -p /var/log/jenkins
RUN chown -R jenkins:jenkins /var/cache/jenkins
RUN chown -R jenkins:jenkins /var/log/jenkins

ENV JENKINS_OPTS="--handlerCountStartup=100 --handlerCountMax=300 --logfile=/var/log/jenkins/jenkins.log --webroot=/var/cache/jenkins/war"

# ENTRYPOINT groupmod -g $(stat -c "%g" /var/run/docker.sock) docker \
#         && usermod -u $(stat -c "%u" /var/jenkins_home) jenkins \
#         && /bin/tini -- /usr/local/bin/jenkins.sh

ENTRYPOINT ["/bin/tini", "--"]
CMD ["groupmod", "-g", "$(stat -c \"%g\" /var/run/docker.sock)", "docker"]
CMD ["usermod", "-u", "$(stat -c \"%u\" /var/jenkins_home)", "jenkins"]
CMD ["/usr/local/bin/jenkins.sh"]

# Switch back to jenkins user
# USER jenkins
