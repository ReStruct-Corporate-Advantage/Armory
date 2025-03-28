import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {AuxTypeAheadSelectionChangedDetailInterface, AuxTypeAheadSuggestion, AuxTypeAheadSuggestionGroup, AuxTypeAheadValueChangedDetailInterface} from '@blk/aladdin-angular-components';
import get from 'lodash/get';
import {FavoriteUser} from '@interfaces/favorite-user.interface';
import {FavoriteService} from '@services/index';
import {CommonConstants} from '@constants/common.constants';
import {SubscribableComponent} from '@blk/explore-ui-core';
import {CompositionConstants} from '@constants/composition.constants';

/**
 * Favorite User Search Component
 * <app-favorite-user-search [favType]="favType"
 *                           [selectedFavoriteUserSubject$]="selectedFavoriteUserSubject$">
 * </app-favorite-user-search>
 */
@Component({
    selector: 'app-favorite-user-search',
    templateUrl: './favorite-user-search.component.html',
    styleUrls: ['./favorite-user-search.component.scss']
})
export class FavoriteUserSearchComponent extends SubscribableComponent implements OnInit {
    /** props for loading favorites */
    @Input() favType: string;
    @Input() selectedFavoriteUserSubject$: Subject<string>;

    /** aux-typeahead data */
    auxAllFavoriteUsersData: AuxTypeAheadSuggestionGroup[];
    auxFilteredFavoriteUsersData: AuxTypeAheadSuggestionGroup[];
    allFavoriteUsers: AuxTypeAheadSuggestion[];
    isLoading = true;

    /**
     * constructor
     */
    constructor(private favoriteService: FavoriteService, private changeDetectorRef: ChangeDetectorRef) {
        super();
    }

    /**
     * ngOnInit
     */
    ngOnInit(): void {
        this.loadFavoriteUsers(this.favType);
    }

    /**
     * on Dynamic Typeahead Value Changed
     */
    onDynamicTypeaheadValueChanged(event: CustomEvent<AuxTypeAheadValueChangedDetailInterface>): void {
        let filteredFavoriteUsers;
        if (get(event, 'detail.value')) {
            const searchValueLowercase = event.detail.value.toLowerCase();
            filteredFavoriteUsers = this.allFavoriteUsers.filter(element => {
                return element.displayValue.toLowerCase().includes(searchValueLowercase) || element.value.includes(searchValueLowercase) || this.checkIfSpaceSeparatedStringsPresentInTypeahead(element, searchValueLowercase);
            });
        } else {
            filteredFavoriteUsers = this.allFavoriteUsers;
            this.selectedFavoriteUserSubject$.next(null);
        }

        this.auxFilteredFavoriteUsersData = [{label: 'Users', values: filteredFavoriteUsers}];
    }

    /**
     * on Favorite User Selected
     */
    onFavoriteUserSelected(event: CustomEvent<AuxTypeAheadSelectionChangedDetailInterface>): void {
        if (event.detail.optionGroup.values[0].value) {
            this.selectedFavoriteUserSubject$.next(event.detail.optionGroup.values[0].value);
        }
    }

    /**
     * Method to load all of the users used to populate the selectized team drop down.
     */
    private loadFavoriteUsers(favType: string): void {
        if (favType === CompositionConstants.WHATIF_POS.TYPE) {
            favType = [...CompositionConstants.WHAT_IF_FAVORITE_TYPES.keys()].join(CommonConstants.COMMA_SEPARATOR);
        }
        this.favoriteService.getUsersForFavoriteType$(favType)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((response: FavoriteUser[]) => {
                this.isLoading = false;
                this.allFavoriteUsers = this.createAuxFavUserData(response);
                this.auxAllFavoriteUsersData = [{label: 'Users', values: this.allFavoriteUsers}];
                this.changeDetectorRef.markForCheck();

            }, error => {
                console.error(error);
            });
    }

    /**
     * Gets all the currencies and formats them into an object that can be used by the select box component
     */
    private createAuxFavUserData(data: FavoriteUser[]): AuxTypeAheadSuggestion[] {
        const auxUserData = [];
        for (const user of data) {
            auxUserData.push({displayValue: user.fullName, value: user.login});
        }

        return auxUserData;
    }

    /**
     * Returns true if typeahead words start with corresponding words in search string
     * For eg - "Test Value" should be showed in Typeahead when user types in "Tes Val"
     */
    checkIfSpaceSeparatedStringsPresentInTypeahead(typeAheadSuggestion: AuxTypeAheadSuggestion, searchString: string): boolean {
        const typeAheadWords = typeAheadSuggestion.displayValue.toLowerCase().split(" ");
        const searchStrings = searchString.split(CommonConstants.SINGLE_SPACE);

        // If number of words in typeahead is not equal to number of words in search string, return false
        if (typeAheadWords.length !== searchStrings.length) {
            return false;
        }

        // Check for every word and return true only every word of typeahead starts with corresponding word of search string
        return typeAheadWords.every((value: string, index: number) => {
            return value.startsWith(searchStrings[index]);
        });
    }
}
