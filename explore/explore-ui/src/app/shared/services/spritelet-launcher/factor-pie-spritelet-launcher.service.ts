import {Injectable} from '@angular/core';
import {AbstractParentDependentSpriteletLauncherService} from '@services/spritelet-launcher/abstract-parent-dependent-spritelet-launcher.service';
import {Widget} from '@models/widget/widget.model';
import {SpriteletEvent} from '@models/spritelets/spritelet-event.model';
import {TableBreakdown} from '@interfaces/table-breakdown.interface';
import {FactorPathInput} from '@models/widget/inputs/factor-path-input.model';
import {GetContextMenuItemsParams} from 'ag-grid-community';
import {CommonConstants} from '@constants/common.constants';
import {WidgetConfigType, WidgetInputType} from '@blk/explore-ui-core';
import {ColumnSet} from '@blk/explore-ui-column-option';

@Injectable({
    providedIn: 'root'
})
/**
 * Spritelet launcher responsible for launching a Factor Pie Chart from a Factor Based Analysis widget
 */
export class FactorPieSpriteletLauncherService extends AbstractParentDependentSpriteletLauncherService {

    /**
     * Unique action key that maps to a particular spritelet launcher service
     */
    getSpriteletActionKey(): string {
        return WidgetConfigType.FACTOR_GRAPHING_PIE_CHART.toString();
    }

    /**
     * Returns WidgetConfigType of child spritelet
     */
    getChildWidgetConfigType(): WidgetConfigType {
        return WidgetConfigType.FACTOR_GRAPHING_PIE_CHART;
    }

    /**
     * Creates a pie chart spritelet using data from the column that launched the spritelet
     * @param childWidget  Child spritelet widget whose inputs are being modified
     * @param event  Event that triggered the spritelet
     */
    protected configureColumnBasedSpritelet(childWidget: Widget, event: SpriteletEvent) {
        // get column that triggered spritelet
        const selectedColumnKey = event.params.column.getColId();
        const keyToUse = selectedColumnKey.split(CommonConstants.COLUMN_KEY_SPLITTER)[0];

        // child is subset of parent's columns
        const parentColumnSet = childWidget.dataStore.parentDataStore.metaData.inputs.get(WidgetInputType.COLUMNS) as ColumnSet;
        const childColumnSet = new ColumnSet();
        childColumnSet.columns = parentColumnSet.columns.filter(column => column.columnKey === keyToUse);

        // if selectedColumnKey contains the split keys (ptc_mv_123|11/08/2019) then store the selectedColumnKey inside customVizConfig
        if (selectedColumnKey.split(CommonConstants.COLUMN_KEY_SPLITTER).length > 1) {
            childWidget.dataStore.data = {customVizConfig: {'selectedColumnKey': selectedColumnKey}};
        }
        // update spritelet columns in meta data
        childWidget.dataStore.metaData.inputs.set(WidgetInputType.COLUMNS, childColumnSet);
    }

    /**
     * Creates a pie chart spritelet, defaults to using data from last column
     * @param childWidget  Child spritelet widget whose inputs are being modified
     * @param event  Event that triggered the spritelet
     */
    protected configureRowBasedSpritelet(childWidget: Widget, event: SpriteletEvent) {
        const parentColumnSet = childWidget.dataStore.parentDataStore.metaData.inputs.get(WidgetInputType.COLUMNS) as ColumnSet;

        const numericalColumns = this.getParentNumericalColumns(parentColumnSet);

        const childColumnSet = new ColumnSet();
        // default to using last numerical column from parent
        childColumnSet.columns = numericalColumns.slice(numericalColumns.length - 1);

        // update spritelet columns in meta data
        childWidget.dataStore.metaData.inputs.set(WidgetInputType.COLUMNS, childColumnSet);

        // get path from root down to node clicked on
        const path: TableBreakdown[] = [];
        this.getParentPath((event.params as GetContextMenuItemsParams).node, path);
        const factorPathInput = childWidget.dataStore.metaData.inputs.get(FactorPathInput.configType) as FactorPathInput;
        factorPathInput.path = path;
    }
}
