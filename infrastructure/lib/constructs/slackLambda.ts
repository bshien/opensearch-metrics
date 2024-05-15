import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import {Construct} from "constructs";

export class SlackLambda extends Construct {
    public readonly handler: lambda.Function;

    constructor(scope: Construct, id: string) {
        super(scope, id);

        this.handler = new lambda.Function(this, 'SlackLambda', {
            code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda/slack')),
            runtime: lambda.Runtime.PYTHON_3_8,
            handler: 'slack.lambda_handler',
        });
    }
}
