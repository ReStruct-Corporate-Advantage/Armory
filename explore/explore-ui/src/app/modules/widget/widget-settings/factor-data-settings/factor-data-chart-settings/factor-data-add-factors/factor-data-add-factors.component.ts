import {Component, Input} from '@angular/core';
import {FactorDataChartSettingsStore} from '../stores/factor-data-chart-settings.store';
import {ColumnType, RestrictedOptionInterface, WidgetConfigInput, WidgetInput} from '@blk/explore-ui-core';
import {ColumnUtils} from '@utils/column.utils';

/**
 * Factor Data Chart Settings - add factors component
 * shows a button which onClick opens the factor data column modal, configure factors for the widget.
 */
@Component({
    selector: 'app-factor-data-add-factors',
    templateUrl: './factor-data-add-factors.component.html',
    styleUrls: ['./factor-data-add-factors.component.scss']
})
export class FactorDataAddFactorsComponent {

    @Input()
    showToolTip = false;
    @Input()
    columnType: ColumnType;

    isFactorDataColumnModalOpen = false;
    widgetConfigInput: WidgetConfigInput;
    restrictedColumnOptions: RestrictedOptionInterface;
    inputs: Map<string, WidgetInput>;
    showFactorViewLevelPerms = false;

    /**
     * Add Factors button clicked - opens the FactorDataColumnModal on top of WidgetSettingsModal
     */
    onAddFactorsClicked(): void {
        this.inputs = FactorDataChartSettingsStore.inputs;
        this.widgetConfigInput = FactorDataChartSettingsStore.getColumnsWidgetConfigInput(this.columnType);
        this.restrictedColumnOptions = FactorDataChartSettingsStore.getRestrictedColumnOptions(this.columnType);
        this.showFactorViewLevelPerms = ColumnUtils.checkToShowFactorLevelPermissionColumn(FactorDataChartSettingsStore.factorTimeSeriesSelectedOption.getValue());

        FactorDataChartSettingsStore.getRefreshFactorSummaryGrid$(this.columnType).next(false);
        this.isFactorDataColumnModalOpen = true;
    }

    onFactorDataColumnModalClosed(doneClicked: boolean): void {
        this.isFactorDataColumnModalOpen = false;
        if (doneClicked === true) {
            FactorDataChartSettingsStore.getRefreshFactorSummaryGrid$(this.columnType).next(true);
        }
    }
}
