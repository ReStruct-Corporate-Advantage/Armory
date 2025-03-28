import {ChangeDetectorRef, Component, Input, OnInit, ViewChild} from '@angular/core';
import {cloneDeep, isEmpty} from 'lodash';
import {BehaviorSubject} from 'rxjs';
import {ExportConstants} from '../../../../../constants';
import {LookthroughService} from '../../services/lookthrough.service';
import {DefinitionsStore} from '@stores/definitions.store';
import {NotificationService} from '@services/notification';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {LookthroughfilterRulesFav} from '@models/lookthrough/look-through-filter-rules-fav.model';
import {
    AuxButtonSizeEnum,
    AuxButtonTypeEnum,
    AuxInlineMenuInterface,
    AuxPicklist
} from '@blk/aladdin-angular-components';
import {AppStore} from '../../../../../app.store';
import {FavoriteService} from '@services/favorite';
import {takeUntil} from 'rxjs/operators';
import {LoadFavoriteAction} from '@models/favorite/load-favorite-action.model';
import {
    CoreFavoriteConstants, CoreFavoriteUtils,
    CoreUserMetaDataStore,
    ErrorTypeConstants,
    SubscribableComponent,
    UIErrorParameters,
    WidgetConfigType,
    WidgetInputType
} from '@blk/explore-ui-core';
import {FavoriteConstants} from '@constants/favorite.constants';
import {WidgetPayload} from '@models/widget/widget-payload.model';
import {Widget} from '@models/widget/widget.model';
import {ExploreResponse} from '@interfaces/response.interface';
import {ExportUtils} from '@utils/export/export.utils';
import {ExportService} from '@services/export/export.service';
import {ExportComposite} from '@models/export/export-composite/export-composite.model';
import {ExportDownloadingStatus} from '@interfaces/export-downloading-status.interface';
import {
    LookthroughConstants,
    LookThroughSettingsChangeType,
    LtSecurityProxyTypes,
    LtSecurityTypes
} from '@blk/explore-ui-look-through-settings';

/**
 * Component class for look-through settings
 */
@Component({
    selector: 'app-lookthrough-settings',
    templateUrl: './lookthrough-settings.component.html',
    styleUrls: ['./lookthrough-settings.component.scss']
})
export class LookthroughSettingsComponent extends SubscribableComponent implements OnInit {
    readonly CoreFavoriteConstants = CoreFavoriteConstants;
    readonly AuxButtonSizeEnum = AuxButtonSizeEnum;
    readonly AuxButtonTypeEnum = AuxButtonTypeEnum;
    readonly FavoriteConstants = FavoriteConstants;
    coreFavoriteUtils = CoreFavoriteUtils;
    @ViewChild('auxPickList', {static: false}) auxPickList: AuxPicklist;

    @Input() portfolio: Portfolio;
    exportComposite: ExportComposite;

    availableSecurityTypes: LtSecurityTypes[];  // all available security types
    availableProxyTypes: LtSecurityProxyTypes[];  // all available proxy types
    refreshInProgress = false;
    showLookthroughView = false;
    refreshLookthroughData = true;
    enabledElements = true;
    showRuleBuilder = false;
    // Abstract favorite wrapper for look-through favorite rules
    ltFilterRulesFav: LookthroughfilterRulesFav;
    copyLtFilterRulesFav: LookthroughfilterRulesFav;
    isTableSearchActive$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    widget: Widget;
    widgetPayload: WidgetPayload;
    exportingInProgress = false;
    downloadInProgress = false;
    exportOptions: AuxInlineMenuInterface[][] = [[ExportConstants.EXPORT_OPTION_EXCEL]];

    readonly LT_WITH_SMALL_L = LookthroughConstants.LOOK_THROUGH_CONST.LT_WITH_SMALL_L;
    readonly LT_REFRESH_MSG = LookthroughConstants.LT_REFRESH_MSG;
    readonly LT_REFRESH_PUSH = LookthroughConstants.LT_REFRESH_PUSH;
    readonly LT_REFRESH_TYPE = LookthroughConstants.LT_REFRESH_TYPE;
    readonly LT_REFRESH_POLITENESS = LookthroughConstants.LT_REFRESH_POLITENESS;
    /**
     * constructor
     */
    constructor(private lookthroughService: LookthroughService,
                private notificationService: NotificationService,
                private appStore: AppStore,
                private favoriteService: FavoriteService,
                private changeDetectorRef: ChangeDetectorRef,
                public exportService: ExportService) {
        super();
    }

    /**
     * Init lifecycle hook
     */
    ngOnInit(): void {
        this.availableSecurityTypes = cloneDeep(DefinitionsStore.ltSecurityType);
        this.availableProxyTypes = cloneDeep(DefinitionsStore.ltSecurityProxyType);
        this.appStore.exportDownloadingStatus$
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((downloadStatus: ExportDownloadingStatus) => {
                this.exportingInProgress = ExportUtils.isExportDownloadingStatusValid(downloadStatus) && downloadStatus.exportComposite.widget && this.widget.id === downloadStatus.exportComposite.widget.id;
                this.changeDetectorRef.detectChanges();
            });
        this.enabledElements = this.portfolio.lookthroughSettings.isAnyLookthroughEnabled();
        this.refreshLookthroughData = this.portfolio.lookthroughSettings.isAnyLookthroughEnabled();

        this.widget = this.lookthroughService.createWidget(this.portfolio, WidgetConfigType.LOOK_THROUGH_SUMMARY);
        if (!this.widget || !this.widget.dataStore) {
            return;
        }
        this.widgetPayload = this.widget.dataStore.data;
    }

    /**
     * Function to be called to extract look-through information
     */
    extractLookthroughInfo(): void {
        if (!this.portfolio.lookthroughSettings.isAnyLookthroughEnabled()) {
            return;
        }
        if (isEmpty(this.portfolio.lookthroughSettings.ltSecurityTypes)) {
            this.notificationService.error('No Look-through security types selected', ErrorTypeConstants.UI_VALIDATION_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_EXTRACT_LOOKTHROUGH_INFO_ERROR);
            return;
        }

        this.setLookthroughViewFlags(true, false, false);
        this.lookthroughService.getLookthroughInfo$(this.portfolio)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: (payload: ExploreResponse) => {
                    if (isEmpty(payload)) {
                        throw Error('No data received from server');
                    }
                    this.lookthroughService.populateResponseData(payload, this.widgetPayload, this.portfolio.portName);
                    this.setLookthroughViewFlags(false, true, false);
                    this.changeDetectorRef.markForCheck();
                },
                error: (error: Error) => {
                    console.error(error.message ? error.message : error);
                    this.notificationService.error(error.message, ErrorTypeConstants.BACK_END_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_GET_LOOKTHROUGH_INFO_ERROR);
                    this.setLookthroughViewFlags(false, false, true);
                }
            });
    }

    /**
     * Method is triggered when export icon is clicked
     */
    onExportItemClicked(exportType: string) {
        if (!this.portfolio.lookthroughSettings.isAnyLookthroughEnabled()) {
            return;
        }
        this.exportComposite = ExportUtils.getExportComposite(exportType, ExportConstants.EXPORT_WIDGET, this.widget); // , 'agGrid'
        this.updateExportingStatus(false, this.exportComposite);

        const ltRequests = this.lookthroughService.createLookThroughRequestParam(this.portfolio);
        this.widget.dataStore.metaData.inputs.set(WidgetInputType.LT_SUMMARY_SETTING, ltRequests);

        this.exportService.exportFile(this.exportComposite).subscribe({
            next: downloadCompleted => this.updateExportingStatus(downloadCompleted, this.exportComposite),
            error: _err => {
                // Update the export status so the spinner stops
                this.updateExportingStatus(true);
                this.notificationService.error(ExportUtils.getExportType(this.exportComposite) + ' failed to export.', ErrorTypeConstants.BACK_END_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_ON_EXPORT_ITEM_CLICKED_ERROR);
            }
        });
    }

    /**
     * Updates Exporting Status
     */
    updateExportingStatus(downloadCompleted: boolean, exportComposite?: ExportComposite): void {
        this.downloadInProgress = !downloadCompleted;
        this.appStore.updateExportDownloadingStatus(this.downloadInProgress, exportComposite);
    }

    /**
     * Function to set boolean flags for look-through view
     */
    private setLookthroughViewFlags(refreshInProgress?: boolean, showLookthroughView?: boolean, refreshLookthroughData?: boolean, enabledElements?: boolean): void {
        if (refreshInProgress != null) {
            this.refreshInProgress = refreshInProgress;
        }
        if (showLookthroughView != null) {
            this.showLookthroughView = showLookthroughView;
        }
        if (refreshLookthroughData != null) {
            this.refreshLookthroughData = refreshLookthroughData;
        }
        if (enabledElements != null) {
            this.enabledElements = enabledElements;
        }
    }

    /**
     * Allow user to edit original LT rules if it's a favorite and owned by user or user has ADMIN perms
     */
    isUserLtRuleOwner(): boolean {
        const ltFilterRulesFav = this.portfolio.lookthroughSettings.ltFilterRulesFav;
        return !!ltFilterRulesFav?.id &&
            (ltFilterRulesFav.owner === CoreUserMetaDataStore.userMetaData.login ||
                CoreFavoriteUtils.isAdminFavoriteAndSavableByUser(ltFilterRulesFav.owner, ltFilterRulesFav.userPermGrps));
    }

    onCreateNew(): void {
        if (this.portfolio.lookthroughSettings.ltFilterRulesFav) {
            this.copyLtFilterRulesFav = cloneDeep(this.portfolio.lookthroughSettings.ltFilterRulesFav);
            this.portfolio.lookthroughSettings.ltFilterRulesFav.unlinkFavorite();
            this.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules = [];
        }
        this.openRuleBuilderModal();
    }

    onEditCopy(): void {
        if (this.portfolio.lookthroughSettings.ltFilterRulesFav) {
            this.copyLtFilterRulesFav = cloneDeep(this.portfolio.lookthroughSettings.ltFilterRulesFav);
            this.portfolio.lookthroughSettings.ltFilterRulesFav.unlinkFavorite();
        }
        this.openRuleBuilderModal();
    }

    onEditOriginal(): void {
        if (this.portfolio.lookthroughSettings.ltFilterRulesFav) {
            this.copyLtFilterRulesFav = cloneDeep(this.portfolio.lookthroughSettings.ltFilterRulesFav);
        }
        this.openRuleBuilderModal();
    }

    /**
     * Sets isOpen boolean to true
     */
    private openRuleBuilderModal(): void {
        this.showRuleBuilder = true;
    }

    /**
     * Resets isOpen boolean
     */
    onCloseRulebuilderModal(hasRuleLogicChanged: boolean): void {
        if (hasRuleLogicChanged) {
            this.setLookthroughViewFlags(false, false, true, false);
        }
        this.showRuleBuilder = false;
    }

    /**
     * On load rule list clicked, trigger openLoadFavoriteModal$
     */
    onLoadRuleList(): boolean {
        this.ltFilterRulesFav = new LookthroughfilterRulesFav({});
        this.appStore.openLoadFavoriteModal$.next(
            new LoadFavoriteAction({
                type: FavoriteConstants.LT_FILTER_RULES,
                treeType: FavoriteConstants.LT_RULES_FOLDER,
                displayName: FavoriteConstants.LT_LOGIC_RULES,
                callback: this.loadRuleList,
                headerDisplayName: 'Look-Through Rule List',
                ignoreEnterpriseTree: false
            }));
        return false;
    }

    /**
     * Load a favorite rule
     */
    loadRuleList = (favId: number, loadingMessage: string): void => {
        this.loadRuleListVersion(favId, loadingMessage);
    }

    /**
     * Load a favorite rule
     */
    loadRuleListVersion = (favId: number, loadingMessage: string, forceRefresh = false, globalFav = false, versionId?: string): void => {
        this.favoriteService.getFavorite$(favId, loadingMessage, forceRefresh, globalFav, versionId)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((ltFilterRulesFav: LookthroughfilterRulesFav) => {
                if (ltFilterRulesFav && ltFilterRulesFav.id) {
                    this.portfolio.lookthroughSettings.ltFilterRulesFav = ltFilterRulesFav;
                    this.setLookthroughViewFlags(false, false, true, true);
                    this.changeDetectorRef.markForCheck();
                }
            }, error => {
                this.notificationService.error('failed to load breakdown with id: ' + favId, ErrorTypeConstants.BACK_END_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_GET_FAVORITE_ERROR);
                console.error(error);
            });
    }

    /**
     * Turn on and off table search feature
     */
    toggleTableSearch() {
        this.isTableSearchActive$.next(!this.isTableSearchActive$.value);
    }

    onLookThroughSettingsTypeChanged(event: LookThroughSettingsChangeType) {
        this.showLookthroughView = false;
        if (event === LookThroughSettingsChangeType.LOOKTHROUGH_DISABLED) {
            this.refreshLookthroughData = false;
            return;
        }
        this.refreshLookthroughData = true;
    }
}
