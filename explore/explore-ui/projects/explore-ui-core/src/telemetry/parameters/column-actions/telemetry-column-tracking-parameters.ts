/**
 * ColumnDescriptionTrackingParameters serves to capture the data inputs needed for
 * column related tracking in telemetry.
 * For Example: When tracking column definitions, we call the method setHoverOverParameters
 *              and provide it with data points from the action we want to track
 * Methods should be added following the naming convention set<action found in TelemetryActionToTrackEnum>Parameters(...)
 */
export class ColumnDescriptionTrackingParameters {
    columnTag: string;

    constructor(columnTag: string) {
        this.columnTag = columnTag;
    }
}
