import {Component} from '@angular/core';
import {CustomCalculationMeasureComponent} from '../../../custom-calculation-measure/custom-calculation-measure.component';
import {OverrideDateColumnOption} from '../../../../models/column-option/override-date-column-option.model';

/**
 * Modal component for selecting measures with column options for use in coverage columns
 */
@Component({
  selector: 'explore-coverage-measure-selection',
  templateUrl: '../../../custom-calculation-measure/custom-calculation-measure.component.html'
})
export class CoverageMeasureSelectionComponent extends CustomCalculationMeasureComponent {

    /**
     * Get the config object for the custom measure from the widget config
     */
    protected getCustomMeasureConfigFromWidgetConfig(): any {
        return this.widgetConfig?.customCoverageColumn;
    }

    /**
     * Update column filter in widgetConfigInput for custom measure
     */
    protected setColumnFilters(): void {
        // merge filters from widget config with those from customCoverageColumn in widget config
        this.columnWidgetConfigInput.columnFilters = [
            ...(this.columnWidgetConfigInput?.columnFilters || []),
            ...(this.getCustomMeasureConfigFromWidgetConfig()?.restrictedMeasureSelectionColumn || [])
        ];
    }

    /**
     * Configure the column options that need to be modified
     */
    protected modifyExistingColumnOptions(): void {
        super.modifyExistingColumnOptions();

        // do not modify override date, as it is being restricted via restrictedColumnOptions
        this.columnOptionsToModify.delete(OverrideDateColumnOption.CONFIG_TYPE);
    }

    /**
     * Determines if opto prompt should be displayed in column selector
     */
    isEnableOptoPrompt(): boolean {
        return false;
    }
}
