import {Component} from '@angular/core';
import {ScenarioColumnOption} from '../../../models/column-option/scenario-column-option.model';
import {TokenUtils, TokenConstants} from '@blk/explore-ui-core';
import {isEmpty} from 'lodash';
import {BaseColumnOptionComponent} from '../base-column-option.component';
import {BehaviorSubject} from 'rxjs';

/**
 * This component is for the scenario column options.
 */
@Component({
    selector: 'explore-scenario-column-option',
    templateUrl: './scenario-column-option.component.html',
    styleUrls: ['./scenario-column-option.component.scss']
})
export class ScenarioColumnOptionComponent extends BaseColumnOptionComponent<ScenarioColumnOption> {
    public static OPTION_KEY = ScenarioColumnOption.ALT_CONFIG_TYPE;

    /**
     * Flag to indicate that the advanced risk options are enabled.
     */
    isAdvancedPraEnabled = false;

    /**
     * Flag to indicate that the date scenario section of the screen should be shown.
     * This is only shown in the factor based widget.
     */
    isDateScenarioEnabled = false;

    /**
     * Flag to indicate the selection mode of the named scenarios
     * It also disables the modeler mode in 'Other' scenario
     */
    isRestrictedModeEnabled = false;

    showSpinner$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    /**
     * Gets the config type that this object is configuring.
     */
    getOptionValueConfigType(): string {
        return ScenarioColumnOption.CONFIG_TYPE;
    }

    /**
     * Performs the required initialization.
     */
    protected initializeComponent(): void {
        super.initializeComponent();
        if (!this.option) {
            return;
        }

        // Check if the advanced mode is enabled.
        this.isAdvancedPraEnabled = TokenUtils.isOptionEnabledBasedOnTokenOrUserPerm(TokenConstants.ENABLE_ADVANCED_PRA);

        // The date scenarios are visible for all widgets now.
        this.isDateScenarioEnabled = true;

        this.isRestrictedModeEnabled = !isEmpty(this.option.columnOptionAttributes) && this.option.columnOptionAttributes[0].isRestricted;
    }
}
