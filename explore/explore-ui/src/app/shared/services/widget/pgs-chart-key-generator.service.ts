import {Injectable} from '@angular/core';
import {SpriteletLauncherServiceRegistry} from '@services/spritelet-launcher/spritelet-launcher-service.registry';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {BaseWorkpad} from '@models/workspace/base-workpad.model';
import {isEmpty, isNil} from 'lodash';
import {RowNode} from 'ag-grid-community';
import {LEVEL_KEY, ROOT_LEVEL} from '@utils/qbstr';
import {ColumnConstants} from '@blk/explore-ui-core';
import {AbstractPgsChartSpriteletLauncherService} from '@services/spritelet-launcher/abstract-pgs-chart-spritelet-launcher.service';
import {ChartUtils} from '@utils/chart.utils';
import {CommonConstants} from '@constants/common.constants';
import {Widget} from '@models/widget/widget.model';
import {PortfolioOverrideInput} from '@models/widget/inputs/portfolio-override-input.model';
import {FilterIncludeKey} from '@qbstr/data-cube';
import {TabularWidgetConstants} from '@constants/tabular-widget.constants';

@Injectable()
export class PgsChartKeyGeneratorService {
    constructor(private spriteletLauncherRegistry: SpriteletLauncherServiceRegistry) {
    }

    public updatePGSChartKeys(currentPortfolio: Portfolio, currentWorkpad: BaseWorkpad) {
        const report = isNil(currentWorkpad?.activeReport) ? currentWorkpad?.reports[0] : currentWorkpad?.activeReport;
        if (isNil(currentPortfolio) || isNil(report)) {
            console.error('Portfolio or report is not available');
            return;
        }
        report?.widgets?.forEach(widget => {
            if (ChartUtils.isPGSSpritletWidget(widget.configType)) {
                // if we have legacy favorites which already have customVizConfig populated, do nothing
                if (this.isValidCustomViz(widget.dataStore?.data?.customVizConfig, currentPortfolio.portName) && widget.pgsChartPortfolio === currentPortfolio.portName) {
                    return;
                }
                // Create mock rowNode so that we can use existing spritelet launcher to set custom viz config
                const rowNode = new RowNode(null);
                let hasChildren = false;
                const data = {};
                data[ROOT_LEVEL] = currentPortfolio.portName;
                hasChildren = this.populateRowNode(widget, currentPortfolio, rowNode, data, hasChildren);
                rowNode.data = data;
                rowNode.level = widget.pgsChartInputs.level;
                rowNode.hasChildren = () => hasChildren;
                widget.dataStore.metaData.inputs.set('portfolioOverrideInput', new PortfolioOverrideInput({'portfolio': currentPortfolio.portName}));
                (this.spriteletLauncherRegistry.getSpriteletLauncherService(widget.pgsChartInputs.actionKey) as AbstractPgsChartSpriteletLauncherService).setCustomVizConfigSettings(rowNode, widget, false);
            }
        });
    }

    /**
     * Populate row node for PGS chart spritelet customVizConfig creator
     * @param widget
     * @param currentPortfolio
     * @param rowNode
     * @param data
     * @param hasChildren
     * @private
     */
    private populateRowNode(widget: Widget, currentPortfolio: Portfolio, rowNode: RowNode, data: any, hasChildren: boolean): boolean {
        // if we are here for the same portfolio, then we don't need to update the custom viz config
        if (widget.pgsChartPortfolio === currentPortfolio.portName) {
            if (!isEmpty(widget.pgsChartInputs.portHierarchy)) {
                const portfolios = widget.pgsChartInputs.portHierarchy.split(CommonConstants.ARROW_OPERATOR);
                this.createRowNode(currentPortfolio, data, portfolios);
                // '|' in portHierarchy signifies that last element has children. Set correspondingly in rowNode and remove 'portfolio' key as that is only for leaf level ports
                if (currentPortfolio.isPortfolioGroup && portfolios[portfolios.length - 1].includes(CommonConstants.COLUMN_KEY_SPLITTER)) {
                    hasChildren = true;
                    delete data[ColumnConstants.PORTFOLIO];
                }
                rowNode.key = portfolios[portfolios.length - 1].split(CommonConstants.COLUMN_KEY_SPLITTER)[0];
            }
        } else if (widget.pgsChartInputs.level === 0) {
            this.createRowNode(currentPortfolio, data, []);
            rowNode.level = 0;
            rowNode.key = currentPortfolio.portName;
            // for a portfolio group, we need to set hasChildren to true and remove 'portfolio' key as that is only for leaf level ports
            hasChildren = currentPortfolio.isPortfolioGroup;
            if (hasChildren && !isNil(data[ColumnConstants.PORTFOLIO])) {
                delete data[ColumnConstants.PORTFOLIO];
            }
        }
        return hasChildren;
    }
    /**
     * Create row node for PGS chart spritelet customVizConfig creator
     * as well as return depth of portfolio tree
     * @param portfolio
     * @param level
     * @param data
     * @param depth
     * @param portHierarchy
     * @private
     */
    private createRowNode(portfolio: Portfolio, data: any, portHierarchy?: string[]): void {
        if (portfolio.isPortfolioGroup && !isEmpty(portHierarchy)) {
            portHierarchy.forEach((port, index) => {
                const portfolioName = port.split(CommonConstants.COLUMN_KEY_SPLITTER)[0];
                if (!port.includes(CommonConstants.COLUMN_KEY_SPLITTER)) {
                    data[ColumnConstants.PORTFOLIO] = portfolioName;
                } else if (index !== 0) {
                    data[LEVEL_KEY + index] = portfolioName;
                }
            });
        } else {
            data[ColumnConstants.PORTFOLIO] = portfolio.portName;
        }
    }

    /**
     * Check if the custom viz config is valid for the current portfolio
     * @param customVizConfig
     * @param portName
     * @private
     */
    private isValidCustomViz(customVizConfig: any, portName: string): boolean {
        const rootKey = customVizConfig?.queryKeys?.find(key => key instanceof FilterIncludeKey && key.field === ROOT_LEVEL);
        return !isNil(rootKey) && rootKey.includes.includes(portName);
    }
}
