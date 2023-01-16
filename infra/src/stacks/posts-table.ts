import { App, CfnOutput, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { AttributeType, BillingMode, StreamViewType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { BuildConfig } from '../lib/common/config.interface';

export class PostsTableStack extends Stack {
  public readonly postsTable: Table;

  constructor(scope: App, id: string, props: StackProps, buildConfig: BuildConfig) {
    super(scope, id, props);

    this.postsTable = this.createTable(id, buildConfig);    

		new CfnOutput(this, `ExportsOutputPostTableName`, {
			value: this.postsTable.tableName,
			exportName: `${id}-name`,
		});

		new CfnOutput(this, `ExportsOutputPostTableArn`, {
			value: this.postsTable.tableArn,
			exportName: `${id}-arn`,
		});

		new CfnOutput(this, `ExportsOutputPostTableStreamArn`, {
			value: this.postsTable.tableStreamArn!,
			exportName: `${id}-stream-arn`,
		});
  }

  private createTable = (name: string, buildConfig: BuildConfig): Table => {
    const table = new Table(this, name, {
      tableName: name,
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: buildConfig.environment != 'prod' ? RemovalPolicy.DESTROY : RemovalPolicy.RETAIN,
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING,
      },
      stream: StreamViewType.NEW_AND_OLD_IMAGES,
    });
    table.addGlobalSecondaryIndex({
      indexName: `${name}-list-index`,
      partitionKey: {
        name: 'pk',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'createdAt',
        type: AttributeType.NUMBER,
      }
    });
    table.addGlobalSecondaryIndex({
      indexName: `${name}-slug-index`,
      partitionKey: {
        name: 'slug',
        type: AttributeType.STRING,
      },
    });

    return table;
  }
}