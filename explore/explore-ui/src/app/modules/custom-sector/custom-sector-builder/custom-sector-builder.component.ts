import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {
    AuxAdvancedTreeListInterface,
    AuxButtonTypeEnum,
    AuxValuePairLabelPositionEnum
} from '@blk/aladdin-angular-components';
import {CoreRiskConstants} from '@blk/explore-ui-risk';
import {FavoriteConstants} from '@constants/favorite.constants';
import {SaveFavoriteAction} from '@models/favorite/save-favorite-action.model';
import {cloneDeep} from 'lodash';
import {BehaviorSubject} from 'rxjs';
import {AppStore} from '../../../app.store';
import {
    ColumnSectorRule,
    CustomSector,
    CustomSectorEventsService,
    CustomSectorItemComponent,
    SectorRuleBuilderConfig
} from '@blk/explore-ui-breakdown';
import {CoreFavoriteConstants, CoreFavoriteUtils, SubscribableComponent} from '@blk/explore-ui-core';
import {FavoriteService} from '@services/favorite';
import {takeUntil} from 'rxjs/operators';

/**
 * The component is used to define/save custom sector rule
 */
@Component({
    selector: 'app-custom-sector-builder',
    templateUrl: './custom-sector-builder.component.html',
    styleUrls: ['./custom-sector-builder.component.scss']
})
export class CustomSectorBuilderComponent extends SubscribableComponent implements OnInit {
    readonly AuxValuePairLabelPositionEnum = AuxValuePairLabelPositionEnum;
    readonly AuxButtonTypeEnum = AuxButtonTypeEnum;
    readonly CoreFavoriteConstants = CoreFavoriteConstants;
    coreFavoriteUtils = CoreFavoriteUtils;

    @Input()
    customSector: CustomSector;

    @Input()
    sectorRuleBuilderConfig: SectorRuleBuilderConfig;

    @Input()
    inputName: string;

    @Input()
    titleChangeCallBack: Function;

    @Input()
    draggedSector$: BehaviorSubject<AuxAdvancedTreeListInterface>;

    @ViewChild(CustomSectorItemComponent, {static: false})
    customSectorItemComponent: CustomSectorItemComponent;

    favoriteType: string;

    constructor(private appStore: AppStore, private customSectorEventsService: CustomSectorEventsService, private favoriteService: FavoriteService) {
        super();
    }

    ngOnInit() {
       this.favoriteType = this.inputName === CoreRiskConstants.CONFIG_TYPE.RISK_FACTOR_BREAKDOWN ? FavoriteConstants.FACTOR_CUSTOM_SECTOR : FavoriteConstants.CUSTOM_SECTOR;
    }

    /**
     * Method is invoked when custom sector name is changed
     */
    onSectorNameChange(sectorName: string) {
        this.customSector.title = sectorName;
        this.titleChangeCallBack();
    }

    /**
     * Method called on save custom sector button click.
     * It opens save favorite model dialog, to save custom sector as favorite
     */
    saveCustomSector() {
        const favType: string = this.inputName === CoreRiskConstants.CONFIG_TYPE.RISK_FACTOR_BREAKDOWN ? FavoriteConstants.FACTOR_CUSTOM_SECTOR : FavoriteConstants.CUSTOM_SECTOR;
        const favTreeType = this.inputName === CoreRiskConstants.CONFIG_TYPE.RISK_FACTOR_BREAKDOWN ? FavoriteConstants.FACTOR_CUSTOM_SECTOR_FOLDER : FavoriteConstants.CUSTOM_SECTOR_FOLDER;
        const customSectorToSave = cloneDeep(this.customSector);
        customSectorToSave.children = [];
        this.appStore.saveFavoriteAction$.next(
            new SaveFavoriteAction(
                customSectorToSave,
                FavoriteConstants.CUSTOM_SECTOR_TITLE.toLowerCase(),
                favType,
                favTreeType,
                () => {
                this.customSector.id = customSectorToSave.id;
                this.customSector.title = customSectorToSave.title;
                this.customSector.owner = customSectorToSave.owner;
                this.customSector.userPermGrps = customSectorToSave.userPermGrps;
                this.customSector.lastUpdatedBy = customSectorToSave.lastUpdatedBy;
                this.customSector.dateLastUpdated = customSectorToSave.dateLastUpdated;
                this.customSector.enterpriseDescription = customSectorToSave.enterpriseDescription;
                this.titleChangeCallBack();
            }
        ));
    }

    /**
     * Method to clear all defined rules
     */
    clearCustomSectorRules() {
        this.customSector.rule = new ColumnSectorRule();
        this.customSectorEventsService.setActiveCustomSector(this.customSectorItemComponent);
    }

    /**
     * Callback to load a custom sector favorite when a different version is loaded
     */
    loadCustomSectorVersion = (favId: string|number, loadingMessage: string, forceRefresh?: boolean, isGlobalFavorite?: boolean, versionId?: string): void => {
        this.favoriteService.getFavorite$(favId, loadingMessage, isGlobalFavorite, forceRefresh, versionId)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((customSector: CustomSector) => {
                this.customSector = cloneDeep(customSector);
            }, error => {
                console.error(error);
            });
    }
}
