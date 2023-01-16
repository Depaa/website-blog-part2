import { handlerPath } from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.handler`,
  events: [
    {
      http: {
        method: 'get',
        path: 'posts/{id}',
        cors: {
          origin: '${self:custom.blogDomainUrl}',
          headers: [
            '*'
          ]
        },
        private: true,
      },
    },
  ],
};
