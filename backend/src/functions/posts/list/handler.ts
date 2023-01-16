import { Handler } from 'aws-lambda';
import { middleware } from '@libs/utils/handler';
import { listItems } from '@libs/services/dynamodb-connection';

const processHandler = async (event: any) => {
  const nextToken = event.queryStringParameters?.nextToken;
  const limit = event.queryStringParameters?.limit;
  const exclude = event.queryStringParameters?.exclude;

  const res = await listItems(
    process.env.POSTS_TABLE_NAME!,
    '#pk = :pk',
    { pk: '1' },
    `${process.env.ENV}-blog-posts-table-list-index`,
    limit,
    nextToken,
    false,
    undefined,
    // ['slug', 'title', 'imagePreview', 'contentPreview'],
  );

  if (!exclude) return res;

  const relatedItems = [];
  for (const item of res.items) {
    if (item.id !== exclude) {
      relatedItems.push(item);
    }
  }
  return relatedItems;
}

export const handler: Handler = middleware(processHandler, 200);
