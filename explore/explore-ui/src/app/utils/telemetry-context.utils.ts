import {WorkspaceStore} from '@stores/workspace.store';
import {WorkpadUtils} from '@utils/workpad.utils';

/**
 * Utils for telemetry context
 */
export class TelemetryContextUtils {
    /**
     * Get analysis context
     */
    static getAnalysisContext(): {portfolioTickers: string[], isComparisonEnabled: boolean, reportTitle: string, reportId: number, reportOwner: string} {
        const currentWorkpad = WorkspaceStore.getCurrentWorkpad();
        const currentPortfolio = WorkspaceStore.getCurrentPortfolio();
        const currentReport = WorkspaceStore.getCurrentReport();
        const isComparisonEnabled = !!currentWorkpad && currentWorkpad.hasComparisonPortfolios(currentReport.comparisonConfigId);

        let portfolioTickers;
        if (currentPortfolio) {
            portfolioTickers = isComparisonEnabled ? WorkpadUtils.getPortfoliosToCompare(currentReport, currentWorkpad.getAllPortfolios()).map(port => port.portName) : [currentPortfolio.portName];
        }

        return {portfolioTickers, isComparisonEnabled, reportTitle: currentReport?.title, reportId: currentReport?.key, reportOwner: currentReport?.owner};
    }




}

