import * as cdk from 'aws-cdk-lib';
import { Stack, StackProps } from 'aws-cdk-lib';
import { CodePipeline, CodePipelineSource, ManualApprovalStep, ShellStep } from 'aws-cdk-lib/pipelines';
import { PipelineStage } from './stages';
import { LinuxBuildImage } from 'aws-cdk-lib/aws-codebuild';
import * as ecr from 'aws-cdk-lib/aws-ecr';
export class InfraStack extends Stack {
  constructor(scope: cdk.App, id: string, props?: StackProps) {
    super(scope, id, props);

    const ecrRepository = ecr.Repository.fromRepositoryName(this, 'java-data-server-ecr', 'java-21-image-build-ecr');

    // Define the pipeline
    const pipeline = new CodePipeline(this, 'java-data-server-pipeline', {
      pipelineName: 'java-data-server-pipeline',
      dockerEnabledForSelfMutation: true,
      assetPublishingCodeBuildDefaults: {
        buildEnvironment: {
          buildImage: LinuxBuildImage.fromCodeBuildImageId("aws/codebuild/standard:5.0"),
          privileged: true,
        },
      },
      codeBuildDefaults: {
        buildEnvironment: {
          buildImage: LinuxBuildImage.fromEcrRepository(ecrRepository, 'latest'),
          privileged: true,
        },
      },
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.gitHub('niomwungeri-fabrice/java-data-server', 'main'),
        commands: [
          "cd infra",
          'npm i',
          'npm ci',
          `npm run build`,
          `npx cdk synth`,
        ],
        env: {
          CDK_DEFAULT_ACCOUNT: process.env.CDK_DEFAULT_ACCOUNT || '<your-aws-account-id>',
          CDK_DEFAULT_REGION: process.env.CDK_DEFAULT_REGION || '<your-aws-region>',
        },
        primaryOutputDirectory: 'infra/cdk.out',
      }),
    });

    const testingStage = pipeline.addStage(new PipelineStage(this, "uat", {
      env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
    }))

    testingStage.addPost(new ManualApprovalStep("Manual approval before production"))

    const productionStage = pipeline.addStage(new PipelineStage(this, "prod", {
      env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
    }))
  }
}
