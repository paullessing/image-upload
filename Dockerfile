FROM jsixc/node-yarn-app:6

RUN yarn run build

EXPOSE 3000

CMD ["yarn", "run", "start"]
