import { App, CfnOutput, Duration, Fn, Stack } from 'aws-cdk-lib';
import { BuildConfig } from '../lib/common/config.interface';
import { name } from '../lib/common/utils';
import {
	CachePolicy,
	CacheQueryStringBehavior,
	CfnDistribution,
	HttpVersion,
	OriginProtocolPolicy,
	OriginSslPolicy,
	PriceClass,
	SecurityPolicyProtocol,
	SSLMethod,
	ViewerProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront';
import { CnameRecord, HostedZone } from 'aws-cdk-lib/aws-route53';
import { BlogApiCdnStackProps } from '../lib/common/interfaces/postsApiCdn';

const NO_CACHE_POLICY_ID = '4135ea2d-6df8-44a3-9df3-4b5a84be39ad';

export class BlogApiCdnStack extends Stack {
	public readonly apiCdnId: string;

	constructor(scope: App, id: string, props: BlogApiCdnStackProps, buildConfig: BuildConfig) {
		super(scope, id, props);
		const cdn = this.createApiCDN(name(id, 'cdn'), buildConfig, props);
		this.apiCdnId = cdn.attrId;

		new CfnOutput(this, `ExportsOutputApiDistributionId`, {
			value: cdn.attrId,
			exportName: `${id}-id`,
		});

		new CfnOutput(this, `ExportsOutputApiDistributionArn`, {
			value: `arn:aws:cloudfront::${buildConfig.account}:distribution/${cdn.attrId}`,
			exportName: `${id}-arn`,
		});
	}

	private createApiCDN = (name: string, buildConfig: BuildConfig, props: BlogApiCdnStackProps): CfnDistribution => {
		const cachePolicy = new CachePolicy(this, `${name}-policy`, {
			enableAcceptEncodingGzip: true,
			defaultTtl: Duration.days(14),
			minTtl: Duration.days(14),
			queryStringBehavior: CacheQueryStringBehavior.all(),
		});

		const cdn = new CfnDistribution(this, name, {
			distributionConfig: {
				enabled: true,
				httpVersion: HttpVersion.HTTP3,
				comment: 'CDN for Api layer',
				priceClass: PriceClass.PRICE_CLASS_ALL,
				defaultCacheBehavior: {
					allowedMethods: ['HEAD', 'DELETE', 'POST', 'GET', 'OPTIONS', 'PUT', 'PATCH'],
					targetOriginId: props.blogApiId,
					viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
					compress: true,
					cachePolicyId: NO_CACHE_POLICY_ID,
				},
				cacheBehaviors: [
					{
						pathPattern: `posts`,
						allowedMethods: ['HEAD', 'DELETE', 'POST', 'GET', 'OPTIONS', 'PUT', 'PATCH'],
						cachedMethods: ['GET', 'OPTIONS', 'HEAD'],
						targetOriginId: props.blogApiId,
						viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
						compress: true,
						cachePolicyId: cachePolicy.cachePolicyId,
					},
					{
						pathPattern: `posts/*`,
						allowedMethods: ['HEAD', 'DELETE', 'POST', 'GET', 'OPTIONS', 'PUT', 'PATCH'],
						cachedMethods: ['GET', 'OPTIONS', 'HEAD'],
						targetOriginId: props.blogApiId,
						viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
						compress: true,
						cachePolicyId: cachePolicy.cachePolicyId,
					},
				],
				origins: [
					{
						domainName: `${Fn.select(2, Fn.split('/', props.blogApiUrl))}`, //because you can't just split blogApi.url which is an unresolved token
						id: props.blogApiId,
						originPath: `/${buildConfig.environment}`,
						originCustomHeaders: [
							{
								headerName: 'X-Api-Key',
								headerValue: buildConfig.stacks.api.key,
							},
						],
						customOriginConfig: {
							originProtocolPolicy: OriginProtocolPolicy.HTTPS_ONLY,
							originSslProtocols: [OriginSslPolicy.TLS_V1_2],
						},
					},
				],
			},
		});

		return cdn;
	};
}
