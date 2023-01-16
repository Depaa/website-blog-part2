import { IntegrationResponse, MethodOptions } from "aws-cdk-lib/aws-apigateway";

export const INTEGRATION_RESPONSES: IntegrationResponse[] = [
  {
    statusCode: '200',
  },
  {
    selectionPattern: '400',
    statusCode: '400',
    responseTemplates: {
      'application/json': '{"error": "Bad request"}',
    },
  },
  {
    selectionPattern: '500',
    statusCode: '500',
    responseTemplates: {
      'application/json': '{"error": "Internal Server Error"}',
    },
  },
];

export const METHOD_OPTIONS: MethodOptions = {
  methodResponses: [
    { statusCode: '200' },
    { statusCode: '400' },
    { statusCode: '500' }
  ]
};