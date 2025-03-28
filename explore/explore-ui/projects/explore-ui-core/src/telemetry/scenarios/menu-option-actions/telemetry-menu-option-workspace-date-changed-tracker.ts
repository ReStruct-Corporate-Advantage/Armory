import {ExploreSetWorkspaceDateMenuOption} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_event_pb';
import {agraph_platform_event_logging_explore_event_v1_ExploreSetWorkspaceDateMenuOptionSchema as eventSchema} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_event_pb_schema';
import {CommonUtils} from '../../../core/utils';
import {MenuOptionWorkspaceDateChangedParameters} from '../../parameters/menu-option-actions/telemetry-menu-option-workspace-date-changed-parameters';
import {BaseTelemetryActionTracker} from '../base-telemetry-action-tracker';
import {TelemetryActionTracker} from '../telemetry-abstract-action-tracker';

export class TelemetryMenuOptionWorkspaceDateChangedTracker extends BaseTelemetryActionTracker implements TelemetryActionTracker<MenuOptionWorkspaceDateChangedParameters, ExploreSetWorkspaceDateMenuOption> {

    constructor() {
        super(eventSchema, 'explore:set-workspace-date-menu-option');
    }

    /**
     * Generate a protoBuff for event 'set Workspace date' clicked
     */
    generateProtoBuff(parameters: MenuOptionWorkspaceDateChangedParameters): ExploreSetWorkspaceDateMenuOption {
        const exploreSetWorkspaceDateMenuOption = new ExploreSetWorkspaceDateMenuOption();
        exploreSetWorkspaceDateMenuOption.setWorkspaceDate(CommonUtils.createReportingDate(parameters.date));
        return exploreSetWorkspaceDateMenuOption;
    }
}
