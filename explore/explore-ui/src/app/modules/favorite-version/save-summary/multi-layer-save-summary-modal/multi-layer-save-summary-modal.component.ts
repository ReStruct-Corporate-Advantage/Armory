import {Component, Input, OnInit} from '@angular/core';
import {AuxButtonTypeEnum, AuxTextInputValueChangedDetailInterface} from '@blk/aladdin-angular-components';
import {CoreCommonConstants, CoreFavoriteConstants, FavoriteDisplayEnum, ModalDirective} from '@blk/explore-ui-core';
import {BehaviorSubject} from 'rxjs';
import {SavableFavoriteChange} from '@services/favorite-change-detection/favorite-change-detection.service';
import {isNil} from 'lodash';
import {SaveSummariesStateValidationHandler} from './save-summaries-state-validation.handler';
import {FavoriteVersionConstants} from '../../favorite-version.constants';
import {WorkspaceFavoriteChange} from '@models/favorite/workspace-favorite-change.model';
import {SaveSummariesDisplayInfo} from './save-summaries-display-info.interface';
import {FavoriteChange} from '@models/favorite/favorite-change.model';
import {BaseWorkpad} from '@models/workspace/base-workpad.model';
import {FlatWorkpad} from '@models/workspace/flat-workpad.model';
import {ReportGroup} from '@models/workspace/report-group.model';
import {WorkpadFavoriteChange} from '@models/favorite/workpad-favorite-change.model';
import {SaveMode} from '@enums/save-mode.enum';

/**
 * Show ALL changed enterprise favorites in the modal with visual indication of the relationship hierarchy,
 *  for the favoriteTree which can be either Workspace or Report.
 *
 *  Each changed enterprise favorite has input box so admin user can provide context behind the change.
 */
@Component({
    selector: 'app-multi-layer-save-summary-modal',
    templateUrl: './multi-layer-save-summary-modal.component.html',
    styleUrls: ['./multi-layer-save-summary-modal.component.scss'],
    providers: [SaveSummariesStateValidationHandler]
})
export class MultiLayerSaveSummaryModalComponent<T extends SavableFavoriteChange> extends ModalDirective<boolean> implements OnInit {
    readonly FavoriteDisplayEnum = FavoriteDisplayEnum;
    readonly AuxButtonTypeEnum = AuxButtonTypeEnum;
    readonly CoreCommonConstants = CoreCommonConstants;
    readonly CoreFavoriteConstants = CoreFavoriteConstants;
    readonly FavoriteVersionConstants = FavoriteVersionConstants;
    readonly FAVORITE_DISPLAY_NAMES = CoreFavoriteConstants.FAVORITE_DISPLAY_NAMES;
    readonly PORTFOLIO = 'Portfolio';
    readonly REPORT_GROUP = 'Report Group';

    /**
     * list of favorites with new change summaries - this is to remove the stale change summary details.
     */
    favoritesWithNewChangeSummaries = [];

    @Input() favoritesTree: T;
    displayInfo: SaveSummariesDisplayInfo;

    saveButtonDisabled$ = new BehaviorSubject(true);

    constructor(private saveSummariesStateValidationHandler: SaveSummariesStateValidationHandler) {
        super();
    }

    /**
     * On init
     *  Copy favoritesTree that we can assign back to the original object on save and initializes the counter to track the savable state.
     */
    ngOnInit(): void {
        if (this.favoritesTree instanceof WorkspaceFavoriteChange) {
            this.displayInfo = this.initializeWorkspaceInfoToDisplay(this.favoritesTree);
        } else {
            this.displayInfo = this.initializeReportInfoToDisplay(this.favoritesTree);
        }

        this.saveSummariesStateValidationHandler.initializeChangeDetailsValidation(this.displayInfo);
    }

    /**
     * Create workspace info to display.
     */
    private initializeWorkspaceInfoToDisplay(workspaceChange: WorkspaceFavoriteChange): SaveSummariesDisplayInfo {
        const workspaceInfo = this.createDisplayInfo(workspaceChange);

        let hasNestedEnterpriseFavorite = false;

        workspaceChange.nestedChanges.forEach(nestedChange => {
            const workpadInfoToDisplay = this.initializeWorkpadInfoToDisplay(nestedChange);
            if (!isNil(workpadInfoToDisplay)) {
                workspaceInfo.nestedChanges.push(workpadInfoToDisplay);
                hasNestedEnterpriseFavorite = true;
            }
        });

        return hasNestedEnterpriseFavorite || workspaceInfo.shouldShowSaveSummary ? workspaceInfo : null;
    }

    /**
     * Create workpad info to display.
     */
    private initializeWorkpadInfoToDisplay(workpadChange: WorkpadFavoriteChange): SaveSummariesDisplayInfo | null {
        const workpadInfo: SaveSummariesDisplayInfo = {
            title: this.getWorkpadTitle(workpadChange.value),
            type: workpadChange.value instanceof FlatWorkpad ? this.PORTFOLIO : this.REPORT_GROUP,
            nestedChanges: []
        };

        let hasNestedEnterpriseFavorite = false;

        workpadChange.modifiedReports.forEach(reportChange => {
            const reportInfoToDisplay = this.initializeReportInfoToDisplay(reportChange);
            if (!isNil(reportInfoToDisplay)) {
                workpadInfo.nestedChanges.push(reportInfoToDisplay);
                hasNestedEnterpriseFavorite = true;
            }
        });

        return hasNestedEnterpriseFavorite ? workpadInfo : null;
    }

    /**
     * Get workpad title.
     */
    private getWorkpadTitle(workpad: BaseWorkpad): string {
        if (workpad instanceof FlatWorkpad) {
            return workpad.portfolio.fullName;
        }
        return (workpad as ReportGroup).title;
    }

    /**
     * Create report info to display.
     */
    private initializeReportInfoToDisplay(reportChange: FavoriteChange): SaveSummariesDisplayInfo | null {
        const reportInfo = this.createDisplayInfo(reportChange);

        let hasNestedEnterpriseFavorite = false;

        reportChange.nestedChanges.forEach(nestedChange => {
            const nestedChangeInfoToDisplay = this.initializeNestedChangeInfoToDisplay(nestedChange);
            if (!isNil(nestedChangeInfoToDisplay)) {
                reportInfo.nestedChanges.push(nestedChangeInfoToDisplay);
                hasNestedEnterpriseFavorite = true;
            }
        });

        return hasNestedEnterpriseFavorite || reportInfo.shouldShowSaveSummary ? reportInfo : null;
    }

    /**
     * Create lower level (under report) nested favorite change info to display.
     */
    private initializeNestedChangeInfoToDisplay(nestedChange: FavoriteChange): SaveSummariesDisplayInfo | null {
        if (this.isEnterpriseFavorite(nestedChange.savingUser) && nestedChange.isSelected && nestedChange.saveMode === SaveMode.SAVE) {
            return this.createDisplayInfo(nestedChange);
        }
    }

    /**
     * Create display info.
     */
    private createDisplayInfo(change: FavoriteChange | WorkspaceFavoriteChange): SaveSummariesDisplayInfo {
        const shouldShowSaveSummary = this.isEnterpriseFavorite(change.savingUser) && change.isSelected && change.saveMode === SaveMode.SAVE;
        if (shouldShowSaveSummary) {
            this.favoritesWithNewChangeSummaries.push(change);
        }

        return {
            title: change.saveTitle,
            shouldShowSaveSummary,
            changeSummary: change.value.changeSummary,
            type: change.favoriteDisplayType,
            favoriteChange: change,
            nestedChanges: []
        };
    }

    /**
     * Check if the favorite is enterprise favorite.
     *  Only enterprise favorites have the change details panel.
     */
    private isEnterpriseFavorite(savingUser: string): boolean {
        return savingUser === CoreFavoriteConstants.ADMIN;
    }

    /**
     * Update Favorite Tree with updated change summaries on save click.
     */
    public updateChangeSummariesOnSave(): void {
        this.updateFavoritesTreeWithSaveSummary(this.displayInfo);
        this.closeModal(true);
    }

    /**
     * Add save summary to the original object recursively
     */
    private updateFavoritesTreeWithSaveSummary(displayInfo: SaveSummariesDisplayInfo): void {
        if (displayInfo.favoriteChange) {
            displayInfo.favoriteChange.changeSummary = displayInfo.changeSummary;
            if (this.favoritesWithNewChangeSummaries.includes(displayInfo.favoriteChange)) {
                // remove changeSummaryDetails as we don't want the stale information to be remaining.
                displayInfo.favoriteChange.changeSummaryDetails = '';
            }
        }

        for (const nestedChange of displayInfo.nestedChanges) {
            this.updateFavoritesTreeWithSaveSummary(nestedChange);
        }
    }

    /**
     * Change summary updated
     *  A method bound with (valueChanged) event with aux-text-area.
     */
    public changeSummaryUpdated(displayInfo: SaveSummariesDisplayInfo, event: CustomEvent<AuxTextInputValueChangedDetailInterface>): void {
        if (isNil(event)) {
            return;
        }
        this.saveButtonDisabled$.next(!this.saveSummariesStateValidationHandler.isSavable(displayInfo, event.detail.value));
        displayInfo.changeSummary = String(event.detail.value);
    }
}
