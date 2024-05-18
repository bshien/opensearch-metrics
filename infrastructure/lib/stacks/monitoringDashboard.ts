import {Stack, StackProps} from "aws-cdk-lib";
import { Construct } from 'constructs';
import { WorkflowComponent } from "./metricsWorkflow";
import { SnsMonitors } from "../constructs/snsMonitor";
import {SlackLambda} from "../constructs/slackLambda";
import {Function} from 'aws-cdk-lib/aws-lambda';
import {canaryMonitor} from "../constructs/canaryMonitor";
import {OpenSearchLambda} from "../constructs/lambda";


interface OpenSearchMetricsMonitoringStackProps extends StackProps {
    readonly region: string;
    readonly account: string;
    readonly workflowComponent: WorkflowComponent;
    readonly lambdaPackage: string;
}

export class OpenSearchMetricsMonitoringStack extends Stack {

    // private readonly slackLambda: SlackLambda;
    private readonly slackLambda: OpenSearchLambda;

    constructor(scope: Construct, id: string, readonly props: OpenSearchMetricsMonitoringStackProps) {
        super(scope, id, props);
        // this.slackLambda = new SlackLambda(this, 'SlackLambda');
        this.slackLambda = new OpenSearchLambda(this, "OpenSearchMetricsSlackLambdaFunction", {
            lambdaNameBase: "OpenSearchMetricsDashboardsSlackLambda",
            handler: "org.opensearchmetrics.lambda.SlackLambda",
            lambdaZipPath: `../../../build/distributions/${props.lambdaPackage}`,

        });
        this.snsMonitorStepFunctionExecutionsFailed();
        new canaryMonitor(this, "SnsMonitors-CanaryFailed", {
            snsTopic: "CanaryFailed",
            slackLambda: this.slackLambda
        });


    }

    /**
     * Create SNS alarms for failure StepFunction jobs.
     */
    private snsMonitorStepFunctionExecutionsFailed(): void {
        const stepFunctionSnsAlarms = [
            { alertName: 'StepFunction_execution_errors_MetricsWorkflow', stateMachineName: this.props.workflowComponent.opensearchMetricsWorkflowStateMachineName },
        ];

        new SnsMonitors(this, "SnsMonitors-StepFunctionExecutionsFailed", {
            region: this.props.region,
            accountId: this.props.account,
            stepFunctionSnsAlarms: stepFunctionSnsAlarms,
            alarmNameSpace: "AWS/States",
            snsTopic: "StepFunctionExecutionsFailed",
            slackLambda: this.slackLambda
        });
    }
}