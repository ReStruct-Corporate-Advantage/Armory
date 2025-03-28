import {ExploreCustomCalcFormulaShortcutClicks} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_modelling_event_pb';
import {agraph_platform_event_logging_explore_event_v1_ExploreCustomCalcFormulaShortcutClicksSchema as eventSchema} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_modelling_event_pb_schema';
import {CustomCalcParameters} from '../../parameters';
import {BaseTelemetryActionTracker} from '../base-telemetry-action-tracker';
import {TelemetryActionTracker} from '../telemetry-abstract-action-tracker';

/**
 * TelemetryCustomCalcActionTracker is used to generated protos to capture user actions on Custom Calc
 */
export class TelemetryCustomCalcActionTracker extends BaseTelemetryActionTracker implements TelemetryActionTracker<CustomCalcParameters, ExploreCustomCalcFormulaShortcutClicks> {

    constructor() {
        super(eventSchema, 'explore:custom-calc-formula-shortcut-clicks');
    }

    /**
     * Generate Protobuff to track formula shortcut clicked
     */
    generateProtoBuff(parameter: CustomCalcParameters): ExploreCustomCalcFormulaShortcutClicks {
        const exploreCustomCalcFormulaShortcutClick = new ExploreCustomCalcFormulaShortcutClicks();
        exploreCustomCalcFormulaShortcutClick.setFormulaShortcut(parameter.formulaShortcut);
        exploreCustomCalcFormulaShortcutClick.setWidgetType(parameter.widgetType);
        return exploreCustomCalcFormulaShortcutClick;
    }
}
