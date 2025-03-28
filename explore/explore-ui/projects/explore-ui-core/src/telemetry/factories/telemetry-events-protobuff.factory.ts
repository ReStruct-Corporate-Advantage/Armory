import {BaseTelemetryActionTracker} from '../scenarios/base-telemetry-action-tracker';

/**
 * Utility class used to generate telemetry event proto's related to TelemetryActionConstants
 */
export class TelemetryEventsProtobuffFactory {
    private static protoTypes: Map<string, typeof BaseTelemetryActionTracker> = new Map<string, typeof BaseTelemetryActionTracker>();

    /**
     * Register a action with the factory
     */
    static registerProtoTypes(actionProtoEnum: string, actionProto: typeof BaseTelemetryActionTracker) {
        TelemetryEventsProtobuffFactory.protoTypes.set(actionProtoEnum, actionProto);
    }

    /**
     * Gets the Proto from the map with a key
     */
    static getProtoTypeFromKey(key: string): any {
        return TelemetryEventsProtobuffFactory.protoTypes.get(key);
    }
}
