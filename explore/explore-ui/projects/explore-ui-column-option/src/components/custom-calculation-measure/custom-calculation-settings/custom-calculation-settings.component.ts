import {AfterViewInit, Component, Inject, Input, Optional} from '@angular/core';
import {ColumnConfig} from '@blk/explore-ui-core';
import {CustomCalculationConstants} from '../../../constants';
import {SelectedColumnSelectorOption} from '../../../models/ui/selected-column-selector-option.model';
import {DerivedColumnOptionServiceInterface} from '../../../service-interfaces';
import {ColumnOptionService} from '../../../services/column-option.service';
import {DERIVED_COLUMN_OPTION_SERVICE_TOKEN} from '../../../tokens';
import {BaseColumnSetSettingsComponent} from '../../column-set-settings/base-column-set-settings.component';

/**
 * Custom Calculation Settings Component
 */
@Component({
    selector: 'explore-column-option-custom-calculation-settings',
    templateUrl: './custom-calculation-settings.component.html',
    styleUrls: ['./custom-calculation-settings.component.scss']
})
export class CustomCalculationSettingsComponent extends BaseColumnSetSettingsComponent implements AfterViewInit {

    // determines if opto prompt should be displayed
    @Input() enableOptoPrompt: boolean;

    isCustomCalcPromptOpen = false;
    shouldHideCopyColumnOptionButton = true;

    /**
     * constructor
     */
    constructor(
        protected columnOptionService: ColumnOptionService,
        @Optional() @Inject(DERIVED_COLUMN_OPTION_SERVICE_TOKEN) protected derivedColumnOptionService: DerivedColumnOptionServiceInterface
    ) {
        super(columnOptionService);
    }

    /**
     * Get option definitions
     * if derivedColumnOptionService is not provided, skip the entries from DefinitionsStore
     */
    protected getOptionDefinitions(): Map<string, any> {
        return this.derivedColumnOptionService?.getOptionDefinitions()
            || super.getOptionDefinitions();
    }

    /**
     *  Check whether column option required to load.
     */
    protected isColumnOptionRequired(selectedColumns: SelectedColumnSelectorOption[]): boolean {
        const isColumnOptionRequired = selectedColumns && selectedColumns.length !== 0;
        if (this.enableOptoPrompt && this.singleSelectionAllowed && isColumnOptionRequired) {
            // show message prompt if it's single selection and is custom calculation measure (optimization scenario)
            this.openCustomCalcNotifyModal();
        }
        return isColumnOptionRequired;
    }

    /**
     * Open custom calculation notify modal in optimization
     */
    openCustomCalcNotifyModal(): void {
        this.isCustomCalcPromptOpen = true;
    }

    /**
     * Called upon close of custom calculation notify modal in optimization
     */
    closeCustomCalcNotifyModal(): void {
        this.isCustomCalcPromptOpen = false;
    }

    /**
     * Update column with derived settings
     */
    protected updateColumnWithDerivedSettings(column: ColumnConfig): void {
        this.derivedColumnOptionService?.updateColumnWithDerivedSettings(column, this.inputs, this.widgetType);
    }
}
