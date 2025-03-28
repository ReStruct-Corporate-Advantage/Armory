import {Injectable} from '@angular/core';
import {FavoriteUtils} from '@utils/favorite.utils';
import {forkJoin, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {BaseWorkpad} from '@models/workspace/base-workpad.model';
import {Report} from '@models/workspace/report.model';
import {CoreFavoriteUtils} from '@blk/explore-ui-core';
import {WorkspaceStore} from '../../../stores';
import {FavoriteService} from '../favorite';

/**
 * Report Service
 */
@Injectable({
    providedIn: 'root'
})
export class ReportService {

    constructor(private favoriteService: FavoriteService) {
    }

    /**
     * add Curated Reports
     * index is passed from add-portfolio-modal if more than one portfolio are added, so we can update currentReport of the first portfolio ONLY
     */
    addCuratedReports$(workpad: BaseWorkpad, curatedReportFavorites?: string[] | string, index?: number): Observable<void> {
        const observableQueue = [];

        if (curatedReportFavorites) {
            // Rarely, a single curated report favorite id will be passed through as a string
            // (during DEV refresh and if only one curated report is mandated)
            // This will check and push the id into an array so we can iterate
            if (!Array.isArray(curatedReportFavorites)) {
                curatedReportFavorites = [curatedReportFavorites];
            }

            for (const fav of curatedReportFavorites) {
                const flagId = FavoriteUtils.splitFlagIdForFavorite(fav);
                observableQueue.push(this.favoriteService.getFavorite$(flagId.id, null, CoreFavoriteUtils.isGlobalFavorite(flagId.owner)));
            }
        }

        return forkJoin(observableQueue)
            .pipe(
                map((reports: Report[]) => {
                    // if we have curated reports then add to the workpad and update current report
                    if (reports) {
                        workpad.addReports(reports);

                        // if multiple portfolios are added at the same time, update current report for the first portfolio ONLY
                        if (!index) {
                            // we are using WorkspaceStore.updateCurrentWorkpad() with given set of arguments
                            // instead of using WorkspaceStore.updateCurrentReport()
                            // as we need to have correctly updated reference to the current workpad
                            // in order to update the active report
                            WorkspaceStore.updateCurrentWorkpad(workpad, null, reports[0]);
                        }
                    }
                    return null;
                })
            );
    }

    /**
     * load favorite report
     * this function is used as callback so need arrow to get the right scope
     */
    loadFavoriteReport = (reportId: number, loadingMessage: string, forceRefresh?: boolean, isGlobalFavorite?: boolean): void => {
        this.loadFavoriteReportVersion(reportId, loadingMessage, forceRefresh, isGlobalFavorite);
    };

    /**
     * load favorite report
     * this function is used as callback so need arrow to get the right scope
     */
    loadFavoriteReportVersion = (reportId: string|number, loadingMessage: string, forceRefresh?: boolean, isGlobalFavorite?: boolean, versionId?: string): void => {
        this.favoriteService.getFavorite$(reportId, loadingMessage, isGlobalFavorite, forceRefresh, versionId)
            .subscribe((report: Report) => {
                WorkspaceStore.replaceCurrentReport(report);
            }, error => {
                console.error(error);
            });
    };
}
