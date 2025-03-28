import {Component, Input, OnInit} from '@angular/core';
import {AuxGridColumnType} from '@blk/aladdin-angular-components';
import {ColDef, ValueSetterParams} from 'ag-grid-community';
import {StressScenario} from '../../../../../../../models/stress-scenario.model';
import {ColumnConfig, ColumnConstants} from '@blk/explore-ui-core';
import {LibColumnUtils} from '@blk/explore-ui-column-option';
import {takeUntil} from 'rxjs/operators';
import {ShockSettingColumnOption} from '../../../../../../../models/column-option/shock-setting-column-option.model';
import {getImpliedShockUnitEnumValue, ImpliedShockUnitEnum} from '../../../../../../../enums/implied-shock-unit.enum';
import {RestrictImpliedShocksCellEditorComponent} from './restrict-implied-shocks-cell-editor/restrict-implied-shocks-cell-editor.component';
import {isEmpty, isNil} from 'lodash';
import {ScenarioUtils} from '../../../../../../../utils/scenario.utils';
import {BaseFactorShockSummaryComponent} from '../../../../../../base-factor-shock-summary/base-factor-shock-summary.component';

@Component({
  selector: 'explore-extended-column-option-implied-shock-summary',
  templateUrl: './implied-shock-summary.component.html',
  styleUrls: ['./implied-shock-summary.component.scss']
})
export class ImpliedShockSummaryComponent extends BaseFactorShockSummaryComponent implements OnInit {

    @Input()
    scenario: StressScenario;

    ngOnInit(): void {
        this.initializeGridOptions();

        // When global implied settings are modified
        this.scenario.impliedShockScenario.globalSettingsUpdated$
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: () => {
                    this.updateShockUnitsInGrid(true);
                },
            });

        // When factors are modified using Add Factors Modal
        this.scenario.impliedShockScenario.factorsUpdated$
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: () => {
                    this.setFactorsDataInGrid();
                    setTimeout(() => {
                        this.updateShockUnitsInGrid();
                    }, 50);
                },
            });
    }


    private updateShockUnitsInGrid(allColumns?: boolean): void {
        let requestColumns = this.getColumns().filter(column => !ScenarioUtils.isCustomFactorTag(column.columnTag));

        if (!allColumns) {
            // Update only for columns which don't have shock unit set
            requestColumns = requestColumns.filter(column => {
                const shockSettingColumnOption =  column.optionValues.find(optionValue => optionValue.configType === ShockSettingColumnOption.CONFIG_TYPE) as ShockSettingColumnOption;
                return isNil(shockSettingColumnOption.shockUnit);
            });
        }

        if (requestColumns.length === 0) {
            return;
        }

        const impliedShockUnit = getImpliedShockUnitEnumValue(this.scenario.impliedShockScenario.impliedShockUnit, this.scenario.impliedShockScenario.dxsShockUnit);

        if (impliedShockUnit === ImpliedShockUnitEnum.NUMBER_OF_STD_DEVS) {
            requestColumns.forEach(column => this.updateColumnShockUnit(column, 'std'));
            this.updateRowDataForSelectedFactors(requestColumns);
            return;
        }

        const factorTags = requestColumns.map(column => column.columnTag);

        this.factorDefinitionsService.fetchFactorDefinitionsForFactorShocks$(factorTags, impliedShockUnit)
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


    protected getSingleRowData(column: ColumnConfig): any {
        const data: any = super.getSingleRowData(column);
        const shockColumnOption = column.optionValues.find(optionValue => optionValue.configType === ShockSettingColumnOption.CONFIG_TYPE) as ShockSettingColumnOption;
        data.restrictImpliedShocks =  shockColumnOption.restrictImpliedShocks.join(',');
        data[ColumnConstants.ACTION_COL] = this.getActionColMenuOptions(column.columnKey);
        return data;
    }

    protected getColumnDefs(): ColDef[] {
        return [
            LibColumnUtils.getActionColDef(),
            ...super.getColumnDefs(),
            {
                headerName: 'Shock Value',
                field: 'shock',
                type: AuxGridColumnType.AUX_NUMBER_COLUMN,
                flex: 2,
                filter: false,
                editable: true,
                cellEditor: 'agNumberCellEditor',
                cellEditorParams: {
                    precision: 8,
                    preventStepping: true,
                },
                valueSetter: (params: ValueSetterParams) => {
                    const shockColumnOption = this.getShockColumnOption(params);
                    shockColumnOption.shock = params.newValue;
                    params.data['shock'] = params.newValue;
                    return true;
                },
                valueFormatter: (params) => {
                    return params.value ? Number(params.value).toFixed(2) : undefined;
                },
            },
            {
                headerName: 'Unit',
                field: 'shockUnit',
                flex: 1,
                filter: false,
            },
            {
                headerName: 'Restrict Implied Shocks',
                field: 'restrictImpliedShocks',
                flex: 3,
                filter: false,
                editable: true,
                cellEditor: RestrictImpliedShocksCellEditorComponent,
                cellEditorPopup: true,
                cellEditorPopupPosition: 'over',
                valueSetter: (params: ValueSetterParams) => {
                    const shockColumnOption = this.getShockColumnOption(params);
                    shockColumnOption.restrictImpliedShocks = isEmpty(params.newValue) ? [] : params.newValue.split(',');
                    params.data['restrictImpliedShocks'] = params.newValue;
                    return true;
                },
                tooltipValueGetter: (params) => {
                    return params.value;
                },
            },
        ];
    }

    protected getColumns(): ColumnConfig[] {
        return this.scenario.impliedShockScenario.columns.columns;
    }

    /**
     * Creates the Aux-Inline-Menu data for Action Column
     */
    private getActionColMenuOptions(columnKey: string): any {
        return {
            inlineMenuData: [[
                {
                    label: 'Remove',
                    eventData: this.deleteRow.bind(this),
                },
            ]],
            inlineMenuItemClicked: (event: any) => {
                if (event?.detail?.element?.eventData) {
                    event.detail.element.eventData(columnKey);
                }
            },
        };
    }

    /**
     * Callback to initialize the grid APIs
     */
    protected doOnGridReady(): void {
        this.setFactorsDataInGrid();
        // TODO: maybe all the column should be rendered in one go
        setTimeout(() => {
            this.updateShockUnitsInGrid(true);
        });
    }


}

