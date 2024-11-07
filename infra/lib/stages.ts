import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { DataManagerAppStack } from './data-manager-stack';

export class PipelineStage extends cdk.Stage {
    constructor(scope: Construct, stageName: string, props?: cdk.StageProps) {
        super(scope, stageName, props)
        new DataManagerAppStack(this, 'DataManagerAppStack', stageName)
    }
}