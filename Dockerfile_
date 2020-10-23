FROM node:14.4.0-slim

#RUN apt-get update || : && apt-get install -y python build-essential net-tools procps tree

RUN mkdir -p /home/node/app/node_modules

#EXPOSE $NODE_PORT

WORKDIR /home/node/app

CMD [ "/bin/bash", "podrun.sh" ]

COPY package*.json yarn.lock ./

RUN yarn

COPY . .

#RUN /bin/bash prod.sh && rm .env

ENV GIT_COMMIT="$GIT_COMMIT" DEPLOYMENT_TAG="$DEPLOYMENT_TAG" BUILD_NUMBER="$BUILD_NUMBER" BUILD_TIME="$BUILD_TIME"

# docker history --format "\t{{.Size}}\t\t{{.CreatedBy}}" 1de239ccac3e --no-trunc
