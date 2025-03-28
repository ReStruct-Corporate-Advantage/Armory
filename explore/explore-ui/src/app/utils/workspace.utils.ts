import {ExploreConstants, URLConstants} from '../constants';
import {Report} from '../models/workspace/report.model';
import {Portfolio} from '../models/portfolio/portfolio.model';
import {AppUtils} from './app.utils';
import {Workspace} from '@models/workspace/workspace.model';
import {SaveFavoriteAction} from '@models/favorite/save-favorite-action.model';
import {FavoriteConstants} from '@constants/favorite.constants';
import {FavoriteType} from '@blk/explore-ui-core';
import {DeleteFavoriteAction} from '@models/favorite/delete-favorite-action.model';

export class WorkspaceUtils {

    /**
     * Return the mandate report favorites for the given portfolio
     */
    static getCuratedReportFavorites(port: Portfolio):  Array<string> {
        // Check if load of curated reports is disabled
        if (AppUtils.getURLParamWithDefault(URLConstants.LOAD_CURATED_REPORTS, true) === 'false') {
            return [];
        }

        return port.mandateSettings ? port.mandateSettings.settings.get(FavoriteType.CURATED_REPORTS) as Array<string> : [];
    }

    /**
     * Function to get a new report title based on the prefix and the number of reports in the reportGroup
     */
    static getNewReportTitle(reports: Report[]): string {
        // Now figure out the number of reports in this reportGroup and assign a number
        const reportNum = this.getNewObjectNumber(reports, ExploreConstants.NEW_REPORT_TITLE, reports.length + 1);
        // Add the number to the reportNum title
        return ExploreConstants.NEW_REPORT_TITLE  + ' ' + reportNum;
    }

    /**
     * Creates a new empty report.
     */
    static createNewReport(reports?: Array<Report>): Report {
        const reportTitle = WorkspaceUtils.getNewReportTitle(reports ? reports : []);
        const report = new Report(reportTitle);

        // Intentionally setting the widgets to null so the report selector is shown.
        report.widgets = null;

        return report;
    }

    /**
     * creates and returns a favorite action object for workspace
     */
    static getSaveWorkspaceActionObject(workspace: Workspace, quickSave = false, callBackFn?: () => void) {
        return new SaveFavoriteAction(
            workspace,
            FavoriteConstants.WORKSPACE_PASCAL,
            FavoriteConstants.WORKSPACE,
            FavoriteConstants.WORKSPACE_FOLDER,
            callBackFn,
            quickSave && workspace && workspace.id ? FavoriteConstants.QUICK_SAVE : undefined
        );
    }

    /**
     * creates and returns a delete action object for workspace
     */
    static getDeleteWorkspaceActionObject(workspace: Workspace, callBackFn?: () => void) {
        return new DeleteFavoriteAction(
            workspace,
            FavoriteConstants.WORKSPACE_PASCAL,
            FavoriteConstants.WORKSPACE,
            FavoriteConstants.WORKSPACE_FOLDER,
            callBackFn
        );
    }

    /**
     * Common function to get back the latest number that has to be used for new report and new reportGroup
     */
     static getNewObjectNumber(objList: {title: string}[], title: string, num: number): number {
        while (objList) {
            const object = objList.find( (obj: any) => {
                return obj.title === title + ' ' + num;
            });

            if (object) {
                num++;
            } else {
                return num;
            }
        }
    }
}
