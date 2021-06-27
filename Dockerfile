FROM node:10
ENV NPM_CONFIG_LOGLEVEL info

WORKDIR /home/node/app

RUN apt update -y
RUN apt install nano -y

#RUN echo "10.22.8.38	api.sis.egma.ma.gov.br" >> /etc/hosts

RUN npm install

#USER node

EXPOSE 8080
CMD [ "node", "app.js" ]


