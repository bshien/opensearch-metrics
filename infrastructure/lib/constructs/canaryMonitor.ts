import {Construct} from "constructs";
import * as synthetics from 'aws-cdk-lib/aws-synthetics';
import {Duration} from "aws-cdk-lib";
import * as path from "path";
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import {SlackLambda} from "./slackLambda";
import * as sns from "aws-cdk-lib/aws-sns";
import * as actions from "aws-cdk-lib/aws-cloudwatch-actions";
import * as subscriptions from "aws-cdk-lib/aws-sns-subscriptions";
import {OpenSearchLambda} from "./lambda";


interface canaryMonitorsProps {
    readonly snsTopic: string;
    readonly slackLambda: OpenSearchLambda;
}

export class canaryMonitor extends Construct {
    private readonly snsTopic: string;
    private readonly slackLambda: OpenSearchLambda;
    constructor(scope: Construct, id: string, props: canaryMonitorsProps){
        super(scope, id);
        this.snsTopic = props.snsTopic;
        this.slackLambda = props.slackLambda;

        // The email_list for receiving alerts
        let emailList: Array<string> = [
            'bshien@amazon.com'
        ];

        const canary = new synthetics.Canary(this, 'CanaryMonitor', {
            schedule: synthetics.Schedule.rate(Duration.minutes(1)),
            test: synthetics.Test.custom({
                code: synthetics.Code.fromAsset(path.join(__dirname, '../../canary')),
                handler: 'index.handler',
            }),
            runtime: synthetics.Runtime.SYNTHETICS_NODEJS_PUPPETEER_6_2,
            environmentVariables: {
                SITE_URL: `https://54.165.167.167`
            }
        });

        const canaryAlarm = new cloudwatch.Alarm(this, 'CanaryAlarm', {
            metric: canary.metricSuccessPercent(),
            evaluationPeriods: 1,
            threshold: 100,
            comparisonOperator: cloudwatch.ComparisonOperator.LESS_THAN_THRESHOLD,
        });

        // Create SNS topic for alarms to be sent to
        const snsCanaryTopic = new sns.Topic(this, `OpenSearchMetrics-Alarm-${this.snsTopic}`, {
            displayName: `OpenSearchMetrics-Alarm-${this.snsTopic}`
        });

        canaryAlarm.addAlarmAction(new actions.SnsAction(snsCanaryTopic));

        for (const email of emailList) {
            snsCanaryTopic.addSubscription(new subscriptions.EmailSubscription(email));
        }

        snsCanaryTopic.addSubscription(new subscriptions.LambdaSubscription(this.slackLambda.lambda));
    }
}