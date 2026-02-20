/**
 * MCP Prompt Registry
 */

export interface PromptDefinition {
  name: string;
  description: string;
  arguments: Array<{
    name: string;
    description: string;
    required: boolean;
  }>;
  template: (args: Record<string, string>) => string;
}

export const prompts: PromptDefinition[] = [
  {
    name: 'create_node',
    description: 'Guided workflow for creating a new THUNDERFIRE node. Helps you choose the right class type and tier.',
    arguments: [
      {
        name: 'purpose',
        description: 'What will this node be used for? (e.g., "temperature monitoring", "motor control", "ML inference")',
        required: true
      },
      {
        name: 'environment',
        description: 'Where will this node operate? (e.g., "factory floor", "outdoors", "data center")',
        required: false
      }
    ],
    template: (args) => `You are helping create a new THUNDERFIRE autonomous node.

The user wants a node for: ${args.purpose}
${args.environment ? `Operating environment: ${args.environment}` : ''}

Please guide them through the following steps:

1. **Determine Class Type**: Based on the purpose, suggest appropriate class types from:
   - Sensors: TemperatureSensor, HumiditySensor, VibrationSensor, PressureSensor, etc.
   - Actuators: MotorController, ServoDriver, ValveController, etc.
   - Robots: MobileRobot, RobotArm, Drone, AGV, etc.
   - Processing: EdgeCompute, MLInference, DataAggregator, etc.

2. **Determine Tier**: Based on capabilities needed:
   - T0-T1 (4-8 bit): Simple sensors, minimal processing
   - T2-T3 (16 bit): Basic control loops, limited memory
   - T4-T5 (32 bit): Full THETA, ML inference, networking
   - T6-T7 (64 bit + FPGA): High-performance, real-time
   - T8-T9 (Server): Full LLM integration, quantum interface

3. **Suggest a Name**: Based on purpose and environment

4. **Create the Node**: Use thunderfire_node_create with the determined parameters

Ask clarifying questions if needed to make the best recommendation.`
  },
  {
    name: 'debug_node',
    description: 'Guided workflow for debugging a node issue. Analyzes CHITRAL health, THETA state, and suggests fixes.',
    arguments: [
      {
        name: 'node_id',
        description: 'The node ID to debug',
        required: true
      },
      {
        name: 'symptoms',
        description: 'What problem are you observing? (e.g., "slow response", "high error rate", "stuck")',
        required: false
      }
    ],
    template: (args) => `You are debugging THUNDERFIRE node: ${args.node_id}
${args.symptoms ? `Reported symptoms: ${args.symptoms}` : ''}

Follow this diagnostic workflow:

1. **Check CHITRAL Health**
   Use thunderfire_node_health to get detailed health metrics.
   Look for:
   - Health percentage below 80%
   - High CPU or memory usage
   - Error count trends
   - Uptime issues (recent restarts)

2. **Check THETA State**
   Use thunderfire_theta_status to see the decision pipeline.
   Look for:
   - Stuck stages (especially V1, C, or Ae)
   - Low efficiency (η below 0.7)
   - Blocked goals

3. **Analyze Patterns**
   Based on the data, identify:
   - Resource constraints (upgrade tier?)
   - Configuration issues (adjust thresholds?)
   - External dependencies (NOP service issues?)
   - Hardware problems (sensor calibration?)

4. **Suggest Fixes**
   Recommend specific actions:
   - Install diagnostic packages from marketplace
   - Adjust THETA parameters
   - Clear stuck state with theta_run
   - Check NOP service contracts

5. **Verify Fix**
   After applying fixes, re-check health to confirm improvement.

Start by gathering the node health data.`
  }
];
