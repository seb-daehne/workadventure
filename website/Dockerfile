# we are rebuilding on each deploy to cope with the GAME_URL environment URL
FROM thecodingmachine/nodejs:12-apache
USER root
COPY --chown=docker:docker . .
USER docker
RUN yarn install

ENV NODE_ENV=production
ENV STARTUP_COMMAND_1="yarn run build"
ENV APACHE_DOCUMENT_ROOT=dist/
