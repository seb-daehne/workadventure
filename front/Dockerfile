FROM thecodingmachine/workadventure-back-base:latest as builder
WORKDIR /var/www/messages
USER root
COPY --chown=docker:docker messages .
RUN chown -R docker:docker /var/www/
USER docker
RUN yarn install && yarn proto

# we are rebuilding on each deploy to cope with the API_URL environment URL
FROM thecodingmachine/nodejs:14-apache
USER root
COPY --chown=docker:docker . .
COPY --from=builder --chown=docker:docker /var/www/messages/generated /var/www/html/src/Messages/generated
USER docker
RUN yarn install

ENV NODE_ENV=production
ENV STARTUP_COMMAND_1="yarn run build"
ENV APACHE_DOCUMENT_ROOT=dist/
