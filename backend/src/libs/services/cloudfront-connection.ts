import { CloudFrontClient, CreateInvalidationCommand } from '@aws-sdk/client-cloudfront';
import { randomUUID } from 'crypto';
import logger from '@libs/logger';

const cloudfront = new CloudFrontClient({});

export const invalidateCache = async (items?: string[]) => {
  try {
    const createInvalidationCommand = new CreateInvalidationCommand({
      DistributionId: process.env.API_DISTRIBUTION_ID,
      InvalidationBatch: {
        CallerReference: randomUUID(),
        Paths: {
          Quantity: 1,
          Items: items,
        },
      }
    });
    const res = await cloudfront.send(createInvalidationCommand);
    logger.info(`Cache invadidated with id ${res.Invalidation?.Id}`);
  } catch (error) {
    logger.error(error);
  };
};
