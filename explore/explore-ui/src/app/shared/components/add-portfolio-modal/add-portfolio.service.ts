import {Injectable} from '@angular/core';
import {ReportGroup} from '@models/workspace/report-group.model';
import {AdhocPortParams} from '@models/portfolio/adhocModelling/adhoc-port-params.model';
import {Security} from '@interfaces/security.interface';
import {PortfolioSearchItem} from '@blk/explore-ui-portfolio-search';
import {IndexSearchTreeItem} from '@models/portfolio/index-search-tree-item.model';
import {WhatIfPortfolio} from '@models/portfolio/what-if-portfolio.model';
import {FactorExposureChange} from '@models/portfolio/composition/factor-exposure-change.model';

/**
 * Add Portfolio Service
 *  holds data (report group list, checked report group list, and selected portfolio tickers) used in add portfolio modal
 */
@Injectable()
export class AddPortfolioService {
    // variables for middle column to track portfolios and indexes to add
    selectedPortfolioTickers = new Set<PortfolioSearchItem|IndexSearchTreeItem|AdhocPortParams>();

    // Variables for right column to add report groups
    reportGroupList: ReportGroup[] = [];
    checkedReportGroupList: ReportGroup[] = [];

    // Custom portfolio tab variables
    selectedSecurities = new Map<string, Security>();
    adhocPortfoliosList = new Map<AdhocPortParams, WhatIfPortfolio>();
    factorToExposureMap = new Map<string, FactorExposureChange>();

    /**
     * Clears all data entered in the add portfolio modal
     */
    clear(): void {
        this.selectedPortfolioTickers.clear();

        // only clear checked report groups, not all report groups
        this.checkedReportGroupList = [];

        this.selectedSecurities.clear();
        this.adhocPortfoliosList.clear();
        this.factorToExposureMap.clear();
    }
}
