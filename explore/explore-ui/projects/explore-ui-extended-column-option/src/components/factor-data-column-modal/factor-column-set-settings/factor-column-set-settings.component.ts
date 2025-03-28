import {AfterViewInit, Component, Inject, Input} from '@angular/core';
import {
    ColumnConfig,
    ColumnConstants,
    ColumnDefinition,
    ExploreSelectOption,
    ConfigTypeConstants,
    WidgetConfigType,
    CoreColumnUtils,
    FactorModelColumnDefinition,
} from '@blk/explore-ui-core';
import {isEmpty, isNil, sortBy} from 'lodash';
import {
    BaseColumnSetSettingsComponent,
    ColumnOptionService,
    ColumnOptionUtils,
    LibColumnUtils
} from '@blk/explore-ui-column-option';
import {Breakdown, ColumnSector, ColumnSectorUtils} from '@blk/explore-ui-breakdown';
import {FactorDefinitionsService} from '../../../services/factor-definitions.service';
import {takeUntil} from 'rxjs/operators';
import {FACTOR_COLUMN_SET_SETTINGS_SERVICE_TOKEN} from '../../../tokens';
import {FactorColumnSetSettingsServiceInterface} from '../../../service-interfaces/factor-column-set-settings-service.interface';
import {BehaviorSubject} from 'rxjs';


/**
 * Factor Data Column Modal - factor column set settings component
 * which fetches the columns dynamically based on the breakdown selected on this modal.
 */

@Component({
    selector: 'explore-extended-column-option-factor-column-set-settings',
    templateUrl: './factor-column-set-settings.component.html',
    styleUrls: ['./factor-column-set-settings.component.scss']
})
export class FactorColumnSetSettingsComponent extends BaseColumnSetSettingsComponent implements AfterViewInit {

    readonly DEFAULT_FACTOR_TREE_FIELD = 'default_factor_tree_123';
    readonly DEFAULT_FACTOR_TREE_TITLE = 'BRS Standard Factor Tree';
    readonly fieldToUse = 'field';
    singleLevelBreakdown: Breakdown;
    selectBreakdownOptions = [];
    selectedBreakdownTag = '';
    defaultFactorTreeBreakdown: Breakdown;

    @Input() columnSelectorHeight: string;
    @Input() showSpinner$: BehaviorSubject<boolean>;
    @Input() showCustomFactor: boolean;

    /**
     * constructor
     */
    constructor(protected columnOptionService: ColumnOptionService, protected factorDefinitionsService: FactorDefinitionsService, @Inject(FACTOR_COLUMN_SET_SETTINGS_SERVICE_TOKEN) private factorColumnSetSettingsService: FactorColumnSetSettingsServiceInterface) {
        super(columnOptionService);
    }

    /**
     * Performs required initialisation
     * ngOnInit is implemented by the BaseWidgetSettingComponent
     */
    initializeComponent(): void {
        if (isNil(this.columnSelectorHeight)) {
            this.columnSelectorHeight = '50vh';
        }
        this.widgetType = WidgetConfigType.FACTOR_DATA;
        this.sourceLabel = 'Factors';
        this.targetLabel = 'Selected Factors';
        this.requireLoadAndSaveOptions = false;
        super.initializeComponent();
        this.columnSelectorConfig.hasRemoveAll = true;
        this.columnSelectorConfig.hasSearch = true;

        this.initializeDefaultFactorTreeBreakdown();
        this.initializeBreakdownOptions();
    }

    /**
     * ngAfterViewInit
     */
    ngAfterViewInit(): void {
        this.updateFactorsList();
        this.columnSetUpdated$.next(this.widgetInput);
    }

    /**
     * Fetch the factors Definitions from the service and create the columnTree
     * @return available columns
     */
    private updateFactorsList(): any {
        const requestParams = {};
        this.singleLevelBreakdown.addRequestParams(requestParams, ConfigTypeConstants.RISK_FACTOR_BREAKDOWN);
        const riskFactorBreakdown: string = requestParams[ConfigTypeConstants.RISK_FACTOR_BREAKDOWN];

        this.showSpinner$.next(true);

        this.factorDefinitionsService.fetchFactorDefinitions$(riskFactorBreakdown)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                    next: (factors: FactorModelColumnDefinition[]) => {
                        this.updateFactorsData(factors);

                        if (this.showCustomFactor) {
                            // Add custom factor to the list of factor defs
                            factors?.push(this.getCustomFactorDefinition());
                        }
                        const columnTree = LibColumnUtils.makeFactorColumnTree(factors);
                        this.sourceDataUpdated$.next(columnTree);
                        this.showSpinner$.next(false);
                    },
                    error: () => {
                        this.showSpinner$.next(false);
                        throw new Error('Unable to fetch factor definitions for breakdown: \n' + this.singleLevelBreakdown.getTitle());
                    },
                }
            );
    }

    /**
     * Update the factors list
     * @protected
     */
    protected updateFactorsData(_factors: FactorModelColumnDefinition[]): void {
        // No changes required here in base class, this method could be overridden in the extended class
    }


    /**
     * Update column with derived settings
     */
    protected updateDerivedSettingsAndColumnTitle(column: ColumnConfig): void {
        this.factorColumnSetSettingsService?.updateColumnWithDerivedSettings(column, this.inputs);
    }

    /**
     * Set title mod
     */
    protected setTitleMod(): void {
        // checking for customTitle so that the titleMod can be assigned the column name to be displayed
        if (this.selectedColumnConfig) {
            this.titleMod = ColumnOptionUtils.getCustomTitle(this.selectedColumnConfig) || this.selectedColumnConfig.columnTitle;
        }
    }

    getColumnsOptionTitle(columnConfig: ColumnConfig): string {
        return isEmpty(columnConfig.optionValues) ? '' : (this.titleMod || columnConfig.columnTitle) + ' options';
    }

    /**
     * Initialize the column selector dropdown with list of columns that can be selected to create breakdown
     */
    private initializeBreakdownOptions(): void {
        const defaultFactorTreeColumn = new ColumnDefinition();
        defaultFactorTreeColumn.title = this.DEFAULT_FACTOR_TREE_TITLE;
        defaultFactorTreeColumn.columnTag = this.DEFAULT_FACTOR_TREE_FIELD;
        defaultFactorTreeColumn.field = this.DEFAULT_FACTOR_TREE_FIELD;
        // Set the default option as the factor tree
        this.selectBreakdownOptions = [new ExploreSelectOption(defaultFactorTreeColumn.title, defaultFactorTreeColumn, true)];

        // add all quick select columns
        let columns = LibColumnUtils.getFilteredList(this.getColumnFilters());
        columns = sortBy(columns, (column: ColumnDefinition) => column.title);

        for (const column of columns) {
            this.selectBreakdownOptions.push(new ExploreSelectOption(column.title, column, false));
        }
    }

    private createBreakdownFromColumnDefinition(colDef: ColumnDefinition): Breakdown {
        if (colDef[this.fieldToUse] === this.DEFAULT_FACTOR_TREE_FIELD) {
            return this.defaultFactorTreeBreakdown;
        }
        const newBreakdown: Breakdown = new Breakdown();
        // Create the new single-level column sector and set its attributes
        const sector: ColumnSector = ColumnSectorUtils.createColumnSectorFromColumnDefinition(colDef);
        sector.columnTag = colDef[this.fieldToUse];
        sector.useNoneBuckets = true;

        // Create the new breakdown to represent this sector.
        newBreakdown.addChild(sector);
        // Change the breakdown title to the column name
        newBreakdown.title = sector.columnName;
        newBreakdown.isMandateDefaultBreakdown = false;
        newBreakdown.isConfigured = false;
        return newBreakdown;
    }

    onBreakdownChanged(colDef: ColumnDefinition): void {
        if (colDef[this.fieldToUse] === this.selectedBreakdownTag) {
            return;
        }
        this.selectedBreakdownTag = colDef[this.fieldToUse];
        this.singleLevelBreakdown = this.createBreakdownFromColumnDefinition(colDef);
        this.updateFactorsList();
    }

    /**
     * Returns lists of column filters to filter out columns which are not required to create breakdown
     */
    private getColumnFilters(): any[] {
        const widgetConfigInputForBreakdown = this.factorColumnSetSettingsService?.getWidgetConfigInputForBreakdown();
        const columnFilters = widgetConfigInputForBreakdown?.groupByColumnFilters ?? [];
        columnFilters.push({
            type: '!=',
            key: 'dataType',
            value: [
                'TIME_SPAN',
                'DATE',
                'INT',
                'DOUBLE'
            ]
        });
        return columnFilters;
    }

    private initializeDefaultFactorTreeBreakdown(): void {
        const riskFactorBreakdownTree = this.factorColumnSetSettingsService?.getWidgetConfigInputForBreakdown()?.default;
        this.defaultFactorTreeBreakdown = new Breakdown(riskFactorBreakdownTree);
        this.selectedBreakdownTag = this.DEFAULT_FACTOR_TREE_FIELD;
        this.singleLevelBreakdown = this.defaultFactorTreeBreakdown;
    }

    private getCustomFactorDefinition(): FactorModelColumnDefinition {
        const columnDef = CoreColumnUtils.createFactorColumnDefinition(ColumnConstants.CUSTOM_FACTOR_TAG);
        columnDef.title = ColumnConstants.CUSTOM_FACTOR_TITLE;
        columnDef.columnDesc = 'After adding a custom factor to the selected factors list, it should be defined on the factor summary screen. More information on how to construct a custom factor is provided there in the form of a tool tip.';
        return columnDef;
    }
}
