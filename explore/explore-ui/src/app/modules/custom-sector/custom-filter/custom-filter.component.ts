import {ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {takeUntil} from 'rxjs/operators';

import {CustomFilter, CustomSector, NormalizedFlag, SectorConstants, SectorRuleBuilderConfig} from '@blk/explore-ui-breakdown';
import {FavoriteConstants} from '@constants/favorite.constants';
import {CompositionConstants} from '@constants/index';
import {AppStore} from '../../../app.store';
import {FavoriteService, NotificationService} from '@services/index';
import {SaveFavoriteAction} from '@models/favorite/save-favorite-action.model';
import {LoadFavoriteAction} from '@models/favorite/load-favorite-action.model';
import {ColumnConstants, ErrorTypeConstants, SubscribableComponent, UIErrorParameters} from '@blk/explore-ui-core';
import {ColumnFilter, createColumnFilter, LibColumnUtils} from '@blk/explore-ui-column-option';

/**
 * Component to create custom column filter using Column Sector Rules.
 *
 * @example
 *  <app-custom-filter *ngSwitchCase="'customFilter'"
 *                     [fieldToUse]="widgetConfigInput.valueField">
 *  </app-custom-filter>
 */
@Component({
    selector: 'app-custom-filter',
    templateUrl: './custom-filter.component.html'
})
export class CustomFilterComponent extends SubscribableComponent implements OnInit {
    readonly FavoriteConstants = FavoriteConstants;
    @Output() updateApplyFilter = new EventEmitter();
    @Output() updateNormalizedFlag: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() isApplyFilterToNewWidgetsCheckedChange = new EventEmitter<boolean>();
    @Input() filter: CustomFilter;
    @Input() isNormalized: NormalizedFlag;
    @Input() fieldToUse: string;
    @Input() showApplyTo: boolean;
    @Input() applyFilterTo: string;
    @Input() disableNormalizedCheckbox: boolean;
    @Input() showApplyToNewWidgets: boolean;
    @Input() isApplyFilterToNewWidgetsChecked: boolean;

    sectorRuleBuilderConfig: SectorRuleBuilderConfig;

    /**
     * constructor
     */
    constructor(private appStore: AppStore, private favoriteService: FavoriteService, private notificationService: NotificationService, private cdRef: ChangeDetectorRef) {
        super();
    }

    /**
     * ngOnInit
     */
    ngOnInit(): void {
        this.sectorRuleBuilderConfig = new SectorRuleBuilderConfig(
            LibColumnUtils.makeColumnTree(this.getColumnsFilter(), this.fieldToUse),
            null,
            false,
            false,
            SectorConstants.CUSTOM_RULE_BUILDER_HEADERS.CUSTOM_FILTER_RULE);
    }

    /**
     * Returns filter to select the columns to be used.
     */
    private getColumnsFilter(): ColumnFilter[] {
        return [
            createColumnFilter('isGroupable', '=', true),
            createColumnFilter('columnType', '!=', CompositionConstants.FACTOR_ATTRIBUTES),
            createColumnFilter('columnTag', '!=', 'portfolio_group'),
            createColumnFilter('levelColumns', '='),
            createColumnFilter('praadaBreakdown', '!=', true),
            createColumnFilter(ColumnConstants.FOR_TOP_DOWN, '!=', true)
        ];
    }

    /**
     * Open load favorite modal
     */
    openLoadFavoriteModal(): void {
        this.appStore.openLoadFavoriteModal$.next(
            new LoadFavoriteAction({
                type: FavoriteConstants.CUSTOM_SECTOR,
                treeType: FavoriteConstants.CUSTOM_SECTOR_FOLDER,
                displayName: FavoriteConstants.FILTER_LOWER + 's',
                callback: this.loadCustomSector,
                headerDisplayName: FavoriteConstants.FILTER_LOWER
            }));
    }

    /**
     * Open save favorite modal
     */
    openSaveFavoriteModal(): void {
        this.appStore.saveFavoriteAction$.next(
            new SaveFavoriteAction(
                this.filter.customSector,
                FavoriteConstants.FILTER_LOWER,
                FavoriteConstants.CUSTOM_SECTOR,
                FavoriteConstants.CUSTOM_SECTOR_FOLDER
            ));
    }

    /**
     * Load a favorite custom sector (filter)
     * this function is used as callback so need arrow to get the right scope
     */
    loadCustomSector = (favId: number, loadingMessage: string, forceRefresh?: boolean): void => {
        this.loadCustomSectorVersion(favId, loadingMessage, forceRefresh);
    }

    /**
     * Load a favorite custom sector (filter)
     * this function is used as callback so need arrow to get the right scope
     */
    loadCustomSectorVersion = (favId: number, loadingMessage: string, forceRefresh = false, isGlobal = false, versionId?: string): void => {
        this.favoriteService.getFavorite$(favId, loadingMessage, isGlobal, forceRefresh, versionId)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((customSector: CustomSector) => {
                this.filter.customSector = customSector;
                this.cdRef.detectChanges();
            }, error => {
                this.notificationService.error('failed to load custom sector (filter) with id: ' + favId, ErrorTypeConstants.BACK_END_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_GET_FAVORITE_ERROR);
                console.error(error);
            });
    }

    /**
     * To have the checkbox as ticked or not
     */
    onApplyFilterToNewWidgetsChanged(value: boolean) {
        this.isApplyFilterToNewWidgetsChecked = value;
        this.isApplyFilterToNewWidgetsCheckedChange.emit(this.isApplyFilterToNewWidgetsChecked);
    }
}
