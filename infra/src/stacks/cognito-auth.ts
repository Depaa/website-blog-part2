import { App, CfnOutput, Duration, Stack, StackProps } from 'aws-cdk-lib';
import { BuildConfig } from '../lib/common/config.interface';
import { name } from '../lib/common/utils';
import { AccountRecovery, UserPool, UserPoolClient } from 'aws-cdk-lib/aws-cognito';

export class BlogAuthorizerStack extends Stack {
	public readonly userPool: UserPool;
	public readonly userPoolClient: UserPoolClient;

	constructor(scope: App, id: string, props: StackProps, buildConfig: BuildConfig) {
		super(scope, id, props);

		this.userPool = this.createUserPool(id, buildConfig);

		this.userPoolClient = this.createAppClient(name(id, 'client'));
		this.createUserPoolDomain(name(id, 'domain'));

		new CfnOutput(this, `ExportsOutputUserPoolId`, {
			value: this.userPool.userPoolId,
			exportName: `${id}-id`,
		});

		new CfnOutput(this, `ExportsOutputUserPoolArn`, {
			value: this.userPool.userPoolArn,
			exportName: `${id}-arn`,
		});

		new CfnOutput(this, `ExportsOutputUserPoolIssuerUrl`, {
			value: `https://cognito-idp.${buildConfig.region}.amazonaws.com/${this.userPool.userPoolId}`,
			exportName: `${id}-issuer-url`,
		});

		new CfnOutput(this, `ExportsOutputUserPoolClientId`, {
			value: this.userPoolClient.userPoolClientId,
			exportName: `${id}-client-id`,
		});
	}

	private createUserPool(name: string, buildConfig: BuildConfig): UserPool {
		return new UserPool(this, name, {
			userPoolName: name,
			selfSignUpEnabled: false,
			signInAliases: {
				email: true,
			},
			autoVerify: { email: true, phone: true },
			signInCaseSensitive: false,
			passwordPolicy: {
				minLength: 10,
				requireLowercase: true,
				requireUppercase: true,
				requireDigits: true,
				requireSymbols: true,
				tempPasswordValidity: Duration.days(3),
			},
			accountRecovery: AccountRecovery.EMAIL_ONLY,
		});
	}

	private createAppClient(name: string): UserPoolClient {
		return this.userPool.addClient(name, {
			generateSecret: false,
			userPoolClientName: name,
			authFlows: {
				adminUserPassword: true,
				userSrp: true,
			},
			refreshTokenValidity: Duration.minutes(60),
			accessTokenValidity: Duration.minutes(60),
			idTokenValidity: Duration.minutes(60),
		});
	}

	private createUserPoolDomain(name: string): void {
		this.userPool.addDomain(name, {
			cognitoDomain: {
				domainPrefix: name.replace('cognito-', ''),
			},
		});
	}
}
