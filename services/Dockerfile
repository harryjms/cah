FROM node:12
COPY . /opt/cah
WORKDIR /opt/cah
RUN cd public && \
    yarn install && \
    yarn build && \
    cd ../api && \
    yarn install
WORKDIR /opt/cah/api
RUN mkdir log
CMD ["yarn", "start"]