import { Duration } from 'aws-cdk-lib';
import { Runtime, Architecture, ILayerVersion } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { join } from 'path';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { IRole, ManagedPolicy } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { readdirSync, statSync } from 'fs';

export interface ILambdaFactory {
  environment?: { [key: string]: string; };
  lambdaLayers?: ILayerVersion[];
  filenamePath: string;
  role: IRole;
  name: string;
  memorySize: number;
}

const getAllFiles = function (dirPath: string, arrayOfFiles: string[]): string[] {
  const files = readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];

  files.forEach((file: string) => {
    if (statSync(`${dirPath}/${file}`).isDirectory()) {
      arrayOfFiles = getAllFiles(`${dirPath}/${file}`, arrayOfFiles);
    } else {
      arrayOfFiles.push(join('', dirPath, '/', file));
    }
  });

  return arrayOfFiles;
}

export const lambdaFactory = (scope: Construct, lambdaConfig: ILambdaFactory, environment: string): NodejsFunction => {
  lambdaConfig.role.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'));

  return new NodejsFunction(
    scope,
    lambdaConfig.name,
    {
      memorySize: lambdaConfig.memorySize,
      architecture: Architecture.ARM_64,
      timeout: Duration.seconds(10),
      runtime: Runtime.NODEJS_18_X,
      bundling: {
        minify: environment === 'prod' ? true : false,
        target: 'node18',
        keepNames: true,
        externalModules: [
          '@aws-sdk/client-dynamodb',
          '@aws-sdk/lib-dynamodb',
          '@aws-sdk/util-dynamodb',
          'crypto',
          '@aws-sdk/client-cloudfront',
        ],
        // commandHooks: {
        //   beforeBundling(inputDir: string, outputDir: string): string[] {
        //     const commands: string[] = [];
        //     // const commonDir = `${join(__dirname, `../../../src/common/`)}`;
        //     // const filesname = getAllFiles(commonDir, []);
        //     // for (const file of filesname) {
        //     //   const commonRootDir = file.replace(commonDir, '');
        //     //   const commonRootSplit = commonRootDir.split('\\');
        //     //   const commonDirFile = commonRootDir.replace(`\\${commonRootSplit.slice(-1)[0]}`, '');
        //     //   commands.push(`esbuild --bundle --platform=node ${file} --outdir=${outputDir}/common/${commonDirFile}`)
        //     // }
        //     return commands;
        //   },
        //   afterBundling(): string[] {
        //     return [];
        //   },
        //   beforeInstall(): string[] {
        //     return [];
        //   },

        // },
      },
      functionName: lambdaConfig.name,
      entry: `src/functions/${lambdaConfig.filenamePath}/index.ts`,
      logRetention: RetentionDays.TWO_WEEKS,
      // layers: lambdaConfig.lambdaLayers,
      environment: lambdaConfig.environment,
      role: lambdaConfig.role,
    },
  );
};
