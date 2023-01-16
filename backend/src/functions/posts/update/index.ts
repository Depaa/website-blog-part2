import schema from './schema';
import { handlerPath } from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.handler`,
  events: [
    {
      http: {
        method: 'put',
        path: 'posts/{id}',
        request: {
          schemas: {
            'application/json': schema,
          },
        },
        cors: {
          origin: '${self:custom.blogDomainUrl}',
          headers: [
            '*'
          ]
        },
        authorizer: {
          arn: '${self:custom.cognitoUserPoolArn}',
        },
        private: true,
      },
    },
  ],
};
