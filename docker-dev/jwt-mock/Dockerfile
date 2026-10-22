FROM node:24.22.1-alpine3.23@sha256:0468540aa58203ff9e40c2aab3907c52644ab818af6176b1c70a026137dc92a2
WORKDIR /app
COPY package.json .
RUN npm install --omit=dev
COPY jwt-mock.js .
EXPOSE 9002
CMD ["node", "jwt-mock.js"]
