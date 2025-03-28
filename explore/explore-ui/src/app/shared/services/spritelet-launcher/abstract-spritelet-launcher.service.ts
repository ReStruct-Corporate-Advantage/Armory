import {Widget} from '@models/widget/widget.model';
import {SpriteletEvent} from '@models/spritelets/spritelet-event.model';
import {Report} from '@models/workspace/report.model';
import {WidgetConstants} from '@constants/widget.constants';
import {IRowNode} from 'ag-grid-community';
import {TableBreakdown} from '@interfaces/table-breakdown.interface';
import {WidgetDataStoreMetaData} from '@models/dataStore/widget-data-store-meta-data.model';
import {ColumnConfig, ColumnConstants, CoreColumnUtils, UseType, WidgetConfigType} from '@blk/explore-ui-core';
import {ColumnSet} from '@blk/explore-ui-column-option';
import {isEmpty} from 'lodash';
import {LEVEL_KEY, ROOT_LEVEL} from '@utils/qbstr';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {CommonConstants} from '@constants/common.constants';

/**
 * Base class for all spritelet launcher services
 */
export abstract class AbstractSpriteletLauncherService {

    /**
     * Method invoked to launch a spritelet
     */
    abstract launchSpritelet(widget: Widget, event: SpriteletEvent, callbackMethod?: (any) => void): void;

    /**
     * Unique action key that maps to a particular spritelet launcher service
     */
    abstract getSpriteletActionKey(): string;

    /**
     * Add the newly created spritelet widget to the report
     */
    protected addSpriteletWidgetToReport(widget: Widget, spriteletWidget: Widget, report: Report) {
        // Try to open the spritelet in the same row next to the parent widget but if now space is available open in the next row as the first widget
        if (WidgetConstants.GRIDSTER_CONSTANTS.MAX_COLS - (widget.dimensions.cols + widget.dimensions.x) >= WidgetConstants.GRIDSTER_CONSTANTS.DEFAULT_ITEM_COLS) {
            // place to right of parent widget
            spriteletWidget.dimensions.y = widget.dimensions.y;
            spriteletWidget.dimensions.x = widget.dimensions.cols + widget.dimensions.x;
        } else {
            // place below parent widget
            spriteletWidget.dimensions.y = widget.dimensions.rows + widget.dimensions.y;
            spriteletWidget.dimensions.x = widget.dimensions.x;
        }
        report.addWidget(spriteletWidget);
        report.availableDataStores.set(spriteletWidget.dataStore.name, spriteletWidget.dataStore);
    }

    /**
     * Gets the path from the _ROOT_ level down to the node that was selected
     * @param node  Node selected
     * @param path  Result array containing path down to node
     * @param leafKey Key used to specify leaf level value. Use column with unique values like rfv_block_path
     */
    protected getParentPath(node: IRowNode, path: TableBreakdown[], leafKey?: string): void {
        if (node.level > 0) {
            this.getParentPath(node.parent, path, leafKey);
        }
        // leaf node will not be included in path
        if (node.group) {
            // group node
            path.push({
                level: node.field,
                value: node.key
            });
        } else if (!node.group && leafKey) {
            // leaf node, when launched from lowest level
            // NOTE- here we assume leafKey === columnTag (level) === columnKey (value)
            path.push({
                level: leafKey,
                value: node.data[leafKey]
            });
        }
    }

    /**
     * Copies input from one datastore to another
     */
    protected copyWidgetInput(inputName: string, spriteletMetaData: WidgetDataStoreMetaData, parentMetaData: WidgetDataStoreMetaData): void {
        if (parentMetaData.inputs.has(inputName)) {
            spriteletMetaData.inputs.set(inputName, parentMetaData.inputs.get(inputName));
        }
    }

    /**
     * Returns all numerical columns from parent widget
     * @param parentColumnSet  Parent widget ColumnSet
     * @param rowData data for the row that the spritelet is launched on
     * @protected
     */
    protected getParentNumericalColumns(parentColumnSet: ColumnSet, rowData?: any): ColumnConfig[] {
        return parentColumnSet.columns.filter(column => {
            const dataType = CoreColumnUtils.getColumnDefByTag(column.columnTag).dataType;
            return (dataType === ColumnConstants.COLUMN_DATA_TYPE.DOUBLE) || (dataType === ColumnConstants.COLUMN_DATA_TYPE.INT);
        });
    }

    protected resolveRequestedPort(params: any, curentPortfolio: Portfolio, widget: Widget): string {
        let requestedPort: string;
        if (!isEmpty(params.node.data[ColumnConstants.PORTFOLIO_HIDDEN])) {
            requestedPort = params.node.data[ColumnConstants.PORTFOLIO_HIDDEN];
        } else {
            let portNameCol;
            if (widget.configType === WidgetConfigType.PGS) {
                portNameCol = (widget.dataStore.metaData.inputs.get('columns') as ColumnSet).getColumnBasedOnColTagAndUse(ColumnConstants.PORTFOLIO, UseType.ALL);
            } else {
                portNameCol = (widget.dataStore.metaData.inputs.get('columns') as ColumnSet).getColumnBasedOnColTagAndUse(ColumnConstants.COLUMN_TAG.CUSIP, UseType.ALL);
            }
            if (params.column.getColId() === ColumnConstants.ACTION_COL) {
                if (params.node.level === 0) {
                    requestedPort = params.node.data[ROOT_LEVEL];
                } else {
                    requestedPort = (params?.node as any).hasChildren() ? params.node.data[LEVEL_KEY + params.node.level] : params.node.data[portNameCol.columnKey];
                }
            } else {
                requestedPort = this.resolveRequestedPortForNonActionCol(params, portNameCol, curentPortfolio);
            }
        }
        return requestedPort;
    }

    resolveRequestedPortForNonActionCol(params: any, portNameCol: ColumnConfig, currentPortfolio: Portfolio): string {
        // if it's not the action column and is any random column in the PGS apart from portfolio column,
        // then pick the portfolio name from 'portfolio' key in the node data for leaf node
        // and from node key for sector nodes.
        const portName = isEmpty(params.node.data[portNameCol?.columnKey])
            ? params.node.key
            : params.node.data[portNameCol?.columnKey];

        return !isEmpty(portName)
            ? portName
            : params.value?.includes(CommonConstants.TRUNCATION_KEY)
                ? currentPortfolio?.portName
                : params.value;
    }
}
