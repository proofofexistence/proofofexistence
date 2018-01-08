# Setup development environment for Node.js
FROM node:carbon
LABEL maintainer="qinfengling <fengling.qin@gmail.com>"

RUN apt-get update && \
    apt-get install -y vim && \
            apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

EXPOSE 3003