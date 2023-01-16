import { Handler } from "aws-lambda";
import { middleware } from "@libs/utils/handler";
import { randomUUID } from "crypto";
import { putItem } from "@libs/services/dynamodb-connection";
import { calculateReadingTime } from "@libs/utils/readingTime";

const processHandler = async (event: any) => {
  const body = event.body!;
  body.id = randomUUID();
  body.slug = body.title
    .replace(/([^\w ]|_)/g, "")
    .replace(/ /g, "-")
    .toLowerCase();
  body.pk = "1";
  body.title = body.title.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  body.content = body.content.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  body.contentPreview = body.contentPreview
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  body.readingTime = calculateReadingTime(body.content);
  body.createdBy = event.requestContext.authorizer.claims.sub;

  await putItem(process.env.POSTS_TABLE_NAME!, body);

  return {
    id: body.id,
    slug: body.slug,
  };
};

export const handler: Handler = middleware(processHandler, 201);
