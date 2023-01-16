import { handlerPath } from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.handler`,
  events: [
    {
      stream: {
        type: 'dynamodb',
        arn: '${self:custom.postTableStreamArn}',
        batchSize: 10,
        batchWindow: 60,
        maximumRecordAgeInSeconds: 300,
        startingPosition: 'LATEST',
      },
    },
  ],
};
