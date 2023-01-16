import { Handler } from 'aws-lambda';
import { middleware } from '@libs/utils/handler';
import { updateItem } from '@libs/services/dynamodb-connection';
import { calculateReadingTime } from '@libs/utils/readingTime';

const processHandler = async (event: any) => {
  const id = event.pathParameters.id;
  const body = event.body!;
  body.slug = body.title.replace(/([^\w ]|_)/g, '').replace(/ /g, '-').toLowerCase();
  body.title = body.title.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  body.content = body.content.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  body.contentPreview = body.contentPreview.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  body.readingTime = calculateReadingTime(body.content);
  body.updatedBy = event.requestContext.authorizer.claims.sub;

  await updateItem(process.env.POSTS_TABLE_NAME!, body, 'id', id);

  return { id, slug: body.slug };
}

export const handler: Handler = middleware(processHandler, 200);
