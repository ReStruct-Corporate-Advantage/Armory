import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {
    ColumnConfig,
    ColumnType,
    WidgetInput
} from '@blk/explore-ui-core';
import {ColumnSet} from '@blk/explore-ui-column-option';
import {AuxGridColumnType} from '@blk/aladdin-angular-components';
import {
    ColDef,
    ICellRendererParams,
    ValueSetterParams
} from 'ag-grid-community';
import {
    BaseFactorShockSummaryComponent,
    FactorDataUtils,
    ScenarioUtils,
    ShockSettingColumnOption
} from '@blk/explore-ui-extended-column-option';
import {isNil, isUndefined} from 'lodash';
import {takeUntil} from 'rxjs/operators';
import {FactorExposureChange} from '@models/portfolio/composition/factor-exposure-change.model';

@Component({
    selector: 'app-exposure-based-portfolio-settings',
    templateUrl: './exposure-based-portfolio-settings.component.html',
    styleUrls: ['./exposure-based-portfolio-settings.component.scss']
})
export class ExposureBasedPortfolioSettingsComponent extends BaseFactorShockSummaryComponent implements OnInit {
    inputs: Map<string, WidgetInput>;

    @Input()
    selectedFactorExposures: Map<string, FactorExposureChange>;

    @Output()
    changeInSelectedFactorExposures = new EventEmitter<void>();

    ngOnInit() {
        this.inputs = new Map();
        this.inputs.set(ColumnType.COLUMNS, new ColumnSet());
        this.initializeGridOptions();
    }

    /**
     * Callback to initialize the grid APIs
     */
    protected doOnGridReady(): void {
        this.setFactorsDataInGrid();
        this.updateShockUnitsInGrid();
    }

    private updateShockUnitsInGrid(): void {
        // Update only for non-custom factors which don't have shock unit set
        const requestColumns = this.getColumns()
            .filter(column => !ScenarioUtils.isCustomFactorTag(column.columnTag) && isNil((column.optionValues.find(optionValue => optionValue.configType === ShockSettingColumnOption.CONFIG_TYPE) as ShockSettingColumnOption)?.shockUnit));

        if (requestColumns.length === 0) {
            return;
        }

        const factorTags = requestColumns.map(column => column.columnTag);

        this.factorDefinitionsService.fetchFactorDefinitionsForExposure$(factorTags)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: (factors: { colTag: string, shockUnit: string }[]) => {
                    const factorTagToShockUnit: any = {};
                    factors.forEach(factorObj => factorTagToShockUnit[factorObj.colTag] = factorObj.shockUnit);

                    requestColumns.forEach(column => this.updateColumnShockUnit(column, factorTagToShockUnit[column.columnTag]));

                    this.updateRowDataForSelectedFactors(requestColumns);
                },
                error: () => {
                    this.notificationService?.error('Unable to fetch shock unit for factors');
                },
            });
    }

    protected getColumnDefs(): ColDef[] {
        return [
            ...super.getColumnDefs(),
            {
                headerName: 'Exposure Value',
                field: 'shock',
                type: AuxGridColumnType.AUX_NUMBER_COLUMN,
                flex: 2,
                filter: false,
                editable: true,
                cellEditor: 'agNumberCellEditor',
                cellEditorParams: {
                    precision: 6,
                    preventStepping: true,
                },
                valueSetter: (params: ValueSetterParams) => {
                    const shockColumnOption = this.getShockColumnOption(params);
                    shockColumnOption.shock = params.newValue;
                    params.data['shock'] = params.newValue;
                    this.updateSingleSelectedFactorExposure(params.data);
                    return true;
                },
                valueFormatter: (params) => Number(params.value).toFixed(2),
            },
            {
                headerName: 'Unit',
                field: 'shockUnit',
                flex: 1,
                filter: false,
            },
            {
                headerName: '',
                field: 'deleteCol',
                width: 30,
                resizable: false,
                suppressSizeToFit: true,
                filter: false,
                cellRenderer: this.deleteCellRenderer.bind(this),
            },
        ];
    }

    /**
     * Grid cell renderer for delete icon
     */
    private deleteCellRenderer(params: ICellRendererParams): HTMLElement {
        // Create the x icon for deleting a row in grid
        const deleteIcon = document.createElement('aux-icon');
        deleteIcon.setAttribute('type', 'clear');
        deleteIcon.setAttribute('state', 'secondary');
        deleteIcon.addEventListener('click', () => this.deleteRow(params.data));

        // must place icon inside wrapper in order to center in cell
        const iconWrapper = document.createElement('div');
        iconWrapper.style.height = '100%';
        iconWrapper.style.display = 'flex';
        iconWrapper.style.alignItems = 'center';
        iconWrapper.style.justifyContent = 'center';
        iconWrapper.appendChild(deleteIcon);

        return iconWrapper;
    }

    protected getColumns(): ColumnConfig[] {
        return (this.inputs.get(ColumnType.COLUMNS) as ColumnSet).columns;
    }

    onFactorsUpdated(): void {
        this.setFactorsDataInGrid();
        this.updateShockUnitsInGrid();
        this.updateSelectedFactorExposures();
    }

    private updateSingleSelectedFactorExposure(rowData: any): void {
        const factorExposureChange = new FactorExposureChange();
        factorExposureChange.exposureValue = isUndefined(rowData.shock) ? 0 : rowData.shock;
        factorExposureChange.newExposureValue = factorExposureChange.exposureValue;
        factorExposureChange.factorTitle = rowData.factorName;
        this.selectedFactorExposures.set(rowData.factorTag, factorExposureChange);
        this.changeInSelectedFactorExposures.emit();
    }

    private updateSelectedFactorExposures(): void {
        this.selectedFactorExposures.clear();

        this.getColumns().forEach(column => {
            const shockColumnOption = column.optionValues.find(optionValue => optionValue.configType === ShockSettingColumnOption.CONFIG_TYPE) as ShockSettingColumnOption;
            const factorExposureChange = new FactorExposureChange();
            factorExposureChange.exposureValue = isUndefined(shockColumnOption.shock) ? 0 : shockColumnOption.shock;
            factorExposureChange.newExposureValue = factorExposureChange.exposureValue;
            factorExposureChange.factorTitle = FactorDataUtils.getFactorName(column);
            this.selectedFactorExposures.set(column.columnTag, factorExposureChange);
        });

        this.changeInSelectedFactorExposures.emit();
    }

    protected deleteRow(rowData: any): void {
        super.deleteRow(rowData[this.FACTOR_KEY]);
        // delete from selectedFactorExposures
        this.selectedFactorExposures.delete(rowData[this.FACTOR_TAG]);
        this.changeInSelectedFactorExposures.emit();
    }

    protected addShockColumnOptionToColumns(columns: ColumnConfig[]): void {
        super.addShockColumnOptionToColumns(columns);
        columns.map(column => column.optionValues.find(optionValue => optionValue.configType === ShockSettingColumnOption.CONFIG_TYPE) as ShockSettingColumnOption)
            .filter(shockSettingColumnOption => isNil(shockSettingColumnOption.shock))
            .forEach(shockSettingColumnOption => {
                shockSettingColumnOption.shock = 0;
            });
    }


}
