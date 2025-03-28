import {AbstractWidgetService} from '@services/widget/abstract-widget.service';
import {WidgetDataViewOption} from '@enums/widget-data-view-option.enum';
import {Widget} from '@models/widget/widget.model';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {Report} from '@models/workspace/report.model';
import {Notification} from '@models/widget/notification.model';
import {AlertConstants, ErrorTypeConstants, UIErrorParameters, WidgetConfigType} from '@blk/explore-ui-core';
import {ExploreDataRequestService} from '@services/widget-data/explore-data-request.service';
import {WorkspaceStore} from '@stores/workspace.store';

/**
 * A base service for the ex-post widgets
 */
export abstract class AbstractExpostWidgetDataService extends AbstractWidgetService {
    /**
     * Creates a new instance with the given parameters
     * @see constructor in AbstractWidgetService
     */
    constructor(
        protected baseUrl: string,
        protected exploreDataRequestService: ExploreDataRequestService,
        protected widgetConfigTypes: WidgetConfigType[],
        protected widgetDataViewOption: WidgetDataViewOption
    ) {
        super(baseUrl, exploreDataRequestService, widgetConfigTypes, widgetDataViewOption);
    }

    /**
     * expost-time and expost-return have identifierColumn as null
     * Method is overridden in expost-stat
     */
    getIdentifierColumn() {
        return null;
    }

    /**
     * Validates inputs
     * @see AbstractWidgetService.validateInputs
     */
    protected validateInputs(widget: Widget, portfolio: Portfolio, report: Report): Notification {
        if (WorkspaceStore.getCurrentWorkpad()?.isCompareMode(report.comparisonConfigId)) {
            return Notification.createErrorNotification(AlertConstants.NOTIFICATION.COMPARISON_MODE_NOT_SUPPORT.EXPOST, ErrorTypeConstants.UI_VALIDATION_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_IS_ON_COMPARE_MODE_ERROR);
        }

        // Custom Portfolio Groups are not supported by Expost widgets
        //
        // TODO the below IF statement needs to change to "if (portfolio.isCustomPortGroup() && !widget.callForSpreadsheet)"
        // when we implement exporting. And the below comments then will be applicable to the IF statement.
        //
        // However, if the request is for Excel export purposes (callForSpreadsheet), let it go through
        // The reason is because the batch process sends one request per widget for a given batch row.
        // If the batch row is set to runAs 'Portfolios' with a custom Port Group, we still only send one request
        // The backend will take care of splitting the portfolios up. So we must create a widgetDataRequest
        // even though the portfolio is a custom port group and send it as part of the batch request.
        //
        // One technical issue, however, is that the callForSpreadsheet flag is sort of incomplete
        // in the sense that it would technically allow single-widget exports for expost widgets that are custom port group.
        // However, that workflow will fail anyway before it gets here as there is no tableData to generate rowData for.
        // The widget errors out during a normal data request. Thus, introducing just the callForSpreadsheet flag
        // is sufficient for allowing expost data requests to be generated for custom port groups.
        if (portfolio.isCustomPortGroup()) {
            return Notification.createErrorNotification(AlertConstants.NOTIFICATION.CUSTOM_PORTGROUP_NOT_SUPPORT.EXPOST, ErrorTypeConstants.UI_VALIDATION_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_IS_CUSTOM_PORT_GROUP_ERROR);
        }

        // Expost widget's specific inputs are valid, let now the parent validate the common inputs
        return super.validateInputs(widget, portfolio, report);
    }
}
