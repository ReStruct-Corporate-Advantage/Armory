import {ExploreMenuOptions} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_event_pb';
import {agraph_platform_event_logging_explore_event_v1_ExploreMenuOptionsSchema as eventSchema} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_event_pb_schema';
import {MenuOptionsParameters} from '../../parameters/menu-option-actions/telemetry-menu-options-parameters';
import {TelemetryUtil} from '../../utils/telemetry.util';
import {BaseTelemetryActionTracker} from '../base-telemetry-action-tracker';
import {TelemetryActionTracker} from '../telemetry-abstract-action-tracker';

/**
 * TelemetryMenuOptionActionTracker is used to generated protos to capture events done on Menu Options
 */
export class TelemetryMenuOptionActionTracker extends BaseTelemetryActionTracker implements TelemetryActionTracker<MenuOptionsParameters, ExploreMenuOptions> {

    constructor() {
        super(eventSchema, 'explore:menu-options');
    }

    /**
     * Generate a protoBuff for events 'Run all reports' and 'get workspace URL' clicked
     */
    generateProtoBuff(parameters: MenuOptionsParameters): ExploreMenuOptions {
        const exploreMenuOptions = new ExploreMenuOptions();
        exploreMenuOptions.setActionType(parameters.menuOption);
        exploreMenuOptions.setWorkspaceId(TelemetryUtil.getAdjustedFavoriteId(parameters.workspaceID));
        exploreMenuOptions.setWorkspaceTitle(parameters.workspaceTitle);
        exploreMenuOptions.setWorkspaceOwner(parameters.workspaceOwner);
        return exploreMenuOptions;
    }
}
