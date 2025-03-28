import {Injectable} from '@angular/core';
import {
    AlertConstants,
    ErrorTypeConstants,
    UIErrorParameters,
    WidgetConfigType,
    WidgetInput,
    WidgetInputType
} from '@blk/explore-ui-core';
import {DataRequestConstants} from '@constants/data-request.constants';
import {WidgetDataViewOption} from '@enums/widget-data-view-option.enum';
import {Widget} from '@models/widget/widget.model';
import {ExploreDataRequestService} from '@services/widget-data/explore-data-request.service';
import {AbstractWidgetService} from '@services/widget/abstract-widget.service';
import {ColumnSet, CustomTitleColumnOption} from '@blk/explore-ui-column-option';
import {MarginAnalyticsCassiniSettings} from '@models/widget/inputs/margin-analytics-cassini-settings.model';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {Report} from '@models/workspace/report.model';
import {Notification} from '@models/widget/notification.model';
import {WorkspaceStore} from '@stores/workspace.store';
import {WhatIfPortfolio} from '@models/portfolio/what-if-portfolio.model';
import {AdhocPortfolio} from '@models/portfolio/adhoc-portfolio.model';
import {AdhocPortGroup} from '@models/portfolio/adhoc-portgroup.model';

/**
 * Service to retrieve data for the margin analytics cassini widget
 */
@Injectable()
export class MarginAnalyticsCassiniService extends AbstractWidgetService {

    constructor(protected exploreDataRequestService: ExploreDataRequestService) {
        super(DataRequestConstants.DATA_REQUEST_URL.CASSINI_MARGIN_ANALYTICS_REQUEST, exploreDataRequestService, [WidgetConfigType.CASSINI_MARGIN_ANALYTICS], WidgetDataViewOption.NOT_APPLICABLE);
    }

    protected modifyWidgetInputsForRequest(widgetInputs: Map<string, WidgetInput>, widget: Widget, isExportRequest?: boolean): void {
        // we want to change the title of first column to grouping style that has been selected
        const originalColumns = widgetInputs.get(WidgetInputType.COLUMNS) as ColumnSet;
        if (!originalColumns) {
            return;
        }

        const marginSettings = widgetInputs.get(MarginAnalyticsCassiniSettings.MARGIN_ANALYTICS_CASSINI_SETTING_CONFIG_TYPE) as MarginAnalyticsCassiniSettings;
        if (!!marginSettings.groupingStyle) {
            const customTitleOption = new CustomTitleColumnOption();
            customTitleOption.customTitle = marginSettings.groupingStyle.replace('_', ' ');  // Trade_Level -> Trade Level
            originalColumns.columns[0].optionValues.push(customTitleOption);
        }
    }

    /**
     * Validates inputs
     * @see AbstractWidgetService.validateInputs
     */
    protected validateInputs(widget: Widget, portfolio: Portfolio, report: Report): Notification {
        if (WorkspaceStore.getCurrentWorkpad()?.isCompareMode(report.comparisonConfigId)) {
            return Notification.createErrorNotification(AlertConstants.NOTIFICATION.COMPARISON_MODE_NOT_SUPPORT.MARGIN_ANALYTICS, ErrorTypeConstants.UI_VALIDATION_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_VALIDATE_INPUTS_MARGIN_ANALYTICS_ERROR);
        }
        if (portfolio.isCustomPortGroup() || portfolio instanceof AdhocPortfolio || portfolio instanceof AdhocPortGroup) {
            return Notification.createErrorNotification(AlertConstants.NOTIFICATION.CUSTOM_PORTGROUP_NOT_SUPPORT.MARGIN_ANALYTICS, ErrorTypeConstants.UI_VALIDATION_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_VALIDATE_INPUTS_MARGIN_ANALYTICS_ERROR);
        }
        if (portfolio instanceof WhatIfPortfolio) {
            return Notification.createErrorNotification(AlertConstants.NOTIFICATION.WHAT_IF_PORTFOLIO_NOT_SUPPORTED.MARGIN_ANALYTICS, ErrorTypeConstants.UI_VALIDATION_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_VALIDATE_INPUTS_MARGIN_ANALYTICS_ERROR);
        }

        // Margin analytic widget's specific inputs are valid, let now the parent validate the common inputs
        return super.validateInputs(widget, portfolio, report);
    }

}
