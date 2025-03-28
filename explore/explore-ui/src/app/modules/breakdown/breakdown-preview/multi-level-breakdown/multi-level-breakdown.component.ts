import {Component, OnInit} from '@angular/core';
import {
    CoreFavoriteConstants, CoreFavoriteUtils,
    CoreUserMetaDataStore,
    ErrorTypeConstants, FavoriteStatus,
    UIErrorParameters
} from '@blk/explore-ui-core';
import {BaseBreakdownTypeComponent} from '../base-breakdown-type.component';
import {AuxButtonTypeEnum, AuxTreeListDataInterface} from '@blk/aladdin-angular-components';
import {Breakdown, BreakdownConstants, Sector} from '@blk/explore-ui-breakdown';
import {cloneDeep, isEmpty, isUndefined} from 'lodash';
import {takeUntil} from 'rxjs/operators';
import {AppStore} from '../../../../app.store';
import {FavoriteService, NotificationService} from '../../../../shared/services';
import {FavoriteCallback, LoadFavoriteAction} from '@models/favorite/load-favorite-action.model';
import {FavoriteConstants} from '@constants/favorite.constants';
import {NotificationConstants} from '@constants/notification.constants';
import {BreakdownUtils} from '@utils/breakdown.utils';

/**
 * Component to view multi-level/configurable breakdown
 */
@Component({
    selector: 'app-multi-level-breakdown',
    templateUrl: './multi-level-breakdown.component.html',
    styleUrls: ['./multi-level-breakdown.component.scss']
})
export class MultiLevelBreakdownComponent extends BaseBreakdownTypeComponent implements OnInit {
    readonly AuxButtonTypeEnum = AuxButtonTypeEnum;
    readonly CoreFavoriteConstants = CoreFavoriteConstants;

    coreFavoriteUtils = CoreFavoriteUtils;

    breakdownTreeData: AuxTreeListDataInterface[];

    multiLevelBreakdown: Breakdown;

    isEditOriginalEnabled: boolean;

    constructor(private appStore: AppStore,
                private favoriteService: FavoriteService,
                private notificationService: NotificationService) {
        super(BreakdownConstants.BREAKDOWN_OPTIONS.MULTI.label);
    }

    ngOnInit() {
        if (this.breakdown && !(this.breakdown.isQuickSelectBreakdown() && isUndefined(this.breakdown.id) && !this.breakdown.isConfigured)) {
            // If the breakdown is configured (or an old breakdown favorite) copy the existing breakdown
            this.setMultiLevelBreakdown(cloneDeep(this.breakdown));
        } else {
            //  else create new empty breakdown
            this.setMultiLevelBreakdown(new Breakdown());
        }
        // Set the status update callback into the BreakdownBuilderSettings so the nested component can update the status tag
        if (this.breakdownBuilderSettings) {
            this.breakdownBuilderSettings.statusUpdateCallback = this.updateStatusTag;
        }
    }

    /**
     * Method called when Edit Copy from edit breakdown menu is clicked
     */
    onEditCopy(): void {
        const breakdown: Breakdown = new Breakdown();
        // Copy the contents of the breakdown
        breakdown.copyFrom(this.multiLevelBreakdown);
        // Break the link (if the breakdown is a favorite)
        breakdown.unlinkFavorite();
        this.editBreakdown(cloneDeep(breakdown));
    }

    /**
     * Method called when Create New is clicked
     */
    onCreateNew(): void {
        this.editBreakdown(new Breakdown());
    }

    /**
     * Method called when Edit Original is clicked
     */
    onEditOriginal(): void {
        this.editBreakdown(cloneDeep(this.multiLevelBreakdown));
    }


    /**
     * Method called when multi level breakdown is selected and is in focus
     */
    onFocusIn() {
        this.breakdownChanged.emit(this.multiLevelBreakdown);
    }

    /**
     * On load filter clicked, trigger openLoadFavoriteModal$
     */
    onLoadBreakdownClick(): void {
        this.appStore.openLoadFavoriteModal$.next(
            new LoadFavoriteAction({
                type: this.breakdownBuilderSettings.favoriteType,
                treeType: this.breakdownBuilderSettings.favoriteFolderType,
                displayName: this.breakdownBuilderSettings.getBreakdownDisplayName().toLowerCase() + 's',
                callback: this.loadBreakdown,
                headerDisplayName: this.breakdownBuilderSettings.getBreakdownDisplayName().toLowerCase()
            }));
    }

    /**
     * Callback when the status tag is updated
     */
    updateStatusTag = (status: FavoriteStatus): void  => {
        // When the status tag is updated elsewhere, we need to update it here as well
        // This is to cater for the scenario when a user updates a status tag in the "Edit Original" breakdown modal
        this.multiLevelBreakdown.statusTag = status;
    }

    /**
     * Load a favorite breakdown
     * this function is used as callback so need arrow to get the right scope
     */
    loadBreakdown: FavoriteCallback = (favId: number, loadingMessage: string, forceRefresh: boolean, isGlobal: boolean, title?: string, presetId?: string): void => {
        if (!favId && presetId) {
            // indicates this is a preset breakdown (which is just a placeholder)
            const presetBreakdown = new Breakdown();
            presetBreakdown.presetBreakdownId = presetId;
            presetBreakdown.title = title;
            presetBreakdown.owner = FavoriteConstants.PORTFOLIO_SPECIFIC_USER;
            presetBreakdown.tool = 'EXPLORE';

            this.setMultiLevelBreakdown(presetBreakdown);
            this.onFocusIn();
        } else {
            this.loadBreakdownVersion(favId, loadingMessage, forceRefresh, isGlobal);
        }
    }

    loadBreakdownVersion = (favId: number, loadingMessage: string, forceRefresh: boolean, isGlobal: boolean, versionId?: string): void => {
        this.favoriteService.getFavorite$(favId, loadingMessage, false, forceRefresh, versionId)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((breakdown: Breakdown) => {
                // For a Risk & Exposure widget, block the loading of a breakdown with quantiles that was configured in a Return Analysis widget
                // Currently, Risk & Exposure doesn't support a quantile breakdown based on PORT or BENCH
                // Similarly, for Return Analysis widget, block the loading of a breakdown with quantiles that was NOT configured in RA widget (basedOn NumberOfSecurities)
                if (BreakdownUtils.isInvalidQuantileBreakdownForWidgetType(breakdown, this.breakdownBuilderSettings?.widgetType)) {
                    this.notificationService.error(NotificationConstants.SAVED_BREAKDOWN_NOT_SUPPORTED);
                    return;
                }
                this.setMultiLevelBreakdown(breakdown);
                this.onFocusIn();
            }, error => {
                this.notificationService.error('failed to load breakdown with id: ' + favId, ErrorTypeConstants.BACK_END_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_GET_FAVORITE_ERROR);
                console.error(error);
            });
    };

    private editBreakdown(breakdown: Breakdown): void {
        this.appStore.openBreakdownSettingsModal$.next(
            {
                breakdown,
                breakdownBuilderSettings: this.breakdownBuilderSettings,
                breakdownUpdatedCallback: () => {
                    this.setMultiLevelBreakdown(breakdown);
                    this.onFocusIn();
                }
            }
        );
    }

    private setMultiLevelBreakdown(breakdown: Breakdown) {
        this.multiLevelBreakdown = breakdown;
        // Set the isConfigured flag to be true;
        this.multiLevelBreakdown.isConfigured = true;
        if (!this.multiLevelBreakdown.isEmpty()) {
            this.breakdownTreeData = this.getReadOnlyBreakdownTreeData(this.multiLevelBreakdown);
        }

        // Allow user to edit original breakdown if it's a favorite and owned by user or user has ADMIN perms
        this.isEditOriginalEnabled = !!this.multiLevelBreakdown.id &&
            (this.multiLevelBreakdown.owner === CoreUserMetaDataStore.userMetaData.login ||
                CoreFavoriteUtils.isAdminFavoriteAndSavableByUser(this.multiLevelBreakdown.owner, this.multiLevelBreakdown.userPermGrps));
    }

    /**
     * Generate data for aux-tree-list to show read only breakdown tree
     */
    private getReadOnlyBreakdownTreeData(breakdown: Breakdown): AuxTreeListDataInterface[] {
        const auxData: AuxTreeListDataInterface = {
            header: 'Total',
            isExpanded: true,
            disabled: true,
            children: []
        } as AuxTreeListDataInterface;
        if (!breakdown.isEmpty()) {
            for (const children of breakdown.children) {
                auxData.children.push(this.generateAuxTreeListData(children));
            }
        }
        return [auxData];
    }

    /**
     * Generate Aux Tree List data for sector
     */
    private generateAuxTreeListData(sector: Sector): AuxTreeListDataInterface {
        const auxData: AuxTreeListDataInterface = {
            header: sector.getTitle(),
            isExpanded: true,
            disabled: true,
            children: undefined
        } as AuxTreeListDataInterface;

        if (!isEmpty(sector.children)) {
            auxData.children = [];
            for (const sectorChildren of sector.children) {
                auxData.children.push(this.generateAuxTreeListData(sectorChildren));
            }
        }
        return auxData;
    }

}
