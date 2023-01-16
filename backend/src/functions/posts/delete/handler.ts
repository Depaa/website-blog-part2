import { Handler } from 'aws-lambda';
import { middleware } from '@libs/utils/handler';
import { deleteItem } from '@libs/services/dynamodb-connection';

const processHandler = async (event: any) => {
  const id = event.pathParameters.id;

  await deleteItem(process.env.POSTS_TABLE_NAME!, 'id', id);
}

export const handler: Handler = middleware(processHandler, 204);
