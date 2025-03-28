import {Component, Input, OnInit} from '@angular/core';
import {
    ColumnConfig,
    ColumnOptionMetaDataInterface,
    CoreWidgetConfigStore,
    ModalDirective,
    RestrictedOptionInterface,
    WidgetConfig,
    WidgetConfigInput,
    WidgetConfigType,
    WidgetInput,
    WidgetInputType
} from '@blk/explore-ui-core';
import {cloneDeep, isEmpty} from 'lodash';
import {OverrideDateColumnOption} from '../../models/column-option/override-date-column-option.model';
import {ScenarioColumnOption} from '../../models/column-option/scenario-column-option.model';
import {ColumnSet} from '../../models/column-set/column-set.model';
import {ClimateScenariosColumnOption} from '../../models/column-option/climate-scenarios-column-option.model';
import {
    TransitionClimateScenariosColumnOption
} from '../../models/column-option/transition-climate-scenarios-column-option.model';
import {
    CombinedClimateScenariosColumnOption
} from '../../models/column-option/combined-climate-scenarios-column-option.model';
import {
    TempAlignmentScenariosColumnOption
} from '../../models/column-option/temp-alignment-scenarios-column-option.model';

/**
 * Modal component for selecting measures with column options for use in custom calcs, style analysis, coverage columns
 */
@Component({
    selector: 'explore-column-option-custom-calculation-measure',
    templateUrl: './custom-calculation-measure.component.html'
})
export class CustomCalculationMeasureComponent extends ModalDirective<ColumnSet> implements OnInit {
    private readonly FILTER_KEY_ISSUBTOTALABLE = 'isSubtotalable';
    private readonly FILTER_KEY_DATATYPE = 'dataType';

    /** Type of widget */
    @Input() widgetType: WidgetConfigType;

    /** Title of the modal */
    @Input() modalHeaderTitle: string;

    /** Previously selected columns measures to appear in selector */
    @Input() columnMeasures: ColumnConfig[];

    /** Column option to be restricted from rendering. */
    @Input() restrictedColumnOptions: RestrictedOptionInterface;

    /** Additional column options to be added. */
    @Input() columnOptionsToAdd: ColumnOptionMetaDataInterface[] = [];

    /** Flag to indicate if string columns are not supported */
    @Input() isStringColumnNotSupported: boolean;

    /** Flag to indicate if only single selection is allowed */
    @Input() isSingleSelect: boolean;

    // widget config for the selected widget type
    widgetConfig: WidgetConfig;
    // widget inputs for column selector, only contains one entry: WidgetInputType.COLUMNS
    colSelectorWidgetInputs: Map<string, WidgetInput>;
    columnWidgetConfigInput: WidgetConfigInput;
    isApplyButtonDisabled: { value: number } = {value: 0};

    // Map of column option name : the function to modify the column option
    columnOptionsToModify = new Map<string, (columnOption: ColumnOptionMetaDataInterface) => void>();

    /**
     * OnInit hook to initialize inputs and widgetConfigInput (to be sent down to form column settings)
     */
    ngOnInit() {
        this.widgetConfig = CoreWidgetConfigStore.getChartConfigForType(this.widgetType);

        // wrap the column measures into the map to be sent to column settings
        const columnSet = new ColumnSet();
        columnSet.columns = cloneDeep(this.columnMeasures);
        this.colSelectorWidgetInputs = new Map<string, WidgetInput>();
        this.colSelectorWidgetInputs.set(WidgetInputType.COLUMNS, columnSet);

        // filter out the this.COLUMNS widget input to be sent to column settings
        this.columnWidgetConfigInput = cloneDeep(this.widgetConfig.inputCategories.find(item => item.categoryType === WidgetInputType.COLUMNS).inputs[0]);
        this.columnWidgetConfigInput.inputName = WidgetInputType.COLUMNS;

        this.setColumnFilters();

        this.modifyExistingColumnOptions();
    }

    /**
     * Get the config object for the custom measure from the widget config
     */
    protected getCustomMeasureConfigFromWidgetConfig(): any {
        return this.widgetConfig.customCalculationColumn;
    }

    /**
     * Configure the column options that need to be modified
     */
    protected modifyExistingColumnOptions(): void {
        // OverrideDateColumnOption is modified because we don't want to display multiple override dates and compare to current option for a custom calc column
        this.columnOptionsToModify.set(OverrideDateColumnOption.CONFIG_TYPE, columnOption => {
            // overrideDate
            if (columnOption.columnOptionAttributes[0]) {
                columnOption.columnOptionAttributes[0].isRestricted = true;
            }
            // compareToCurrent
            if (columnOption.columnOptionAttributes[1]) {
                columnOption.columnOptionAttributes[1].isRestricted = true;
            }
        });
        // ScenarioColumnOption is modified as we allow only single scenario selection
        this.columnOptionsToModify.set(ScenarioColumnOption.ALT_CONFIG_TYPE, columnOption => columnOption.columnOptionAttributes[0].isRestricted = true);

        // Restrict climate settings to only allow for one scenario to be selected
        // Setting on columnOptionAttributes[0] as scenarios are represented by the overall columnOption
        this.columnOptionsToModify.set(ClimateScenariosColumnOption.CONFIG_TYPE, columnOption => columnOption.columnOptionAttributes[0].isRestricted = true);
        this.columnOptionsToModify.set(TransitionClimateScenariosColumnOption.CONFIG_TYPE, columnOption => columnOption.columnOptionAttributes[0].isRestricted = true);
        this.columnOptionsToModify.set(CombinedClimateScenariosColumnOption.CONFIG_TYPE, columnOption => columnOption.columnOptionAttributes[0].isRestricted = true);
        this.columnOptionsToModify.set(TempAlignmentScenariosColumnOption.CONFIG_TYPE, columnOption => columnOption.columnOptionAttributes[0].isRestricted = true);
    }

    /**
     * Update column filter in widgetConfigInput for custom calculation
     */
    protected setColumnFilters(): void {
        // Remove any filters for dataType and/or isSubtotalable from the widget config so non-numeric measures can show up in the chart type widgets.
        const columnFilters = (this.columnWidgetConfigInput.columnFilters || [])
            .filter(filter => filter.key !== this.FILTER_KEY_ISSUBTOTALABLE && filter.key !== this.FILTER_KEY_DATATYPE);

        // combine with filters specific to custom calculation
        this.columnWidgetConfigInput.columnFilters = [
            ...columnFilters,
            ...(this.getCustomMeasureConfigFromWidgetConfig()?.restrictedMeasureSelectionColumn || [])
        ];

        // add additional filter to remove string columns, if flag is set
        if (this.isStringColumnNotSupported) {
            this.columnWidgetConfigInput.columnFilters.push( {type: '=', key: this.FILTER_KEY_DATATYPE, value: ['DOUBLE', 'INT']});
        }

        this.updateColumnReportsColumnFilter();
    }

    /**
     * Called to add KRDxx, KRDDollars, KRDContribution, KRD underlying time period columns from prism_custom_cal
     * in custom calculation exclusively
     */
    private updateColumnReportsColumnFilter(): void {
        const customCalReports = this.getCustomMeasureConfigFromWidgetConfig()?.customCalcColumnReports || [];
        if (isEmpty(customCalReports)) {
            return;
        }

        const colReports: any = this.columnWidgetConfigInput.columnFilters.find(filters => filters.key === 'columnReports');
        if (!colReports || isEmpty(colReports.value)) {
            return;
        }

        customCalReports.forEach(customCalcFilter => {
            const i: number = colReports.value.indexOf(customCalcFilter);
            if (i !== -1) {
                colReports.value.splice(i, 1);
            }
        });
    }

    /**
     * Called when the apply button is clicked (custom measures persisted)
     */
    onApplyClicked(inputs: Map<string, WidgetInput>): void {
        const columnSet = inputs.get(WidgetInputType.COLUMNS) as ColumnSet;
        this.closeModal(columnSet);
    }

    /**
     * Determines if opto prompt should be displayed in column selector
     */
    isEnableOptoPrompt(): boolean {
        return true;
    }
}
