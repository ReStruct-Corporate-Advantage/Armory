import {Injectable} from '@angular/core';
import {
    AbstractFavoriteConfig,
    ConfigTypeFactory,
    CoreFavoriteUtils,
    FavoriteType,
    SerializeFavoriteType,
    CoreUserMetaDataStore
} from '@blk/explore-ui-core';
import {flatten, isEqual, isNil, isObject} from 'lodash';
import {BehaviorSubject} from 'rxjs';
import {FavoriteChange} from '@models/favorite/favorite-change.model';
import {WorkspaceFavoriteChange} from '@models/favorite/workspace-favorite-change.model';
import {Workspace} from '@models/workspace/workspace.model';
import {Report} from '@models/workspace/report.model';
import {BaseWorkpad} from '@models/workspace/base-workpad.model';
import {WorkpadFavoriteChange} from '@models/favorite/workpad-favorite-change.model';
import {FlatWorkpad} from '@models/workspace/flat-workpad.model';
import {ReportGroup} from '@models/workspace/report-group.model';
import * as momentTz from 'moment-timezone';

@Injectable()
export class FavoriteChangeDetectionService {

    static FIELDS_TO_IGNORE: string[] = ['parent', 'data', '_data', 'availableDataStores', 'comparisonConfigId', 'widgetConfigInputs'];

    /**
     * Determines if favorite has been modified from its original
     */
    private static isChangedFavorite(favorite: AbstractFavoriteConfig): boolean {
        const origFav = ConfigTypeFactory.getFavoriteConfig(favorite.id, CoreFavoriteUtils.isGlobalFavorite(favorite.owner));
        // If we didn't find a favorite we want to exclude it as we can't validate if it has changed anyway.
        if (!origFav) {
            return false;
        }
        // serialize each content
        const origFavContent = origFav.serialize(SerializeFavoriteType.FAVORITE_CHANGE_DETECTION);
        const newFavContent = favorite.serialize(SerializeFavoriteType.FAVORITE_CHANGE_DETECTION);
        return !isEqual(origFavContent, newFavContent);
    }

    /**
     * Find all nested favorites that have changed
     * @param searchObject  The root object to begin searching for changed favorites under
     * @param flattenedFavoriteChanges  favorite changes in flattened form
     */
    private static getNestedChangedFavorites(searchObject: any, flattenedFavoriteChanges: SavableFavoriteChange[]): FavoriteChange[] {
        // If it is not an object then just get out of here.
        if (!isObject(searchObject)) {
            return [];
        }
        // Get the list of object to search here.
        // Mainly we want to get the values of a set/map object.
        searchObject = searchObject instanceof Map || searchObject instanceof Set ? Array.from(searchObject.values()) : searchObject;
        const nestedFavoriteChanges: FavoriteChange[] = [];
        Object.keys(searchObject).forEach((key: string) => {
            // Skip if not a property of this object directly.
            // Need to see if there is a better way to skip something called parent.  This happens because a sector has a
            // reference to the parent and we need to not continue to loop through them.
            if (!searchObject.hasOwnProperty(key) || this.FIELDS_TO_IGNORE.includes(key)) {
                return;
            }
            let childObject = searchObject[key];
            if (childObject == null) {
                // Do nothing.
                return;
            }
            if (childObject instanceof BehaviorSubject) {
                childObject = childObject.getValue();
            }

            // recurse and see if there are any child elements that are also a changed favorite
            const childNestedFavoriteChanges = this.getNestedChangedFavorites(childObject, flattenedFavoriteChanges);

            // Conditions to consider childObject as changed:
            // 1. is a favorite instance
            // 2. has been previously saved
            // 3. favorite content has changed or has nested favorite changes
            if (childObject instanceof AbstractFavoriteConfig && !isNil(childObject.id) && (FavoriteChangeDetectionService.isChangedFavorite(childObject) || childNestedFavoriteChanges.length)) {
                const favoriteType = ConfigTypeFactory.getFavoriteFromCache(childObject.id, CoreFavoriteUtils.isGlobalFavorite(childObject.owner)).type;
                if (FavoriteChangeDetectionService.isChangedFavorite(childObject)) {
                    childObject.lastUpdatedBy = CoreUserMetaDataStore.userMetaData.login;
                    childObject.dateLastUpdated = momentTz.tz(momentTz.tz.guess()).format('MM/DD/YYYY HH:mm zz');
                }
                const childFavorite = new FavoriteChange(childObject, childObject.getDisplayType(searchObject), favoriteType as FavoriteType);
                childFavorite.nestedChanges = childNestedFavoriteChanges;
                nestedFavoriteChanges.push(childFavorite);
                if (childFavorite.nestedChanges.length) {
                    childFavorite.nestedChanges.forEach(change => flattenedFavoriteChanges.push(change));
                }
            } else {
                // childObject is not a favorite, add any nested changes to current level
                nestedFavoriteChanges.push(...childNestedFavoriteChanges);
            }
        });
        return nestedFavoriteChanges;
    }

    /**
     * Finds all changes underneath the Report
     * @param report Report to get nested changes at and under
     * @param flattenedFavoriteChanges Flat list of all favorite changes
     * @param isRootLevelReportSaving Indicates if the report is the root level (Save Report Modal)
     */
    getReportChangedFavoritesTree(report: Report, flattenedFavoriteChanges: SavableFavoriteChange[], isRootLevelReportSaving: boolean): FavoriteChange {
        // include root report favorite regardless of if it has been saved
        const reportFavoriteChange = new FavoriteChange(report, report.getDisplayType(), FavoriteType.LAYOUT, isRootLevelReportSaving);
        reportFavoriteChange.value = report;

        // Recursively get all the nested changed favorites
        reportFavoriteChange.nestedChanges = FavoriteChangeDetectionService.getNestedChangedFavorites(report, flattenedFavoriteChanges);
        if (reportFavoriteChange.nestedChanges.length) {
            reportFavoriteChange.nestedChanges.forEach(change => flattenedFavoriteChanges.push(change));
        }

        if (isRootLevelReportSaving) {
            flattenedFavoriteChanges.push(reportFavoriteChange);
        }

        return reportFavoriteChange;
    }

    /**
     * Returns all favorite changes under the workpad
     */
    private getWorkpadChangedFavoritesTree(workpad: BaseWorkpad, flattenedFavoriteChanges: SavableFavoriteChange[]): WorkpadFavoriteChange | null {
        // check for any portfolio settings that have changed
        let modifiedPortfolioSettings: FavoriteChange[] = [];
        if (workpad instanceof FlatWorkpad) {
            modifiedPortfolioSettings = FavoriteChangeDetectionService.getNestedChangedFavorites({portfolio: workpad.portfolio}, flattenedFavoriteChanges);
        } else if (workpad instanceof ReportGroup) {
            modifiedPortfolioSettings = flatten(workpad.portfolios.map(portfolio => FavoriteChangeDetectionService.getNestedChangedFavorites({portfolio}, flattenedFavoriteChanges)));
        }

        // include all reports that either:
        // 1. have nested favorites that have changed
        // 2. report itself has changed and been previously saved
        const modifiedReports: FavoriteChange[] = workpad.reports.map(report => {
            const reportChange = this.getReportChangedFavoritesTree(report, flattenedFavoriteChanges, false);
            // for reports not previously saved, display them but do not allow them to be saved
            if (!report.id) {
                reportChange.isSelected = false;
            }
            if (FavoriteChangeDetectionService.isChangedFavorite(report)) {
                reportChange.lastUpdatedBy = CoreUserMetaDataStore.userMetaData.login;
                reportChange.dateLastUpdated = momentTz.tz(momentTz.tz.guess()).format('MM/DD/YYYY HH:mm zz');
            }
            return reportChange;
        })
            .filter(reportFavoriteChange => reportFavoriteChange.nestedChanges.length > 0 || (reportFavoriteChange.value.id && FavoriteChangeDetectionService.isChangedFavorite(reportFavoriteChange.value)));

        // check to see if the workpad has nested favorite changes, if so return the workpad+changed favorites
        if (modifiedReports.length > 0 || modifiedPortfolioSettings.length > 0) {
            const workpadFavoriteChange = new WorkpadFavoriteChange(workpad);
            workpadFavoriteChange.nestedChanges = modifiedPortfolioSettings;
            workpadFavoriteChange.modifiedReports = modifiedReports;
            [...workpadFavoriteChange.nestedChanges, ...workpadFavoriteChange.modifiedReports].forEach((change => flattenedFavoriteChanges.push(change)));
            return workpadFavoriteChange;
        }
        return null;
    }

    /**
     * Finds all changes underneath the Workspace
     */
    getWorkspaceChangedFavoritesTree(workspaceFavorite: Workspace, flattenedFavoriteChanges: SavableFavoriteChange[]): WorkspaceFavoriteChange {
        // always include root workspace regardless of if it has been saved
        const workspaceFavoriteChange = new WorkspaceFavoriteChange(workspaceFavorite);

        workspaceFavoriteChange.nestedChanges = workspaceFavorite.workpads
            .map(workpad => this.getWorkpadChangedFavoritesTree(workpad, flattenedFavoriteChanges))
            .filter(workpadFavChange => !!workpadFavChange);

        flattenedFavoriteChanges.push(workspaceFavoriteChange);

        // check if the workspace itself is modified
        workspaceFavoriteChange.isWorkspaceFavoriteContentModified = workspaceFavorite.id && FavoriteChangeDetectionService.isChangedFavorite(workspaceFavorite);
        
        if (workspaceFavoriteChange.isWorkspaceFavoriteContentModified) {
            workspaceFavoriteChange.lastUpdatedBy = CoreUserMetaDataStore.userMetaData.login;
            workspaceFavoriteChange.dateLastUpdated = momentTz.tz(momentTz.tz.guess()).format('MM/DD/YYYY HH:mm zz');
            const origFav = ConfigTypeFactory.getFavoriteConfig(
                workspaceFavorite.id,
                CoreFavoriteUtils.isGlobalFavorite(workspaceFavorite.owner)
            );
            // Check for enterprise permission group and add it to workspaceFavoriteChange
            if (origFav.userPermGrps?.length > 0) {
                workspaceFavoriteChange.userPermGrps = origFav.userPermGrps;
            }
        }

        return workspaceFavoriteChange;
    }
}

export type SavableFavoriteChange = FavoriteChange | WorkspaceFavoriteChange;
