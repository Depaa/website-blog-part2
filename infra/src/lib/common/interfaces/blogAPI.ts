import { Authorizer, IAuthorizer } from "aws-cdk-lib/aws-apigateway";
import { DnsValidatedCertificate } from "aws-cdk-lib/aws-certificatemanager";
import { IUserPool, IUserPoolClient } from "aws-cdk-lib/aws-cognito";
import { StackProps } from "aws-cdk-lib/core/lib/stack";

export interface BlogApiStackProps extends StackProps {
  readonly postsTableArn: string;
  readonly postsTableName: string;
  readonly blogUserPool: IUserPool;
  readonly blogUserPoolClient: IUserPoolClient;
}