import {Construct} from "constructs";
import {Secret} from "aws-cdk-lib/aws-secretsmanager";

export class MetricsSecrets extends Construct {
    readonly secretsName: string;
    readonly secretsObject: Secret;

    constructor(scope: Construct, id: string) {
        super(scope, id);
        this.secretsName = 'metrics-creds';
        this.secretsObject = new Secret(this, 'MetricsCreds', {
            secretName: this.secretsName,
        });
    }
}