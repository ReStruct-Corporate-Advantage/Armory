import {Injectable} from '@angular/core';
import {ColumnConstants, UseType, WidgetConfigType, WidgetInput, WidgetInputType} from '@blk/explore-ui-core';
import {DataRequestConstants} from '@constants/data-request.constants';
import {WidgetDataViewOption} from '@enums/widget-data-view-option.enum';
import {Widget} from '@models/widget/widget.model';
import {ExploreDataRequestService} from '@services/widget-data/explore-data-request.service';
import {AbstractWidgetService} from '@services/widget/abstract-widget.service';
import {RequestAdapterConfig} from '@interfaces/request.interface';
import {ExploreResponse} from '@interfaces/response.interface';
import {createTreeCube, DataCubeContext} from '@utils/qbstr';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {Report} from '@models/workspace/report.model';
import {Notification} from '@models/widget/notification.model';
import {CommitmentRiskWidgetService} from '@services/widget/commitment-risk-widget.service';
import {ColumnSet} from '@blk/explore-ui-column-option';
import {cloneDeep} from 'lodash';

/**
 * Service to retrieve data for the commitment risk excluded funds spritelet widget
 */
@Injectable()
export class CommitmentRiskExcludedFundsWidgetService extends AbstractWidgetService {

    constructor(protected exploreDataRequestService: ExploreDataRequestService) {
        super(DataRequestConstants.DATA_REQUEST_URL.COMMITMENT_RISK_EXCLUDED_FUNDS, exploreDataRequestService, [WidgetConfigType.COMMITMENT_RISK_EXCLUDED_FUNDS], WidgetDataViewOption.NOT_APPLICABLE);
    }

    protected modifyWidgetInputsForRequest(widgetInputs: Map<string, WidgetInput>, widget: Widget, isExportRequest?: boolean): void {
        if (isExportRequest) {
            // when exporting, add additional column "Supported APACS Asset Type" so a user knows if the Asset Type is supported by ACRM
            // for non-export requests this will be added as a hidden column and is used to add a badge to "APACS Asset Type" column cells
            const columnSet = cloneDeep(widgetInputs.get(WidgetInputType.COLUMNS) as ColumnSet);
            columnSet.createColumnAndAdd(ColumnConstants.ACRM_SUPPORTED_APACS_ASSET_TYPE, UseType.ALL, ColumnConstants.ACRM_SUPPORTED_APACS_ASSET_TYPE);

            widgetInputs.set(WidgetInputType.COLUMNS, columnSet);
        }
    }

    /**
     * Validates inputs
     * @see AbstractWidgetService.validateInputs
     */
    protected validateInputs(widget: Widget, portfolio: Portfolio, report: Report): Notification {
        // same workflows unsupported as normal Commitment Risk widget
        return CommitmentRiskWidgetService.checkUnsupportedWorkflows(portfolio, report) || super.validateInputs(widget, portfolio, report);
    }

    /**
     * Use TreeCube for commitment risk table, so overriding how the tree is created.
     */
    protected createCube(requestAdapterConfig: RequestAdapterConfig, response: ExploreResponse): DataCubeContext {
        return createTreeCube(requestAdapterConfig, response);
    }
}
