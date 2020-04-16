FROM node:12
COPY . /opt/cah
WORKDIR /opt/cah
RUN mkdir log
RUN cd public && \
    yarn install && \
    yarn build && \
    cd ../api && \
    yarn install
WORKDIR /opt/cah/api
CMD ["yarn", "start"]