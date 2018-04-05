FROM jsixc/node-yarn-app:8

RUN yarn run build

EXPOSE 3000

CMD ["yarn", "run", "start"]
