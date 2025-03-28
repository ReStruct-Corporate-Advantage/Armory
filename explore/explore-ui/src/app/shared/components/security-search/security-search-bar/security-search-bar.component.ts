import {ChangeDetectorRef, Component, EventEmitter, OnInit, Output} from '@angular/core';
import {AuxSearchFieldClickSearchDetailInterface, AuxSearchFieldSearchValueChangedDetailInterface, AuxSearchFieldSelectionChangedDetailInterface, AuxSearchTypeAheadOptionsInterface, AuxTypeAheadSuggestion, AuxTypeAheadSuggestionGroup} from '@blk/aladdin-angular-components';
import {Subject} from 'rxjs';
import {SecuritySearchService} from '@services/security-search/security-search.service';
import {debounceTime, filter, switchMap, takeUntil} from 'rxjs/operators';
import {get, isEmpty, isNil} from 'lodash';
import {SecuritySearchItem} from '@interfaces/security-search-item.interface';
import compositionColumnsConfigJson from '@assets/composition-config/CompositionColumnsConfig.json';
import {
    AlertConstants,
    CalendarDateUtils,
    ColumnConstants,
    ColumnDefinition,
    CoreColumnUtils, DateStore,
    ErrorTypeConstants,
    SubscribableComponent, UIErrorParameters
} from '@blk/explore-ui-core';
import {NotificationService} from '@services/notification';
import {CommonConstants} from '@constants/common.constants';

/**
 * Shared security search bar component.  Populates suggested securities with data retrieved from backend.
 */
@Component({
    selector: 'app-security-search-bar',
    templateUrl: './security-search-bar.component.html',
    styleUrls: ['./security-search-bar.component.scss']
})
export class SecuritySearchBarComponent extends SubscribableComponent implements OnInit {

    // security search errors
    private static readonly ERROR_SECURITY_NOT_FOUND = 'Security not found';

    /**
     * Emits the security that has been added from the search bar and validated
     */
    @Output()
    securitySelected = new EventEmitter<SecuritySearchItem>();

    // term that we are sending to the backend to search
    searchTerm = '';

    // text that need to be displayed as placeholder in search bar
    placeholderText = 'Search by ticker or cusip';

    typeaheadProps: AuxSearchTypeAheadOptionsInterface = {
        data: [],
        type: 'tabular',
        isLoading: false,
        suggestionType: 'optional',
        clearOnSelection: true
    };

    // stream of search term
    private typeaheadSearchTermSubject = new Subject<string>();

    constructor(private cdRef: ChangeDetectorRef, private securitySearchService: SecuritySearchService, private notificationService: NotificationService) {
        super();
    }

    ngOnInit() {
        // initialize the service for populating the typeahead
        this.typeaheadSearchTermSubject.pipe(
            filter((term: string) => term.length >= 2),
            debounceTime(300),
            switchMap((term: string) => {
                this.typeaheadProps = {...this.typeaheadProps, isLoading: true};
                this.cdRef.markForCheck();
                // uses T-1 or URL date override if present
                // replace space with escaped char before sending the request
                return this.securitySearchService.searchSecurity$(term.replace(/\s/g, CommonConstants.ESCAPED_SPACE_CHAR), DateStore.getDefaultMaxDateString(), false);
            }),
            takeUntil(this.ngUnsubscribe)  // takeUntil must be last otherwise subscription is leaked to securitySearchService in switchMap
        ).subscribe((results: SecuritySearchItem[]) => {
            this.typeaheadProps = {
                ...this.typeaheadProps,
                isLoading: false,
                filterResults: false,
                data: this.createTypeAheadItemsList(results)
            };
            this.cdRef.markForCheck();
        });

        if (CoreColumnUtils.getColumnDefByTag(ColumnConstants.SEDOL)) {
            this.placeholderText = this.placeholderText.concat(' or ' + ColumnConstants.SEDOL);
        }

        if (CoreColumnUtils.getColumnDefByTag(ColumnConstants.ISIN)) {
            this.placeholderText = this.placeholderText.concat(' or ' + ColumnConstants.ISIN);
        }
    }

    /**
     * Formats the results for the typeahead
     * @param results Data from backend
     */
    private createTypeAheadItemsList(results: SecuritySearchItem[]): AuxTypeAheadSuggestionGroup[] {
        const allColumnDefinitions: ColumnDefinition[] = [];
        const keyColTagMapping = compositionColumnsConfigJson['securitySearchKeyColTagMapping'];
        const colTagKeyMapping = compositionColumnsConfigJson['securitySearchColTagKeyMapping'];
        Object.keys(results[0]).forEach(colTag => {
            if (keyColTagMapping[colTag]) {
                colTag = keyColTagMapping[colTag];
            }
            const colDef = CoreColumnUtils.getColumnDefByTag(colTag);
            if (colDef) {
                allColumnDefinitions.push(colDef);
            }
        });
        return allColumnDefinitions.map(colDef => {
            return {
                label: colDef.title,
                values: results.map(result =>
                    ({
                        displayValue: result[colTagKeyMapping[colDef.columnTag] ? colTagKeyMapping[colDef.columnTag] : colDef.columnTag],
                        value: colDef.columnTag === ColumnConstants.CUSIP ? result : undefined
                    } as AuxTypeAheadSuggestion)
                ),
                isKey: colDef.columnTag === ColumnConstants.CUSIP
            };
        });
    }

    /**
     * Called when the value in the search field is changed
     */
    onSearchValueChanged(event: CustomEvent<AuxSearchFieldSearchValueChangedDetailInterface>): void {
        if (get(event, 'detail')) {
            // new value to search on
            this.searchTerm = event.detail.submitValue.searchValue.trim();
            if (isEmpty(this.searchTerm)) {
                // clear data and stop loading
                this.typeaheadProps = {...this.typeaheadProps, data: [], isLoading: false};
            } else {
                // update typeahead
                this.typeaheadSearchTermSubject.next(this.searchTerm);
            }
        }
    }

    /**
     * Called when a user searches without selecting security from typeahead.
     *
     * Tries to match ONLY against cusip
     */
    validateThenAddSecurity(event: CustomEvent<AuxSearchFieldClickSearchDetailInterface>): void {
        this.searchTerm = event.detail.submitValue.searchValue.trim();
        // see if user has entered a valid cusip
        this.securitySearchService.searchSecurity$(this.searchTerm, DateStore.getDefaultMaxDateString(), false)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((results: SecuritySearchItem[]) => {
                // see if security was found
                const security: SecuritySearchItem = results.find(result => result.cusip === this.searchTerm);
                // if security is found, add it otherwise send error message
                isNil(security) ? this.notificationService.error(AlertConstants.NOTIFICATION.ERROR_LOADING_SECURITIES + CommonConstants.COLON + CommonConstants.SINGLE_SPACE + this.searchTerm, ErrorTypeConstants.UI_VALIDATION_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_SEARCH_SECURITY_ERROR) : this.securitySelected.emit(security);
                this.searchTerm = '';
            });
    }

    /**
     * Called when a user selects a security from typeahead
     */
    addSecurity(event: CustomEvent<AuxSearchFieldSelectionChangedDetailInterface>): void {
        if (get(event, 'detail.value')) {
            // selected from typeahead so we know it's valid
            this.securitySelected.emit(event.detail.value.optionGroup.values[0].value);
        }
        this.searchTerm = '';
    }

}
