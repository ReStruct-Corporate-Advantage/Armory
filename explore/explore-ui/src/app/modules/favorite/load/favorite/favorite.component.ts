import {
    AuxSearchFieldSearchValueChangedDetailInterface,
    AuxSearchSelectOptionsInterface,
    AuxSelectOption,
    AuxSelectSelectionChangedDetailInterface
} from '@blk/aladdin-angular-components';
import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {BehaviorSubject, Observable, of, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {FavoriteTreeComponent} from '../favorite-tree/favorite-tree.component';
import {
    CoreUserMetaDataStore,
    ExploreSelectOption,
    ExploreSelectOptionGroup,
    SubscribableComponent,
    CoreFavoriteConstants
} from '@blk/explore-ui-core';
import {FavoriteConstants} from '@constants/favorite.constants';
import {FavoriteCallback} from '@models/favorite/load-favorite-action.model';
import {BreakdownFavoriteConstants} from '@blk/explore-ui-breakdown';
import {get} from 'lodash';
import {PortfolioSearchUtils, PortfolioSearchConstants} from '@blk/explore-ui-portfolio-search';
import {ModalStateAction} from '@models/favorite/modal-state-action.enum';
import {ModalStateActionInfo} from '@models/favorite/modal-state-action-info.interface';
import {ModalInvokeSource} from '@models/favorite/modal-invoke-source.enum';

/**
 * Favorite Component
 *  displays "My favorite", "Team favorite", and "Enterprise tree" in accordion,
 *  searches favorite nodes in the trees,
 *  and loads selected favorite node
 *
 *  <app-favorite [favType]="favType"
 *                [favTreeType]="favTreeType"
 *                [favDisplayName]="favDisplayName"
 *                [loadEnterpriseTree?]=true | false
 *                [loadFavoriteCallBack]="loadFavoriteCallBack">
 *  </app-favorite>
 *
 *  <ng-container *ngIf="(openLoadFavoriteModal$ | async).type">
 *      <app-favorite [favType]="(openLoadFavoriteModal$ | async).type"
 *                    [favTreeType]="(openLoadFavoriteModal$ | async).treeType"
 *                    [favDisplayName]="(openLoadFavoriteModal$ | async).displayName"
 *                    [loadEnterpriseTree]="(openLoadFavoriteModal$ | async).loadEnterpriseTree"
 *                    [loadFavoriteCallBack]="(openLoadFavoriteModal$ | async).callback"
 *                    (modalClosed)="closeModal()">
 *      </app-favorite>
 *  </ng-container>
 */
@Component({
    selector: 'app-favorite',
    templateUrl: './favorite.component.html',
    styleUrls: ['./favorite.component.scss']
})
export class FavoriteComponent extends SubscribableComponent implements OnInit {
    readonly FavoriteConstants = FavoriteConstants;

    readonly BreakdownFavoriteConstants = BreakdownFavoriteConstants;

    // my favorite tree component reference
    @ViewChild('myFavorite', {static: false}) myFavorite: FavoriteTreeComponent;

    @Output() closeAction = new EventEmitter<ModalStateActionInfo>();

    // variables for load favorites
    @Input() favType: string;
    @Input() favTreeType: string;
    @Input() favDisplayName: string;
    @Input() loadEnterpriseTree: boolean;
    @Input() loadFavoriteCallBack: FavoriteCallback;

    @Input() stickySearch?: boolean;
    @Input() subCategoryData?: ExploreSelectOptionGroup[];

    @Input() isSecuritySearch = false;
    @Input() isPartOfModal = false;
    @Input() sourceUniqueId?: string;
    @Input() invokingSourceId?: ModalInvokeSource;
    @Input() hidePortfolioTypeSelect = false;
    @Input() showAladdinReport = false;

    selectedFavoriteNode$: Subject<any> = new Subject<any>();

    // to filter favorite tree data based on the term
    favoriteSearchTermSubject$: BehaviorSubject<string> = new BehaviorSubject<string>(null);

    // to update in favorite-user-search and subscribe in favorite-tree
    selectedFavoriteUserSubject$: BehaviorSubject<string> = new BehaviorSubject<string>(null);

    readonly global$: Observable<string> = of(CoreFavoriteConstants.GLOBAL_USER);
    readonly login$: Observable<string> = of(CoreUserMetaDataStore.userMetaData.login);
    readonly admin$: Observable<string> = of(FavoriteConstants.ADMIN_USER);
    readonly portfolioSpecific$: Observable<string>  = of(FavoriteConstants.PORTFOLIO_SPECIFIC_USER);

    /** for html template */
    isExpanded: boolean;

    selectProps: AuxSearchSelectOptionsInterface;

    /**
     * ngOnInit
     */
    ngOnInit(): void {
        if (!!this.subCategoryData?.length) {
            // we need selectProps only in case of subcategory data (what if portfolio case)
            const selectProps = PortfolioSearchUtils.getSelectProps();
            selectProps.data[0].values[1].isSelected = true;
            this.selectProps = selectProps;
        }

        // close modal if applicable
        this.selectedFavoriteNode$
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(() => {
                if (this.isPartOfModal) {
                    this.closeAction.emit({
                        reason: ModalStateAction.FAVORITE_SELECTED,
                        sourceUniqueId: this.sourceUniqueId,
                        favoriteType: this.favType,
                        source: this.invokingSourceId
                    });
                }
            });

        this.favoriteSearchTermSubject$
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((payload: string) => {
                this.isExpanded = !!payload;
            });
    }

    /**
     * on search value changed
     */
    onSearchValueChanged(event: CustomEvent<AuxSearchFieldSearchValueChangedDetailInterface>): void {
        this.favoriteSearchTermSubject$.next(event.detail.submitValue.searchValue.toLowerCase());
    }

    /**
     * exposed method to refresh my favorite tree
     */
    refreshMyFavoriteTree = () => {
        this.myFavorite.generateFavTreeForOwner();
    }

    /**
     * update (what-if) favType when a different one is selected from the select box
     */
    onSubCategoryChanged(ev: CustomEvent<ExploreSelectOption>) {
        this.favType = ev.detail.value.value;
    }

    /**
     * Update portfolio type if the select box value is changed in the stacked view
     * @param event: contains the new select box value
     */
    onPortfolioTypeChange(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        if (get(event, 'detail') && (event.detail.value as AuxSelectOption).displayValue === PortfolioSearchConstants.PORTFOLIO) {
            this.closeAction.emit({
                reason: ModalStateAction.MODAL_CANCELED,
                sourceUniqueId: this.sourceUniqueId,
                favoriteType: this.favType,
                source: this.invokingSourceId
            });
        }
    }
}
