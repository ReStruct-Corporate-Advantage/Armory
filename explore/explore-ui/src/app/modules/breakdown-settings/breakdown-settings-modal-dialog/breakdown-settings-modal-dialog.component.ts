import {
    AfterViewChecked,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
    ViewChild
} from '@angular/core';
import {
    AlertConstants,
    CoreFavoriteConstants,
    CoreFavoriteUtils,
    CoreUserMetaDataStore,
    ExploreDialogParam,
    TokenConstants,
    TokenUtils
} from '@blk/explore-ui-core';
import {Breakdown, BreakdownBuilderSettings, BreakdownTreeNode} from '@blk/explore-ui-breakdown';
import {BehaviorSubject} from 'rxjs';
import {FavoriteService, NotificationService} from '../../../shared/services';
import {isEqual, isUndefined} from 'lodash';
import {AppStore} from '../../../app.store';
import {takeUntil} from 'rxjs/operators';
import {BreakdownTreeComponent} from './breakdown-tree/breakdown-tree.component';
import {SaveFavoriteAction} from '@models/favorite/save-favorite-action.model';
import {BreakdownSectorSelectorComponent} from './breakdown-sector-selector/breakdown-sector-selector.component';
import {AuxAdvancedTreeListInterface} from '@blk/aladdin-angular-components';
import {BaseWidgetSettingsModalComponent} from '../../widget/widget-settings';
import {DefinitionsStore} from '@stores/definitions.store';
import {SaveFavoriteVersionDetailsAndSummary} from '@models/favorite-version/favorite-version-log.interface';

/**
 * Component for Breakdown Settings modal dialog. It is used to modify/define the breakdown according to user requirements
 */
@Component({
    selector: 'app-breakdown-settings-modal-dialog',
    templateUrl: './breakdown-settings-modal-dialog.component.html',
    styleUrls: ['./breakdown-settings-modal-dialog.component.scss']
})
export class BreakdownSettingsModalDialogComponent extends BaseWidgetSettingsModalComponent implements AfterViewChecked, OnInit {
    @Input()
    isOpen = false;

    @Input()
    breakdown: Breakdown;

    @Input()
    breakdownBuilderSettings: BreakdownBuilderSettings;

    @Input()
    breakdownUpdatedCallback: Function;

    @Output()
    modalClosed = new EventEmitter();

    @ViewChild(BreakdownTreeComponent, {static: false})
    breakdownTreeComponent: BreakdownTreeComponent;

    @ViewChild(BreakdownSectorSelectorComponent, {static: false})
    breakdownSectorSelector: BreakdownSectorSelectorComponent;

    addSectorSubject$: BehaviorSubject<AuxAdvancedTreeListInterface>;

    original: boolean;

    doneButtonLabel: string;

    breakdownTreeSelectedNode: BreakdownTreeNode;

    isSaveSummaryOpen = false;
    // variables for adding save summary to enterprise favorites
    saveSummary: SaveFavoriteVersionDetailsAndSummary = {changeSummary: undefined, changeSummaryDetails: undefined};

    /**
     * list of column tags qualifying for top-down breakdown columns
     */
    readonly topDownEligibleCols: readonly string[] = [...DefinitionsStore.topDownEligibleCols];

    /**
     * constructor
     */
    constructor(
        private appStore: AppStore,
        private favoriteService: FavoriteService,
        private notificationService: NotificationService,
        private changeDetectorRef: ChangeDetectorRef
    ) {
        super();
    }

    /**
     * @inheritDoc
     */
    onInit() {
        this.addSectorSubject$ = new BehaviorSubject<AuxAdvancedTreeListInterface>(null);
        this.original = this.breakdown && !isUndefined(this.breakdown.id);
        this.breakdown.isConfigured = true;
        this.onBreakdownUpdated();
    }

    ngAfterViewChecked(): void {
        if (this.breakdownTreeComponent) {
            this.changeDetectorRef.detectChanges();
        }
    }

    /**
     * @inheritDoc
     * Inserting updated breakdown object in widget inputs
     */
    beforeWidgetPreviewUpdate(): boolean {
        if (!this.breakdownTreeComponent || this.breakdownTreeComponent.validateAndUpdateBreakdown()) {
            this.inputs.set(this.breakdownBuilderSettings.inputName, this.breakdown);
            return true;
        }
        return false;
    }

    /**
     * Method called when breakdown object is updated and done button label needs to be updated
     */
    onBreakdownUpdated(): void {
        this.doneButtonLabel = this.getDoneButtonLabel();
    }

    /**
     * Handle when the user clicks the Done (Apply) button
     */
    onDoneClick(): void {
        // Validate the breakdown before we proceed
        if (this.breakdownTreeComponent.validateAndUpdateBreakdown()) {
            if (this.original) {
                // check if token is enabled, its an admin user, summary to be entered and version number is not 1.
                if (this.breakdown.owner === CoreFavoriteConstants.ADMIN
                    && TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_ENABLE_ENTERPRISE_VERSIONS)
                    && !this.saveSummary?.changeSummary) {
                    this.isSaveSummaryOpen = true;
                    return;
                }
                this.saveBreakdownFavorite();
            } else {
                this.checkAndSetBreakdown();
            }
        }
    }

    private saveBreakdownFavorite(): void {
        this.breakdown.changeSummary = this.saveSummary?.changeSummary;
        this.breakdown.changeSummaryDetail = this.saveSummary?.changeSummaryDetails;
        this.saveSummary.changeSummary = this.saveSummary.changeSummaryDetails = undefined;
        // Save over the existing breakdown favorite
        this.favoriteService.quickSaveFavorite$(this.breakdown, this.breakdown.createFavorite(this.breakdownBuilderSettings.favoriteType), this.breakdown.owner)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(
            (updated: boolean) => {
                if (updated) {
                    this.closeModal(true);
                }
            }
        );
    }

    /**
     * Method to close modal dialog and notify parent component if breakdown was updated
     */
    closeModal(breakdownUpdated: boolean): void {
        this.isOpen = false;
        this.addSectorSubject$.complete();
        if (breakdownUpdated) {
            this.breakdownUpdatedCallback();
        }
        this.modalClosed.emit();
    }

    /**
     * Method called when Breakdown Tree node selection is changed
     */
    onBreakdownTreeNodeSelectionChange(breakdownTreeNode: BreakdownTreeNode): void {
        this.breakdownTreeSelectedNode = breakdownTreeNode;
    }

    /**
     * Method called when 'Save to my breakdown' button is clicked
     */
    onSaveToMyBreakdownClick(): void {
        // Save favorite dialog
        if (this.breakdownTreeComponent.validateAndUpdateBreakdown()) {
            this.appStore.saveFavoriteAction$.next(
                new SaveFavoriteAction(
                    this.breakdown,
                    this.breakdownBuilderSettings.getBreakdownDisplayName().toLowerCase(),
                    this.breakdownBuilderSettings.favoriteType,
                    this.breakdownBuilderSettings.favoriteFolderType,
                    () => this.onBreakdownUpdated()
                ));
        }
    }

    /**
     * Check the breakdown and handle the linkage of the favorite
     */
    private checkAndSetBreakdown(): void {
        // For breakdowns that are favorites validate that the user has either saved the breakdown
        // or wants to unlink it.
        if (this.breakdown.id) {
            // Get the saved version of the breakdown so we can compare them.
            this.favoriteService.getFavorite$(this.breakdown.id, null, CoreFavoriteUtils.isGlobalFavorite(this.breakdown.owner))
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe(
                    (savedBreakdown: Breakdown) => {
                        const savedContent: any = savedBreakdown ? savedBreakdown.serializeFullContent() : undefined;
                        const newContent: any = this.breakdown.serializeFullContent();
                        if (!this.isUserBreakdownOwner()) {
                            // If the favorite is not for the current user, check if the user made any changes.
                            if (!isEqual(savedContent, newContent)) {
                                // If the user made changes, remove the linkage of the favorite.
                                this.breakdown.unlinkFavorite();
                                (this.breakdownTreeComponent.breakdownTreeData[0].sectorModel as Breakdown).unlinkFavorite();
                            }
                        } else if (!isEqual(savedContent, newContent)) {
                            // If the contents are the same then just get out of here, otherwise prompt the user what to do.
                            this.notificationService.openDialog(new ExploreDialogParam(AlertConstants.TYPE.PROMPT, AlertConstants.HEADER.FAVORITE_CHANGED, AlertConstants.BODY.FAVORITE_CHANGED,
                                AlertConstants.BTN.USE_ONCE, AlertConstants.BTN.CANCEL, () => {
                                    this.breakdown.unlinkFavorite();
                                    (this.breakdownTreeComponent.breakdownTreeData[0].sectorModel as Breakdown).unlinkFavorite();
                                }));
                        }
                        this.breakdown.copyFrom(savedBreakdown);
                        this.closeModal(true);
                    });
        } else {
            this.closeModal(true);
        }
    }

    /**
     * Check if the breakdown is owned by the user
     */
    private isUserBreakdownOwner(): boolean {
        return this.breakdown && CoreUserMetaDataStore.userMetaData && this.breakdown.owner === CoreUserMetaDataStore.userMetaData.login;
    }

    /**
     * Returns the text for the Done (Apply) button
     */
    private getDoneButtonLabel(): string {
        if (this.original) {
            return AlertConstants.BTN.SAVE_CHANGES;
        }
        return AlertConstants.BTN.APPLY;
    }

    closeSaveSummaryDialog(continueSaving: boolean): void {
        this.isSaveSummaryOpen = false;
        // Explicitly check that continueSaving is the emitted boolean, so it doesn't get triggered from another event
        if (continueSaving === true) {
            this.saveBreakdownFavorite();
        }
    }
}
