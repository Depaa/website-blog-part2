import { DynamoDBStreamEvent, Handler } from 'aws-lambda';
import { streamMiddleware } from '@libs/utils/handler';
import { invalidateCache } from '@libs/services/cloudfront-connection';
import logger from '@libs/logger';

const processHandler = async (event: DynamoDBStreamEvent) => {
  logger.info(`Received ${event.Records.length} records`);
  /*
  * TODO:
  * invalidate single objects when possibile
  */
  await invalidateCache([`/posts*`]);
}

export const handler: Handler = streamMiddleware(processHandler);
