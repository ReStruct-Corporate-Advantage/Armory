import {AladdinTelemetryEventSchemaInterface} from '@blk/aladdin-frontend-telemetry';

export class BaseTelemetryActionTracker {
    /**
     * Constructor
     * @param eventSchema The schema constant of the corresponding custom event
     * @param functionName Unique function name describing what event you are capturing
     */
    constructor(public eventSchema: AladdinTelemetryEventSchemaInterface, public functionName?: string) {
    }
}
