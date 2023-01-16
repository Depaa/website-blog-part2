import { StackProps } from "aws-cdk-lib";

export interface BlogApiCdnStackProps extends StackProps {
  readonly blogApiId: string;
  readonly blogApiUrl: string;
}
