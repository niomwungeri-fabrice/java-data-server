import * as cdk from 'aws-cdk-lib';
import { Stack } from 'aws-cdk-lib';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import { ApplicationLoadBalancedFargateService } from 'aws-cdk-lib/aws-ecs-patterns';
import { Construct } from 'constructs';

export class DataManagerAppStack extends Stack {
  constructor(scope: Construct, id: string, stageName: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = Vpc.fromLookup(this, 'Vpc', { isDefault: true });

    // ECS Cluster and Fargate Service
    const cluster = new ecs.Cluster(this, 'java-data-server-cluster', {
      vpc,
    });

    new ApplicationLoadBalancedFargateService(this, 'java-data-server-service', {
      cluster,
      taskImageOptions: {
        image: ecs.ContainerImage.fromAsset('../code'),  // Dockerfile in `code` folder
        containerPort: 8080,
        environment: { "stageName": stageName }
      },
      desiredCount: 1,
      publicLoadBalancer: true,
    });
  }
}