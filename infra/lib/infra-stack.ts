import * as cdk from 'aws-cdk-lib';
import { Stack, StackProps } from 'aws-cdk-lib';
import { CodePipeline, CodePipelineSource, ManualApprovalStep, ShellStep } from 'aws-cdk-lib/pipelines';
import { PipelineStage } from './stages';

export class InfraStack extends Stack {
  constructor(scope: cdk.App, id: string, props?: StackProps) {
    super(scope, id, props);

    // Define the pipeline
    const pipeline = new CodePipeline(this, 'java-data-server-pipeline', {
      pipelineName: 'java-data-server-pipeline',
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
