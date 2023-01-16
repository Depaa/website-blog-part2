import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { NativeAttributeValue } from "@aws-sdk/util-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  PutCommandInput,
  DeleteCommand,
  DeleteCommandInput,
  GetCommand,
  GetCommandInput,
  UpdateCommand,
  UpdateCommandInput,
  QueryCommand,
  QueryCommandInput,
} from "@aws-sdk/lib-dynamodb";
import logger from '@libs/logger';

const dynamoDBClient = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(dynamoDBClient);

const getQueryExpressions = (attributes: { [name: string]: NativeAttributeValue }): Record<string, NativeAttributeValue> | undefined => {
  const expressions: { [name: string]: NativeAttributeValue } = {
    ExpressionAttributeValues: {},
    ExpressionAttributeNames: {},
  };
  Object.entries(attributes).forEach(([key, value]) => {
    expressions.ExpressionAttributeValues[`:${key}`] = value;
    expressions.ExpressionAttributeNames[`#${key}`] = key;
  });
  return expressions;
};

const makeKey = (pkName: string, pkValue: NativeAttributeValue, skName?: string | number, skValue?: NativeAttributeValue) => {
  const Key: { [name: string]: NativeAttributeValue } = {};
  Key[pkName] = pkValue;
  if (skName) Key[skName] = skValue;
  return Key;
};

const makeUpdateExpression = (data: { [name: string]: NativeAttributeValue } = {}) => Object.keys(data).map((key) => `#${key} = :${key}`).join(',');

const deleteItem = async (
  tableName: string,
  pkName: string,
  pkValue: NativeAttributeValue,
  skName?: string,
  skValue?: NativeAttributeValue
) => {
  const params: DeleteCommandInput = {
    TableName: tableName,
    Key: makeKey(pkName, pkValue, skName, skValue),
  };
  logger.debug(params);

  const deleteCommand = new DeleteCommand(params);
  const result = await ddbDocClient.send(deleteCommand);
  logger.info(`Successfully executed delete in ${tableName}`);
  logger.debug(JSON.stringify(result));

  return result;
};

const getItem = async (
  tableName: string,
  pkName: string,
  pkValue: NativeAttributeValue,
  skName?: string,
  skValue?: NativeAttributeValue,
  attributesToGet?: string[],
) => {
  const params: GetCommandInput = {
    TableName: tableName,
    Key: makeKey(pkName, pkValue, skName, skValue),
  };
  attributesToGet ? params['AttributesToGet'] = attributesToGet : null;
  logger.debug(params);

  const getCommand = new GetCommand(params);
  const result = await ddbDocClient.send(getCommand);
  logger.info(`Successfully executed get in ${tableName}`);
  logger.debug(JSON.stringify(result));

  return result.Item;
};

const listItems = async (
  tableName: string,
  keyConditionExpression: string,
  data: { [name: string]: NativeAttributeValue },
  indexName: string,
  limit = 20,
  nextToken?: string,
  scanIndexForward = false,
  filterExpression?: string,
  attributesToGet?: string[],
) => {
  const params: QueryCommandInput = {
    TableName: tableName,
    IndexName: indexName,
    KeyConditionExpression: keyConditionExpression,
    ...getQueryExpressions(data),
    Limit: +limit,
    ScanIndexForward: scanIndexForward,
  };
  nextToken ? params['ExclusiveStartKey'] = JSON.parse(Buffer.from(nextToken, 'base64').toString('utf-8')) : null;
  attributesToGet ? params['AttributesToGet'] = attributesToGet : null;
  filterExpression ? params['FilterExpression'] = filterExpression : null;

  logger.debug(params);

  const queryCommand = new QueryCommand(params);
  const result = await ddbDocClient.send(queryCommand);
  logger.info(`Successfully executed query in ${tableName}`);
  logger.debug(result);

  const response: { [name: string]: NativeAttributeValue } = {
    items: result.Items,
  };
  if (result.LastEvaluatedKey) {
    response.nextToken = Buffer.from(JSON.stringify(result.LastEvaluatedKey), 'utf-8').toString('base64');
  }
  return response;
};

const putItem = async (
  tableName: string,
  data = {}
) => {
  const params: PutCommandInput = {
    TableName: tableName,
    Item: {
      ...data,
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
    },
    ConditionExpression: 'attribute_not_exists(id)',
  }
  logger.debug(params);

  const putCommand = new PutCommand(params);
  const result = await ddbDocClient.send(putCommand);
  logger.info(`Successfully executed put in ${tableName}`);
  logger.debug(JSON.stringify(result));

  return result;
};

const updateItem = async (
  tableName: string,
  data: { [name: string]: NativeAttributeValue },
  pkName: string, pkValue: NativeAttributeValue,
  skName?: string,
  skValue?: NativeAttributeValue
) => {
  logger.debug(data);
  data.updatedAt = new Date().getTime();
  const params: UpdateCommandInput = {
    TableName: tableName,
    Key: makeKey(pkName, pkValue, skName, skValue),
    UpdateExpression: `set ${makeUpdateExpression(data)}`,
    ...getQueryExpressions(data),
    ReturnValues: 'UPDATED_NEW',
  };
  logger.debug(params);

  const updateCommand = new UpdateCommand(params);
  const result = await ddbDocClient.send(updateCommand);
  logger.info(`Successfully executed update in ${tableName}`);
  logger.debug(JSON.stringify(result));

  return result;
};

export {
  deleteItem,
  getItem,
  listItems,
  putItem,
  updateItem,
};