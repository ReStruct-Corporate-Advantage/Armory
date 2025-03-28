import {ColumnSet, FactorSettingsColumnOption, LibColumnUtils} from '@blk/explore-ui-column-option';
import {
    AlertConstants,
    ColumnConstants,
    ColumnDefinition,
    DateFormatConstants,
    TokenConstants,
    TokenUtils,
    WidgetConfigType,
    WidgetInputType
} from '@blk/explore-ui-core';
import {NotificationConstants} from '@constants/notification.constants';
import {ConfigUtils} from '@utils/config.utils';
import {isEmpty, isNil} from 'lodash';
import {Portfolio} from '../portfolio/portfolio.model';
import {Notification} from '../widget/notification.model';
import {BaseWidgetInputValidator} from './base-widget-input-validator.model';
import moment from 'moment';
import {DefinitionsStore} from '@stores/definitions.store';
import {isNotNullOrUndefined} from 'codelyzer/util/isNotNullOrUndefined';
import {LookthroughConstants} from '@blk/explore-ui-look-through-settings';
import {RiskSettings} from '@blk/explore-ui-risk';
import {ColumnUtils} from '@utils/column.utils';
import {Widget} from '@models/widget/widget.model';
import {MultiManagerUtils} from '@utils/multi-manager.utils';
import {Breakdown} from '@blk/explore-ui-breakdown';
import {
    MultiManagerBreakdownUtils
} from '../../../../projects/explore-ui-breakdown/src/utils/multi-manager-breakdown.utils';

export class ColumnSetValidator extends BaseWidgetInputValidator {
    validateInputForWarning(widgetInput: ColumnSet): string[] {
        const notifications = this._validateAssetClassCovariance(widgetInput);
        return notifications.length > 0 ? notifications : null;
    }

    private validateLookthroughSettings(columnSet: ColumnSet, portfolio: Portfolio): string {
        for (const widgetColumnConfig of columnSet.columns) {
            const colDef: ColumnDefinition = LibColumnUtils.getColumnDefinition(widgetColumnConfig);
            if (isNil(colDef)) {
                continue;
            }

            const isPerfColumn = colDef.columnType === ColumnConstants.PERF_COLUMN_TYPE;
            if (colDef.columnType === ColumnConstants.RISK_COLUMN_TYPE || isPerfColumn) {
                if (!isPerfColumn && !TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_ENABLE_RISK_DATA_LOOKTHROUGH)) {
                    return NotificationConstants.WORKPAD_LOOKTHROUGH_RISK_NOTIFICATION_MSG_TOKEN_DISABLED;
                } else if (portfolio.lookthroughSettings.ltFilterRulesFav.isCustomizedLT() || portfolio.lookthroughSettings.isBenchLookThroughEnabled) {
                    return isPerfColumn ? NotificationConstants.WORKPAD_LOOKTHROUGH_ERROR_MSG : NotificationConstants.RISK_LOOKTHROUGH_WITH_CUSTOMIZATION_MSG;
                } else if (!isPerfColumn && ConfigUtils.isColumnBreakdownPortfolioBreakdown(widgetColumnConfig)) {
                    return NotificationConstants.PORTFOLIO_RISK_PORTNAME_BREAKDOWN;
                } else if (!isPerfColumn && portfolio.lookthroughSettings.ltProxies.find(ltProxy => ltProxy !== LookthroughConstants.RISK_PROXY)) {
                    return NotificationConstants.RISK_LOOKTHROUGH_OTHER_THEN_RISK_PROXY;
                }
            }
        }
        return null;
    }

    private validatePerformanceColumns(columnSet: ColumnSet): string {
        // validates are returns error message when one of the column is PRAADA column and column breakdown is macro factor for that column.
        if (!isNil(columnSet.columns.find(columnConfig => columnConfig.isPerformanceColumn() && ConfigUtils.isColumnBreakdownMacroFactor(columnConfig)))) {
            return NotificationConstants.MACRO_FACTOR_BREAKDOWN_WITH_PERFORMANCE_COL_MSG;
        }
        return null;
    }

    private validateColumnOptions(columnSet: ColumnSet): string {
        for (const widgetColumnConfig of columnSet.columns) {
            const validationMessage: string = widgetColumnConfig.validateColumnOptionsToProceed();
            if (!isEmpty(validationMessage)) {
                return validationMessage;
            }
        }
        return null;
    }

    /**
     * validates column set and returns a notification in case of an error
     */
    validateInput(columnSet: ColumnSet, portfolio?: Portfolio, widget?: Widget): Notification {
        let notificationMessage: string;

        if (portfolio && portfolio.lookthroughSettings.isAnyLookthroughEnabled()) {
            notificationMessage = this.validateLookthroughSettings(columnSet, portfolio);
        }

        if (!notificationMessage) {
            notificationMessage = this.validatePerformanceColumns(columnSet);
        }

        if (!notificationMessage) {
            notificationMessage = this.validateRASColumns(portfolio, columnSet);
        }

        if (!notificationMessage) {
            notificationMessage = this.validateColumnOptions(columnSet);
        }

        if (!notificationMessage) {
            if (!!portfolio?.decisionLevelsConfig?.topDownCols?.length && widget.configType === WidgetConfigType.PGS
                && columnSet.columns?.some(column => ColumnUtils.isMultiManagerEnabledColumn(column))) {
                notificationMessage = NotificationConstants.PGS_MULTI_MANAGER_COLUMNS_NOT_SUPPORTED;
            }
        }
        notificationMessage = this.validateMultiManagerColumns(widget, notificationMessage, columnSet, portfolio);

        return notificationMessage ? new Notification(`${notificationMessage} ${AlertConstants.NOTIFICATION_STYLE.ERROR}`, notificationMessage, AlertConstants.NOTIFICATION_STYLE.ERROR) : null;
    }

    /**
     * Validates the columns for Multi Manager decomposition
     * @param widget
     * @param notificationMessage
     * @param columnSet
     * @param portfolio
     * @private
     */
    private validateMultiManagerColumns(widget: Widget, notificationMessage: string, columnSet: ColumnSet, portfolio: Portfolio) {
        // We retrieve the breakdown tree from the widget input
        const widgetBreakdown: Breakdown = widget?.dataStore.metaData.inputs.get(WidgetInputType.BREAKDOWN_TREE) as Breakdown;
        if (!notificationMessage && widget?.configType === WidgetConfigType.RISK_EXPOSURE && columnSet.columns?.some(column => MultiManagerUtils.columnContainsMultiManagerOptions(column))) {
            //The breakdown we send for getDecisionBenchData call when we have decision levels set
            const decisionBenchBreakdownTree = MultiManagerBreakdownUtils.createBreakdownTreeForDecisionBenchData(portfolio.decisionLevelsConfig?.portTreeDecisionLevelOption, portfolio.decisionLevelsConfig?.topDownCols);
            if (isEmpty(portfolio?.decisionLevelsConfig?.decisionBenchMap)) {
                //If there are no decision levels, then we should check if widget breakdown has portfolio attributes or portfolio tree as breakdown
                if (!MultiManagerUtils.isValidMMBreakdown(widgetBreakdown)) {
                    notificationMessage = NotificationConstants.MM_DECOMPOSITION_NOT_SUPPORTED_WITHOUT_BREAKDOWN;
                }
                //If there are decision levels set, then we should check if the widget breakdown is same as  decision bench breakdown
            } else if (!MultiManagerUtils.compareChildren(decisionBenchBreakdownTree?.children, widgetBreakdown?.children)) {
                notificationMessage = NotificationConstants.INCOMPATIBLE_BREAKDOWN_FOR_MM_DECOMPOSITION;
            }
        }
        return notificationMessage;
    }

    private validateRASColumns(portfolio: Portfolio, columnSet: ColumnSet): string {
        const rasCutoffDate = DefinitionsStore.rasCutoffDate;
        if (isNotNullOrUndefined(rasCutoffDate) && isNotNullOrUndefined(portfolio) && isNotNullOrUndefined(portfolio.datePicker)) {
            const portfolioDate = portfolio.datePicker;
            const currentDateMoment = moment(portfolioDate.date, DateFormatConstants.MMDDYYYY_SLASH, true);
            const cutOffDate = moment(rasCutoffDate, DateFormatConstants.MMDDYYYY_SLASH, true);
            for (const widgetColumnConfig of columnSet.columns) {
                const colDef: ColumnDefinition = LibColumnUtils.getColumnDefinition(widgetColumnConfig);
                if (isNil(colDef) || !colDef.isRASColumn || cutOffDate.isSameOrBefore(currentDateMoment)) {
                    continue;
                }
                return NotificationConstants.RAS_RISK_COLUMNS_BEYOND_DATE_ERROR(widgetColumnConfig.columnTitle, rasCutoffDate);
            }
        }
    }

    private _validateAssetClassCovariance(columnSet: ColumnSet): string[] {
        const notificationMessages: string[] = [];
        for (const widgetColumnConfig of columnSet.columns) {
            const colDef: ColumnDefinition = LibColumnUtils.getColumnDefinition(widgetColumnConfig);
            const isMCVaRColumn: boolean = colDef?.groups && colDef.groups.length === 2 && colDef.groups[1] === 'Monte Carlo VaR';
            const isDiversificationColumn: boolean = widgetColumnConfig.optionValues.some(optionValue => optionValue instanceof FactorSettingsColumnOption);
            const riskSettings = widgetColumnConfig.optionValues.find(columnOption => columnOption.configType === RiskSettings.CONFIG_TYPE) as RiskSettings;
            if (isMCVaRColumn) {
                if (riskSettings?.advancedRiskSettings?.assetClassCovariance === 'M') {
                    if (!notificationMessages.includes(NotificationConstants.MCVAR_COVAR_MATRIX_NOT_SUPPORTED)) {
                        notificationMessages.push(NotificationConstants.MCVAR_COVAR_MATRIX_NOT_SUPPORTED);
                    }
                }
            } else if (isDiversificationColumn) {
                if (riskSettings?.advancedRiskSettings?.assetClassCovariance === 'M' || riskSettings?.advancedRiskSettings?.assetClassCovariance === 'N') {
                    if (!notificationMessages.includes(NotificationConstants.DIVERSIFICATION_COVAR_MATRIX_NOT_SUPPORTED)) {
                        notificationMessages.push(NotificationConstants.DIVERSIFICATION_COVAR_MATRIX_NOT_SUPPORTED);
                    }
                }
            }
        }
        return notificationMessages;
    }
}
