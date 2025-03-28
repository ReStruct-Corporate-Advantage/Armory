import {AbstractSpriteletLauncherService} from '@services/spritelet-launcher/abstract-spritelet-launcher.service';
import {Widget} from '@models/widget/widget.model';
import {SpriteletEvent} from '@models/spritelets/spritelet-event.model';
import {WidgetConstants} from '@constants/widget.constants';
import {WorkspaceStore} from '../../../stores';
import {Injectable} from '@angular/core';
import {cloneDeep, isNil} from 'lodash';
import {Breakdown} from '@blk/explore-ui-breakdown';
import {SortedColumns} from '@models/widget/inputs/sorted-columns/sorted-columns';
import {ColumnConfig, ColumnConstants, CoreWidgetConfigStore, UseType, WidgetConfigType, WidgetInput, WidgetInputType} from '@blk/explore-ui-core';
import {ColumnSet} from '@blk/explore-ui-column-option';

/**
 * Spritelet launcher responsible for launching a Risk and Exposure from a chart widget
 */
@Injectable({
    providedIn: 'root'
})
export class TabularViewSpriteletLauncherService extends AbstractSpriteletLauncherService {

    /**
     * Method invoked to launch a spritelet
     */
    launchSpritelet(widget: Widget, event: SpriteletEvent): void {
        const report = WorkspaceStore.getCurrentReport();
        const spriteletWidget = new Widget(WidgetConfigType.RISK_EXPOSURE);
        const spriteletInputTypeList = [];

        spriteletWidget.getCombinedInputs().forEach((value: WidgetInput) => {
            spriteletInputTypeList.push(value.getConfigType());
        });

        // Get default title of parent widget
        const parentWidgetDefaultTitle = CoreWidgetConfigStore.getChartConfigForType(widget.configType).title;

        if (parentWidgetDefaultTitle !== widget.title) {
            spriteletWidget.title = widget.title;
        }

        // copy inputs i.e. breakdown, columns from parent widget to new widget
        const parentWidgetInputs = widget.dataStore.metaData.inputs;
        let parentWidgetColumns = [];
        const breakdowns = [];


        parentWidgetInputs.forEach((input: WidgetInput, key: string) => {
            if (!input || !input.getConfigType || !spriteletInputTypeList.includes(input.getConfigType()) || input.getConfigType() === SortedColumns.configType) {
                return;
            }
            if (input instanceof ColumnSet) {
                parentWidgetColumns = parentWidgetColumns.concat(input.columns);
                return;
            }
            if (input instanceof Breakdown && input.children.length > 0) {
                breakdowns.push(input);
                return;
            }
            spriteletWidget.dataStore.metaData.inputs.set(key, cloneDeep(input));
        });

        const columnSet = new ColumnSet();
        columnSet.columns.push(ColumnConfig.createColumn(ColumnConstants.COLUMN_TAG.SEC_DESC, UseType.ALL, ColumnConstants.COLUMN_TAG.SEC_DESC));
        columnSet.columns.push(ColumnConfig.createColumn(ColumnConstants.COLUMN_TAG.CUSIP, UseType.ALL, ColumnConstants.COLUMN_TAG.CUSIP));
        columnSet.columns = columnSet.columns.concat(parentWidgetColumns);
        spriteletWidget.dataStore.metaData.inputs.set(WidgetInputType.COLUMNS, columnSet);
        let breakdownToUse = null;

        if (breakdowns.length > 0) {
            breakdownToUse = Breakdown.deepCloneAndOptionalStripToSpecifiedLevel(breakdowns[0]);
            if (breakdowns.length > 1 && !breakdowns[1].equals(breakdownToUse)) {
                breakdownToUse.append(Breakdown.deepCloneAndOptionalStripToSpecifiedLevel(breakdowns[1]));
            }
        }
        if (!isNil(breakdownToUse)) {
            spriteletWidget.dataStore.metaData.inputs.set(WidgetInputType.BREAKDOWN_TREE, breakdownToUse);
        }

        report.addWidget(spriteletWidget);
        report.availableDataStores.set(spriteletWidget.dataStore.name, spriteletWidget.dataStore);
    }

    /**
     * Unique action key that maps to a particular spritelet launcher service
     */
    getSpriteletActionKey(): string {
        return WidgetConstants.TABULAR_VIEW_SPRITELET.ACTION_KEY;
    }
}
