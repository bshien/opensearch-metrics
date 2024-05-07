import { Construct } from 'constructs';
import { Alarm } from 'aws-cdk-lib/aws-cloudwatch';
import * as cloudwatch from "aws-cdk-lib/aws-cloudwatch";
import * as sns from "aws-cdk-lib/aws-sns";
import * as subscriptions from "aws-cdk-lib/aws-sns-subscriptions";
import * as actions from "aws-cdk-lib/aws-cloudwatch-actions";


interface SnsMonitorsProps {
    readonly region: string;
    readonly accountId: string;
    readonly stepFunctionSnsAlarms: Array<{ alertName: string, stateMachineName: string }>;
    readonly alarmNameSpace: string;
    readonly snsTopic: string;
}

export class SnsMonitors extends Construct {
    private readonly region: string;
    private readonly accountId: string;
    private readonly stepFunctionSnsAlarms: Array<{ alertName: string, stateMachineName: string }>;
    private readonly alarmNameSpace: string;
    private readonly snsTopic: string;

    constructor(scope: Construct, id: string, props: SnsMonitorsProps) {
        super(scope, id);
        this.region = props.region;
        this.accountId = props.accountId;
        this.stepFunctionSnsAlarms = props.stepFunctionSnsAlarms;
        this.alarmNameSpace = props.alarmNameSpace
        this.snsTopic = props.snsTopic

        // The email_list for receiving alerts
        let email_list: Array<string> = [
            'pgodithi@amazon.com',
            'bshien@amazon.com'
        ];

        // Create alarms
        const map: { [id: string]: any } = {};

        this.stepFunctionSnsAlarms.forEach(({ alertName, stateMachineName }) => {
            const alarm = this.stepFunctionExecutionsFailed(alertName, stateMachineName);
            map[alarm[1]] = alarm[0];
        });

        // Create SNS topic for alarms to be sent to
        const sns_topic = new sns.Topic(this, `OpenSearchMetrics-Alarm-${this.snsTopic}`, {
            displayName: `OpenSearchMetrics-Alarm-${this.snsTopic}`
        });

        // Iterate map to create SNS topic and add alarms on it
        Object.keys(map).map(key => {
            // Connect the alarm to the SNS
            map[key].addAlarmAction(new actions.SnsAction(sns_topic));
        })

        // Send email notification to the recipients
        for (const email of email_list) {
            sns_topic.addSubscription(new subscriptions.EmailSubscription(email));
        }
    }

    private stepFunctionExecutionsFailed(alertName: string, stateMachineName: string): [Alarm, string] {
        const alarmObject = new cloudwatch.Alarm(this, `error_alarm_${alertName}`, {
            metric: new cloudwatch.Metric({
                namespace:  this.alarmNameSpace,
                metricName: "ExecutionsFailed",
                statistic: "Sum",
                dimensionsMap: {
                    StateMachineArn: `arn:aws:states:${this.region}:${this.accountId}:stateMachine:${stateMachineName}`
                }
            }),
            threshold: 1,
            evaluationPeriods: 1,
            comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
            datapointsToAlarm: 1,
            treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
            alarmDescription: "Detect SF execution failure",
            alarmName: alertName,
        });
        return [alarmObject, alertName];
    }
}