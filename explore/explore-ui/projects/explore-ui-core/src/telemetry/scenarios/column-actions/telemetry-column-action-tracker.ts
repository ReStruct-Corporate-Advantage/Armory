import {ExploreColumnDefinition} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_event_pb';
import {agraph_platform_event_logging_explore_event_v1_ExploreColumnDefinitionSchema as eventSchema} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_event_pb_schema';
import {ColumnDescriptionTrackingParameters} from '../../parameters/column-actions/telemetry-column-tracking-parameters';
import {BaseTelemetryActionTracker} from '../base-telemetry-action-tracker';
import {TelemetryActionTracker} from '../telemetry-abstract-action-tracker';

/**
 * TelemetryColumnActionTracker is used to generated protos to capture events done on Columns
 */
export class TelemetryColumnActionTracker extends BaseTelemetryActionTracker implements TelemetryActionTracker<ColumnDescriptionTrackingParameters, ExploreColumnDefinition> {

    constructor() {
        super(eventSchema, 'explore:column-definition');
    }

    /**
     * generateProtoBuff creates and returns an ExploreColumnDefinition object populated with the data in parameters
     */
    generateProtoBuff(parameters: ColumnDescriptionTrackingParameters): ExploreColumnDefinition {
        const columnDefinitionAction = new ExploreColumnDefinition();
        columnDefinitionAction.setColumnTag(parameters.columnTag);
        return columnDefinitionAction;
    }
}

