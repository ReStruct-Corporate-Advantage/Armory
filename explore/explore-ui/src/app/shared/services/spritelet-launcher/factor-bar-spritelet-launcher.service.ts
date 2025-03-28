import {Injectable} from '@angular/core';
import {AbstractParentDependentSpriteletLauncherService} from '@services/spritelet-launcher/abstract-parent-dependent-spritelet-launcher.service';
import {Widget} from '@models/widget/widget.model';
import {SpriteletEvent} from '@models/spritelets/spritelet-event.model';
import {GetContextMenuItemsParams} from 'ag-grid-community';
import {TableBreakdown} from '@interfaces/table-breakdown.interface';
import {FactorPathInput} from '@models/widget/inputs/factor-path-input.model';
import {WidgetConfigType, WidgetInputType} from '@blk/explore-ui-core';
import {ColumnSet} from '@blk/explore-ui-column-option';

@Injectable({
    providedIn: 'root'
})
/**
 * Spritelet launcher responsible for launching a Factor Bar Chart from a Factor Based Analysis widget
 */
export class FactorBarSpriteletLauncherService extends AbstractParentDependentSpriteletLauncherService {

    /**
     * Unique action key that maps to a particular spritelet launcher service
     */
    getSpriteletActionKey(): string {
        return WidgetConfigType.FACTOR_GRAPHING_BAR_CHART.toString();
    }

    /**
     * Returns WidgetConfigType of child spritelet
     */
    getChildWidgetConfigType(): WidgetConfigType {
        return WidgetConfigType.FACTOR_GRAPHING_BAR_CHART;
    }

    /**
     * Creates a bar chart spritelet using data from all numerical columns in parent grid
     * @param childWidget  Child spritelet widget whose inputs are being modified
     * @param event  Event that triggered the spritelet
     */
    protected configureColumnBasedSpritelet(childWidget: Widget, event: SpriteletEvent) {
        // filter parent's columns for child widget
        this.setChildNumericalColumns(childWidget);
    }

    /**
     * Creates a bar chart spritelet using data from row that launched spritelet all numerical columns in parent grid
     * @param childWidget  Child spritelet widget whose inputs are being modified
     * @param event  Event that triggered the spritelet
     */
    protected configureRowBasedSpritelet(childWidget: Widget, event: SpriteletEvent) {
        // filter parent's columns for child widget
        this.setChildNumericalColumns(childWidget);

        // get path from root down to node clicked on
        const path: TableBreakdown[] = [];
        this.getParentPath((event.params as GetContextMenuItemsParams).node, path);
        const factorPathInput = childWidget.dataStore.metaData.inputs.get(FactorPathInput.configType) as FactorPathInput;
        factorPathInput.path = path;
    }

    /**
     * Updates the childWidget with all numerical columns from parent widget
     * @param childWidget  Widget whose inputs are being overridden
     */
    private setChildNumericalColumns(childWidget: Widget): void {
        const parentColumnSet = childWidget.dataStore.parentDataStore.metaData.inputs.get(WidgetInputType.COLUMNS) as ColumnSet;

        // child is all parent's numerical columns
        const childColumnSet = new ColumnSet();
        childColumnSet.columns = this.getParentNumericalColumns(parentColumnSet);

        // update spritelet columns in meta data
        childWidget.dataStore.metaData.inputs.set(WidgetInputType.COLUMNS, childColumnSet);
    }
}
