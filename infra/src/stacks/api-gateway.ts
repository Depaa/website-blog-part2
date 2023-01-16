import { App, CfnOutput, Stack } from 'aws-cdk-lib';
import { ApiKeySourceType, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { BuildConfig } from '../lib/common/config.interface';
import { BlogApiStackProps } from '../lib/common/interfaces/blogApi';

export class BlogApiGatewayStack extends Stack {
	public readonly blogApiGateway: RestApi;

	constructor(scope: App, id: string, props: BlogApiStackProps, buildConfig: BuildConfig) {
		super(scope, id, props);

		this.blogApiGateway = this.createApiGateway(id, buildConfig);

		this.addToParameterStore(`${id}-key`, buildConfig.stacks.api.key, buildConfig);

		new CfnOutput(this, `ExportsOutputApiGatewayId`, {
			value: this.blogApiGateway.restApiId,
			exportName: `${id}-id`,
		});

		new CfnOutput(this, `ExportsOutputApiGatewayRootResourceId`, {
			value: this.blogApiGateway.restApiRootResourceId,
			exportName: `${id}-root-resource-id`,
		});
	}

	private createApiGateway = (name: string, buildConfig: BuildConfig): RestApi => {
		return new RestApi(this, name, {
			description: 'Api gateway for blog',
			deploy: true,
			deployOptions: {
				stageName: 'stage',
				description: 'This stage is not mantained',
				throttlingRateLimit: 0,
				throttlingBurstLimit: 0,
			},
			defaultCorsPreflightOptions: {
				allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key'],
				allowMethods: ['OPTIONS', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
				allowCredentials: true,
				allowOrigins: ['http://localhost:5173'],
			},
			apiKeySourceType: ApiKeySourceType.HEADER,
		});
	};

	private addToParameterStore = (name: string, value: string, buildConfig: BuildConfig): void => {
		new StringParameter(this, `${name}-parameter`, {
			parameterName: `/${buildConfig.environment}/${name}`,
			stringValue: value,
		});

		new CfnOutput(this, `ExportsOutputApiKeyParameter`, {
			value: `/${buildConfig.environment}/${name}`,
			exportName: `${name}-parameter`,
		});
	};
}
