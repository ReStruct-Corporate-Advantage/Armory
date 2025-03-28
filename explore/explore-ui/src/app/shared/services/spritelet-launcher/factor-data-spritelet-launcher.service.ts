import {Injectable} from '@angular/core';
import {
    ColumnConfig,
    ColumnConstants,
    ColumnDefinition,
    CoreWidgetConfigStore,
    ErrorTypeConstants,
    WidgetConfigType,
    WidgetInputType
} from '@blk/explore-ui-core';
import {WidgetDataStoreMetaData} from '@models/dataStore/widget-data-store-meta-data.model';
import {SpriteletEvent} from '@models/spritelets/spritelet-event.model';
import {Widget} from '@models/widget/widget.model';
import {AbstractSpriteletLauncherService} from '@services/spritelet-launcher/abstract-spritelet-launcher.service';
import {GetContextMenuItemsParams, IRowNode} from 'ag-grid-community';
import {FactorDataChartSettings} from '@models/widget/inputs/chart-settings/factor-data-chart-settings.model';
import {WidgetConstants} from '@constants/widget.constants';
import {ColumnSet} from '@blk/explore-ui-column-option';
import {WorkspaceStore} from '@stores/workspace.store';
import {isNil} from 'lodash';
import {FactorTimeSeriesSelectedOption} from '@enums/factor-time-series-selected-option.enum';
import {ShowAsChartInput} from '@models/widget/inputs/show-as-chart-input.model';
import {NotificationService} from '@services/notification';
import {NotificationConstants} from '@constants/notification.constants';

/**
 * Launches Factor Data child spritelet from parent FBA widget
 */
@Injectable()
export class FactorDataSpriteletLauncherService extends AbstractSpriteletLauncherService {

    private readonly FACTOR_TITLE_COLUMN_TAG = 'rfv_ftitle_long';
    private readonly FACTOR_TAG_COLUMN_TAG = 'rfv_factor_tag';
    private factorTitleKey: string;
    private factorTagKey: string;

    constructor(protected notificationService: NotificationService) {
        super();
    }

    /**
     * Action key for spritelet
     */
    getSpriteletActionKey(): string {
        return WidgetConfigType.FACTOR_DATA;
    }

    /**
     * Creates factor data spritelet from parent FBA widget
     * @param widget  Parent FBA widget
     * @param event  Row event from grid
     * @param _callbackMethod  Callback for after spritelet is created
     */
    launchSpritelet(widget: Widget, event: SpriteletEvent, _callbackMethod?: (any) => void): void {
        const gridParams = event.params as GetContextMenuItemsParams;

        const factorTitleCol = widget.dataStore.data.requestConfig.columns.find(column => column.columnTag === this.FACTOR_TITLE_COLUMN_TAG);
        const factorTagCol = widget.dataStore.data.requestConfig.columns.find(column => column.columnTag === this.FACTOR_TAG_COLUMN_TAG);
        this.factorTitleKey = factorTitleCol?.columnKey;
        this.factorTagKey = factorTagCol?.columnKey;

        const rowDataList: any[] = widget.dataStore.data.cube.getData(widget.dataStore.data.cube.keys()[0]);

        const selectedFactorsSet = new Map<string, string>();

        this.populateSelectedFactors(widget.dataStore.data.breakdownLevels, gridParams.node, rowDataList, selectedFactorsSet);

        if (selectedFactorsSet.size === 0) {
            this.notificationService.error(NotificationConstants.FACTOR_DATA_LAUNCH_ERROR_FOR_MATRIX_COLUMNS, ErrorTypeConstants.UI_VALIDATION_ERROR, undefined, true);
            return;
        }

        const childWidgetConfig = CoreWidgetConfigStore.getChartConfigForType(WidgetConfigType.FACTOR_DATA);

        const childWidget: Widget = new Widget(WidgetConfigType.FACTOR_DATA);
        childWidget.title = childWidgetConfig.title;

        const columnSet = new ColumnSet();
        columnSet.columns = this.createFactorDefinitions(selectedFactorsSet);

        childWidget.dataStore.metaData.inputs.set(WidgetInputType.COLUMNS, columnSet);

        this.initializeChildWidgetInputs(event.callbackMethodName as FactorTimeSeriesSelectedOption, childWidget.dataStore.metaData);

        this.addSpriteletWidgetToReport(widget, childWidget, WorkspaceStore.getCurrentReport());
    }

    private createFactorDefinitions(selectedFactorsSet: Map<string, string>): ColumnConfig[] {
        const factors: ColumnConfig[] = [];
        selectedFactorsSet.forEach((value, key) => {
            const col = new ColumnDefinition();
            col.title = value;
            col.columnTag = key;
            col.uses = ColumnConstants.FACTOR_MODEL;
            const column = ColumnConfig.createColumnFromColumnDefinition(col);
            factors.push(column);
        });
        return factors;
    }

    private populateSelectedFactors(breakdownLevels: string[], node: IRowNode, rowDataList: any[], selectedFactorsSet: Map<string, string> ): void {
        if (!node.group) {
            if (!isNil(node.groupData) && !isNil(node.groupData[ColumnConstants.AGGRID_AUTO_COLUMN])) {
                return;
            }
            if (isNil(selectedFactorsSet.get(node.data[this.factorTagKey]))) {
                selectedFactorsSet.set(node.data[this.factorTagKey], node.data[this.factorTitleKey]);
            }
            return;
        }

        const levelsToCheck = breakdownLevels.filter(level => !isNil(node.data[level])).map(level => level);

        rowDataList.filter(rowData => {
            let check = true;
            levelsToCheck.forEach(level => {
                check = check && (node.data[level] === rowData[level]);
            });
            return check;
        }).forEach(rowData => {
            if (isNil(selectedFactorsSet.get(rowData[this.factorTagKey]))) {
                selectedFactorsSet.set(rowData[this.factorTagKey], rowData[this.factorTitleKey]);
            }
        });
    }

    private initializeChildWidgetInputs(selectedMode: FactorTimeSeriesSelectedOption, spriteletMetaData: WidgetDataStoreMetaData ): void {
        const showAsChartInput = new ShowAsChartInput();
        const factorDataChartSettings = new FactorDataChartSettings();
        if (selectedMode === WidgetConstants.RISK_MATRIX.ACTION_KEY) {
            factorDataChartSettings.isTimeSeriesMode = false;
            factorDataChartSettings.factorTimeSeriesSelectedOption = FactorTimeSeriesSelectedOption.CORRELATIONS;
            showAsChartInput.showAsChart = false;
        } else {
            factorDataChartSettings.isTimeSeriesMode = true;
            factorDataChartSettings.factorTimeSeriesSelectedOption = selectedMode;
            showAsChartInput.showAsChart = true;
        }
        factorDataChartSettings.isDefaultWidgetSettingsModalOpen = true;

        spriteletMetaData.inputs.set(FactorDataChartSettings.configType, factorDataChartSettings);
        spriteletMetaData.inputs.set(ShowAsChartInput.configType, showAsChartInput);
    }

}
