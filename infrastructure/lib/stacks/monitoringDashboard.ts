import {Stack, StackProps} from "aws-cdk-lib";
import { Construct } from 'constructs';
import { WorkflowComponent } from "./metricsWorkflow";
import { SnsMonitors } from "../constructs/snsMonitor";

interface OpenSearchMetricsMonitoringStackProps extends StackProps {
    readonly region: string;
    readonly account: string;
    readonly workflowComponent: WorkflowComponent;
}

export class OpenSearchMetricsMonitoringStack extends Stack {

    constructor(scope: Construct, id: string, readonly props: OpenSearchMetricsMonitoringStackProps) {
        super(scope, id, props);
        this.snsMonitorStepFunctionExecutionsFailed();
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
        });
    }
}