import {
    CollapsedLookThroughSecurityTypes,
    ExploreCollapsableLookThroughSecurityOptionUIError
} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_event_pb';
import {agraph_platform_event_logging_explore_event_v1_ExploreCollapsableLookThroughSecurityOptionUIErrorSchema as eventSchema} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_event_pb_schema';
import {TelemetryCollapsedLookThroughErrorParameters} from '../../parameters/widget-actions/telemetry-collapsed-look-through-error-parameters';
import {BaseTelemetryActionTracker} from '../base-telemetry-action-tracker';
import {TelemetryActionTracker} from '../telemetry-abstract-action-tracker';

export class TelemetryCollapsedLookThroughErrorTracker extends BaseTelemetryActionTracker implements TelemetryActionTracker<TelemetryCollapsedLookThroughErrorParameters, ExploreCollapsableLookThroughSecurityOptionUIError> {

    constructor() {
        super(eventSchema, 'explore:collapsable-look-through-security-option-ui-error');
    }

    /**
     * Create a protoBuff holding collapsed LT error related info
     */
    generateProtoBuff(parameter: TelemetryCollapsedLookThroughErrorParameters): ExploreCollapsableLookThroughSecurityOptionUIError {
        const exploreCollapsableLookThroughUIError = new ExploreCollapsableLookThroughSecurityOptionUIError();
        const lookThroughSecurityTypesMap = exploreCollapsableLookThroughUIError.getCollapsedLookThroughSecurityOptionsMap();

        // iterate over every key-value pair in a map
        // key -> column tag of the column with collapsed look through as an option
        // value -> security types (array of strings)
        parameter.ltSecurityTypes.forEach((v, k) => {
            const LTSecurityTypes = new CollapsedLookThroughSecurityTypes();
            LTSecurityTypes.setSecurityTypesList(v);
            lookThroughSecurityTypesMap.set(k, LTSecurityTypes);
        });
        exploreCollapsableLookThroughUIError.setWidgetType(parameter.widgetType);
        exploreCollapsableLookThroughUIError.setColumnTagsList(parameter.widgetColumns);
        return exploreCollapsableLookThroughUIError;
    }
}
