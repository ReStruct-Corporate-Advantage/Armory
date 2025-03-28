import {WorkspaceStore} from '../stores';
import {AppStore} from '../app.store';
import {ReportGroup} from '@models/workspace/report-group.model';
import {WhatIfPortfolio} from '@models/portfolio/what-if-portfolio.model';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {BaseWorkpad} from '@models/workspace/base-workpad.model';
import {RulesBasedPortfolio} from '@models/portfolio/rule-based-portfolio.model';
import {PortfolioWithPositions} from '@models/portfolio/portfolio-with-positions.model';
import {Workspace} from '@models/workspace/workspace.model';
import {FlatWorkpad} from '@models/workspace/flat-workpad.model';
import {ArrayUtils} from '@utils/array.utils';
import {AdhocPortfolio} from '@models/portfolio/adhoc-portfolio.model';
import {AdhocPortGroup} from '@models/portfolio/adhoc-portgroup.model';
import {isEmpty} from 'lodash';
import {Report} from '@models/workspace/report.model';
import {WorkpadType} from '@enums/workpad-type.enum';
import {CompositionUtils} from '@utils/composition.utils';

/**
 * Workpad Utils
 */
export class WorkpadUtils {
    /**
     * add a new whatIfPortfolio to current workpad
     * @param portfolioTitle to pass your own title
     */
    static addWhatIfPortfolioAndShowComposition(portfolioTitle?: string): WhatIfPortfolio {
        // firstly, update the current workpad to report group if it's a flat workpad
        const rpg: ReportGroup = WorkpadUtils.convertFlatWorkpadToReportGroup(WorkspaceStore.getCurrentWorkpad(), WorkspaceStore.getWorkspace());

        // next, update the new what if portfolio as current
        const newWhatIf: WhatIfPortfolio = WorkpadUtils.addWhatIfPortfolioToReportGroup(rpg, portfolioTitle);
        WorkspaceStore.updateCurrentPortfolio(newWhatIf);
        WorkspaceStore.currentWorkpad$.next(rpg);

        // lastly, since it's a new whatIfPortfolio, set showCompositionModel flag to true
        AppStore.updateShowCompositionModel(true);

        return newWhatIf;
    }

    /**
     * convert flat workpad to report group.
     */
    static convertFlatWorkpadToReportGroup(workpad: BaseWorkpad, workspace: Workspace): ReportGroup {
        // check if the workpad is a report group
        // if yes, return it, as it is
        if (workpad instanceof ReportGroup) {
            return workpad;
        }

        // else put the contents of workpad into report group and update the workpad
        const rpg = new ReportGroup();
        rpg.addPortfolios((workpad as FlatWorkpad).portfolio);
        rpg.addReports(workpad.reports);
        workspace.workpads.splice(workspace.workpads.indexOf(workpad), 1, rpg);
        return rpg;
    }

    /**
     * Method to add portfolio from an existing report group to current workspace
     */
    static dragPortfolioFromReportGroupToWorkspace(portfolioIndex: number, workpadIndex: number, dropIndex: number, type: WorkpadType, topBottomDrop?: string): void {
        const draggedPortfolioReportGroup = WorkspaceStore.getWorkspace().workpads[workpadIndex];
        const portfolio = (draggedPortfolioReportGroup as ReportGroup).portfolios[portfolioIndex];

        const newWorkPad = new FlatWorkpad();
        newWorkPad.addPortfolios(portfolio);
        newWorkPad.addReports(draggedPortfolioReportGroup.reports);
        newWorkPad.activeReport = draggedPortfolioReportGroup.activeReport;

        const workpadDropIndex = this.getDropIndexBasedOnWorkpadTypeAndDropLocation(workpadIndex, dropIndex, type, topBottomDrop);
        WorkspaceStore.getWorkspace().workpads.splice(workpadDropIndex, 0, newWorkPad);
        (draggedPortfolioReportGroup as ReportGroup).removePortfolio(portfolio);
    }

    static getDropIndexBasedOnWorkpadTypeAndDropLocation(workpadIndex: number, dropIndex: number, type: WorkpadType, topBottomDrop?: string): number {
        let workpadDropIndex = -1;
        if (type === WorkpadType.FLAT) {
            workpadDropIndex = dropIndex > workpadIndex ? dropIndex + 1 : dropIndex;
        } else if (type === WorkpadType.REPORT_GROUP && topBottomDrop === 'TOP') {
            workpadDropIndex = dropIndex;
        } else if (type === WorkpadType.REPORT_GROUP && topBottomDrop === 'BOTTOM') {
            workpadDropIndex = dropIndex + 1;
        }
        return workpadDropIndex;
    }

    /**
     * Method to reorder workpad and place it in this current workpad position
     */
    static reorderWorkpad(workpadIndex: number, workpadAtNewIndex: BaseWorkpad) {
        const currentWorkpad = WorkspaceStore.getWorkspace().workpads[workpadIndex];
        if (currentWorkpad) {
            ArrayUtils.moveItemInArray(
                WorkspaceStore.getWorkspace().workpads.indexOf(workpadAtNewIndex),
                currentWorkpad,
                WorkspaceStore.getWorkspace().workpads
            );
            if (WorkspaceStore.getCurrentWorkpad() !== currentWorkpad) {
                WorkspaceStore.validateWorkpadAndUpdate(currentWorkpad);
            }
        }
    }

    /**
     * add a new what if portfolio to the report group
     * @returns newly added whatIfPortfolio
     */
    static addWhatIfPortfolioToReportGroup(currentWorkpad: ReportGroup, portfolioTitle?: string): WhatIfPortfolio {
        const currentPortfolio: Portfolio = WorkspaceStore.getCurrentPortfolio();

        // instantiate new whatIfPortfolio
        let newWhatIfPortfolio: WhatIfPortfolio;
        if (currentPortfolio instanceof AdhocPortGroup) {
            newWhatIfPortfolio = new AdhocPortGroup();
        } else if (currentPortfolio instanceof RulesBasedPortfolio) {
            newWhatIfPortfolio = new RulesBasedPortfolio();
        } else if (currentPortfolio instanceof AdhocPortfolio) {
            newWhatIfPortfolio = new AdhocPortfolio();
        } else if (currentPortfolio instanceof PortfolioWithPositions) {
            newWhatIfPortfolio = new PortfolioWithPositions();
        } else {
            newWhatIfPortfolio = new WhatIfPortfolio();
        }
        // copy properties from current portfolio
        newWhatIfPortfolio.copyFrom(currentPortfolio);
        // setting the addedDuringInitialzination Flag true
        CompositionUtils.markAsAddedDuringWhatIfInitialization(newWhatIfPortfolio);
        // replace the portfolio holding changes with new portfolio holding changes for new whatIfPortfolio
        CompositionUtils.replacePortfolioHoldingChangesForAdhocPortGroup(newWhatIfPortfolio);
        // reset favId - what if shouldn't have same favId as saved parent portfolio
        newWhatIfPortfolio.id = null;
        // assign parent portfolio for new whatIfPortfolio
        newWhatIfPortfolio.parentPortfolio = currentPortfolio instanceof WhatIfPortfolio && currentPortfolio.parentPortfolio
            ? currentPortfolio.parentPortfolio
            : currentPortfolio;

        // Set the parent portfolio for the new what if portfolio
        newWhatIfPortfolio.title = 'What-if '.concat(newWhatIfPortfolio.parentPortfolio.getDisplayTitle());

        // Get the number of what if portfolios in this report group with this parent portfolio
        const whatIfNumber: number = currentWorkpad.getAllPortfolios()
            .filter(port => port instanceof WhatIfPortfolio && port.parentPortfolio === newWhatIfPortfolio.parentPortfolio).length + 1;

        newWhatIfPortfolio.title += ' ' + whatIfNumber;

        if (!isEmpty(portfolioTitle)) {
            newWhatIfPortfolio.title = portfolioTitle;
        }

        // Add this new portfolio just below the current portfolio
        currentWorkpad.addPortfolios(newWhatIfPortfolio, currentWorkpad.getAllPortfolios().indexOf(currentPortfolio) + 1);

        // return newly added whatIfPortfolio
        return newWhatIfPortfolio;
    }

    /**
     * return CompareToPortfolio list
     */
    static getPortfoliosToCompare(report: Report, portfolios: Portfolio[]): Portfolio[] {
        const portfoliosToCompare = [];

        // push portfolio into portfoliosToCompare if the portId is in for each index in comparisonConfig.portComparisonList
        const comparisonConfig = WorkspaceStore.getCurrentWorkpad().comparisonConfigMap.get(report.comparisonConfigId);
        if (comparisonConfig && !isEmpty(comparisonConfig.portComparisonList) && !isEmpty(portfolios)) {
            for (const portfolio of portfolios) {
                if (comparisonConfig.portComparisonList.includes(portfolio.portId)) {
                    portfoliosToCompare.push(portfolio);
                }
            }
        }
        return portfoliosToCompare;
    }
}
