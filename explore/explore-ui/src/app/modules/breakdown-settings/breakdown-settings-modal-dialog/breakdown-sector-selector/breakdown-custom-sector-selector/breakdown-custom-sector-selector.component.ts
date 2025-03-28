import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {CoreUserMetaDataStore} from '@blk/explore-ui-core';
import {CoreRiskConstants} from '@blk/explore-ui-risk';
import {FavoriteConstants} from '@constants/favorite.constants';
import {BreakdownBuilderSettings} from '@blk/explore-ui-breakdown';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {BaseBreakdownSectorTree} from '../base-breakdown-sector-tree';
import {takeUntil} from 'rxjs/operators';
import {AuxAdvancedTreeListInterface} from '@blk/aladdin-angular-components';

/**
 * Component to select custom sector saved as favorite to configure breakdown
 */
@Component({
    selector: 'app-breakdown-custom-sector-selector',
    templateUrl: './breakdown-custom-sector-selector.component.html'
})
export class BreakdownCustomSectorSelectorComponent extends BaseBreakdownSectorTree implements OnInit {

    @Input()
    breakdownBuilderSettings: BreakdownBuilderSettings;

    // to update in favorite-user-search and subscribe in favorite-tree
    selectedFavoriteUserSubject$: BehaviorSubject<string> = new BehaviorSubject<string>(null);

    readonly login$: Observable<string> = of(CoreUserMetaDataStore.userMetaData.login);
    readonly admin$: Observable<string> = of(FavoriteConstants.ADMIN_USER);

    favType: string;

    folderType: string;

    isExpanded: boolean;

    accordionCustomStyle = {
        'aux-accordion-expansion-panel__container': {
            borderTop: 0,
            borderBottom: 0
        },
        'aux-accordion-expansion-panel__content': {
            paddingTop: 0,
            paddingBottom: 0
        }
    };

    constructor(protected changeDetectorRef: ChangeDetectorRef) {
        super(changeDetectorRef);
    }

    ngOnInit() {
        this.favType = this.breakdownBuilderSettings.inputName === CoreRiskConstants.CONFIG_TYPE.RISK_FACTOR_BREAKDOWN ? FavoriteConstants.FACTOR_CUSTOM_SECTOR : FavoriteConstants.CUSTOM_SECTOR;
        this.folderType = this.breakdownBuilderSettings.inputName === CoreRiskConstants.CONFIG_TYPE.RISK_FACTOR_BREAKDOWN ? FavoriteConstants.FACTOR_CUSTOM_SECTOR_FOLDER : FavoriteConstants.CUSTOM_SECTOR_FOLDER;
        this.searchTermSubject$
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((searchValue: string) => {
                this.isExpanded = !!searchValue;
            });
    }

    /**
     * @inheritDoc
     */
    getSourceData(): AuxAdvancedTreeListInterface[] {
        // Method not relevant for this component, implementing abstract method
        return undefined;
    }
}
