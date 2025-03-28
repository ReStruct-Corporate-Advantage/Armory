import {get, isEmpty} from 'lodash';
import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    HostListener,
    Input,
    OnChanges,
    OnInit,
    Output,
    Renderer2,
    SimpleChanges,
    ViewChild
} from '@angular/core';
import {Subject} from 'rxjs';
import {debounceTime, distinctUntilChanged, switchMap, takeUntil} from 'rxjs/operators';
import {PortfolioSearchServiceInterface} from '../portfolio-search-service.interface';
import {PortfolioSearchItem} from '../portfolio-search-item.model';
import {
    AuxSearchFieldSearchValueChangedDetailInterface,
    AuxSearchFieldSelectionChangedDetailInterface,
    AuxSearchSelectOptionsInterface,
    AuxSearchTypeAheadOptionsInterface,
    AuxSelectOption,
    AuxSelectSelectionChangedDetailInterface,
    AuxTypeAheadSuggestionGroup
} from '@blk/aladdin-angular-components';
import {SubscribableComponent} from '@blk/explore-ui-core';
import {PortfolioSearchConstants} from '../portfolio-search.constants';
import {PortfolioSearchUtils} from './portfolio-search.utils';


/**
 * Explore Portfolio Search Component handles different types of events to emit portfolio:
 * 1. Pressing enter on searchBox, and clicking on 'Add Portfolio' before searchPortfolio => emitting portfolio without portfolio search
 * 2. Waiting for list to populate from portfolio search and clicking on populated item => updating portfolio with selected item
 * 3. adding more portfolio after putting comma => triggering searchPortfolio with the term after comma
 */
@Component({
    // tslint:disable-next-line:component-selector
    selector: 'blk-portfolio-search',
    templateUrl: './portfolio-search.component.html',
    styleUrls: ['./portfolio-search.component.scss']
})
export class PortfolioSearchComponent extends SubscribableComponent implements OnInit, AfterViewInit, OnChanges {
    /** emit the string term to where this component is used */
    @Output() emitPortfolioSearchItem: EventEmitter<PortfolioSearchItem> = new EventEmitter<PortfolioSearchItem>();

    /** emit the portfolio used */
    @Output() emitPortfolioForTracking: EventEmitter<PortfolioSearchItem> = new EventEmitter<PortfolioSearchItem>();

    /** emit the value of the search field as it changes */
    @Output() emitSearchValueChange: EventEmitter<string> = new EventEmitter<string>();

    /** emit the value of the selected property when changed manually */
    @Output() emitWhatIfProp: EventEmitter<boolean> = new EventEmitter<boolean>();

    /** PortfolioSearchService that implements PortfolioSearchServiceInterface as an input */
    @Input() portfolioSearchService: PortfolioSearchServiceInterface;

    @Input() isDisabled = false;

    /** Clear search field when add portfolio is performed */
    @Input() clearOnAdd = true;

    /** Size of the search field component */
    @Input() searchSize = 'regular';

    /** Hide "Add Portfolio" button */
    @Input() isAddBtnHidden = true;

    /** Determine if select and search field should be stacked view */
    @Input() isStackedView = false;

    /** Search Type will determine if select box for choosing portfolio vs what-if portfolio is present */
    @Input() searchType = 'parametric';

    /** Search bar placeholder */
    @Input() searchPlaceholder = 'Search portfolios';

    /** String that sets the text in the search field */
    @Input() searchString: string;

    /** Boolean to represent if parent component is benchmark */
    @Input() isBenchmarkSearch: boolean;

    /** Boolean to represent if parent component is batchRow */
    @Input() isBatchRowSearch: boolean;

    /** Boolean to represent if parent component is portfolio modelling */
    @Input() isPortfolioModellingSearch: boolean;

    // searchString parsed on each comma to make array of individual portfolios
    searchTerms: string[];

    /** Select option label default being 'Portfolio Types' and no label with null */
    @Input() selectOptionLabel = 'Portfolio Types';

    @ViewChild('portSearchField', {static: false}) portSearchField: any;


    /** let\'s the component know if it's a what if portfolio being loaded */
    @Input() isWhatIfLoaded = false;

    /** properties to control open and close of what if portfolio load modal */
    @Output() whatIfTypeSelected: EventEmitter<void> = new EventEmitter<void>();

    /** portfolio types initial props */
    selectProps: AuxSearchSelectOptionsInterface;

    isAddBtnDisabled = true;

    readonly TAB_KEY: string = 'Tab';

    // Boolean to check whether search string is modified or not
    initialSearchString: string;

    // request params sent for searchPortfolio$
    private requestedParams: {term: string, includePorts: boolean, includeWhatIfPorts: boolean};

    // default typeahead props
    // the suggestionType is 'optional' so that defocusing the input without selecting a suggestion will not clear the text from the field
    // ignorePattern: needed so the typeahed filters correctly when entering comma separated portfolios.  Tells the typeahead to ignore everything but last portfolio in list.
    // Example- user enters 'LACORE, IP, PEP'.  Typeahead will ignore 'LACORE, IP, ' and only filter typeahead suggestions on 'PEP'.
    typeaheadProps: AuxSearchTypeAheadOptionsInterface = {
        type: 'tabular',
        isLoading: false,
        isTextUpperCase: true,
        suggestionType: 'optional',
        ignorePattern: new RegExp('.*[, ]')
    };

    // typeAhead observable and subscription and subject
    private typeAheadItemsSubject: Subject<string> = new Subject<string>();

    // portfolioSearchItem to emit on 'Add Portfolio'
    private portfolioSearchItem: PortfolioSearchItem;

    // portfolio type for the typeahead list
    selectedPortfolioType: AuxSelectOption;

    // flag needed to distinguish (searchValueChanged) event being triggered by a user typing input
    // versus an item being selected from the typeahead
    private isTypeaheadOptionSelected = false;

    /**
     * constructor
     */
    constructor(private changeDetectorRef: ChangeDetectorRef, private eRef: ElementRef, private renderer: Renderer2) {
        super();
    }

    /**
     * ngOnInit
     */
    ngOnInit(): void {
        this.initialSearchString = this.searchString;
        // match the initial value of the select

        if (this.isStackedView) {
            const selectProps = PortfolioSearchUtils.getSelectProps();
            selectProps.data[0].values[0].isSelected = true;
            this.selectProps = selectProps;
            this.selectedPortfolioType = this.selectProps.data[0].values[0];
        } else {
            this.refreshSelectProps(this.isWhatIfLoaded ? 1 : 0);
            this.selectedPortfolioType = this.selectProps.selected as AuxSelectOption;
        }

        // set initial search terms if it was passed in
        this.searchTerms = this.searchString ? this.searchString.split(',').map(term => term.toUpperCase().trim()) : [];

        // observable to return typeAhead items list
        this.typeAheadItemsSubject
            .pipe(
                takeUntil(this.ngUnsubscribe),
                debounceTime(300),
                // ignore new term if same as previous term
                distinctUntilChanged(),
                switchMap((term: string) => {
                    this.requestedParams = {
                        term,
                        includePorts: this.selectedPortfolioType.value.includePorts,
                        includeWhatIfPorts: this.selectedPortfolioType.value.includeWhatIfPorts
                    };

                    return this.portfolioSearchService.searchPortfolio$(
                        term,
                        this.selectedPortfolioType.value.includePorts,
                        this.selectedPortfolioType.value.includeWhatIfPorts
                    );
                })
            )
            .subscribe((data: SearchedPortfolioData) => {
                // If the typeAhead isLoading flag was already set to false, then we don't want to populate with any results
                if (!this.typeaheadProps.isLoading) {
                    return;
                }
                this.typeaheadProps = {
                    ...this.typeaheadProps,
                    isLoading: false,
                    filterResults: false,
                    isContinuous: false,
                    data: this.createTypeAheadItemsList(data)
                };
                this.changeDetectorRef.markForCheck();
            });
    }

    ngAfterViewInit(): void {
        if (!this.portSearchField) {
            return;
        }
        // Put a listener onto the keydown event
        this.renderer.listen(this.portSearchField.el, 'keydown', this.keyDownEventListener);
    }

    ngOnChanges(changes: SimpleChanges) {
        // to update the selected property when portfolio is switched (normal to what-if OR vice-versa)
        if (changes.isWhatIfLoaded && changes.isWhatIfLoaded.currentValue !== changes.isWhatIfLoaded.previousValue) {
            // refresh the portfolio type selection based on "isWhatIfLoaded" input
            this.refreshSelectProps(changes.isWhatIfLoaded.currentValue ? 1 : 0);
            this.selectedPortfolioType = this.selectProps.selected as AuxSelectOption;
        }
    }

    /**
     * Keydown event listener callback
     */
    keyDownEventListener = (event: KeyboardEvent): void => {
        // We're adding a keydown listener onto the search field because the aux-search-field (inputBlur) method doesn't handle tab out
        // When you hit 'Tab', the input field focuses to a button within aux-search-field which doesn't trigger a blur event
        if (event.code === this.TAB_KEY) {
            if (this.isBatchRowSearch) {
                // If the user tabs out of the search field in a batch row, just set it immediately
                this.emitPortfolioSearchItem.emit(new PortfolioSearchItem(this.searchString.toUpperCase()));
                this.emitPortfolioForTracking.emit(new PortfolioSearchItem(this.searchString.toUpperCase()));
                this.typeaheadProps = {...this.typeaheadProps, data: [], isLoading: false};
            }
        }
    }

    /**
     * Populate typeahead with SearchedPortfolioData.
     *
     * Results filtered by search type (i.e. portfolio or what-if portfolio) on server side
     * @param data from portfolioSearchService.searchPortfolio$
     */
    createTypeAheadItemsList(data: SearchedPortfolioData): AuxTypeAheadSuggestionGroup[] {
        const typeAheadValues = {tickerList: [], fullNameList: []};
        if (data) {
            data.searchResults.forEach(resultItem => {
                typeAheadValues.tickerList.push({
                    displayValue: resultItem.ticker,
                    // portfolios have ticker, fullName, currency, code
                    // what-if ports have ticker, fullName, type, id
                    value: new PortfolioSearchItem(
                        resultItem.ticker,
                        resultItem.fullName,
                        resultItem.currency,
                        resultItem.code,
                        resultItem.type,
                        resultItem.id
                    )
                });
                typeAheadValues.fullNameList.push({displayValue: resultItem.fullName});
            });
        }

        return [
            {label: 'Ticker', values: typeAheadValues.tickerList, isKey: true},
            {label: 'Full Name', values: typeAheadValues.fullNameList}
        ];
    }

    onBlur(): void {
        if (this.searchString && !this.isDuplicatedRequest() && !this.isBatchRowSearch) {
            this.typeAheadItemsSubject.next(this.searchString); // immediately call typeahead when user clicks away
        }
    }

    /**
     * Called when additional character entered into search field, item from typeahead selected, or portfolio type is changed
     *
     * Called immediately after onSearchSelectionChanged
     */
    onSearchValueChanged(event: CustomEvent<AuxSearchFieldSearchValueChangedDetailInterface>): void {
        // if onSearchValueChanged is triggered by selecting an item from the typeahead, the event will only contain the last item
        // in the comma separated string.  We shouldn't do anything in this case and let onSearchSelectionChange handle it.
        // ie. IP,LACORE,PEP entered by user. When PEP selected from typeahead, this event will only contain PEP.

        if (get(event, 'detail')) {
            // reset flag
            this.isTypeaheadOptionSelected = false;

            // event contains an update to the portfolio type select
            if (get(event, 'detail.submitValue.parameter')) {
                this.selectedPortfolioType = event.detail.submitValue.parameter;
                // emit the change in portfolio type selection to let the parent component know about it.
                // This is required by benchmark selector to avoid making call for port info on mouse-enter
                // if the search type is OTHER and search selection is what-if
                if (this.isBenchmarkSearch) {
                    this.emitWhatIfProp.emit(this.selectedPortfolioType.displayValue === PortfolioSearchConstants.WHAT_IF_PORTFOLIO);
                }
            }

            // get the latest search string and then parse into individual search terms (portfolios)
            this.searchString = event.detail.submitValue ? event.detail.submitValue.searchValue : null;
            this.emitSearchValueChange.emit(this.searchString);
            if (this.searchString) {
                this.searchTerms = this.searchString.split(',').map(term => term.toUpperCase().trim());
            }

            if (!this.searchTerms || isEmpty(this.searchTerms) || !this.searchString) {
                // no search terms
                this.isAddBtnDisabled = true;
                this.typeaheadProps = {...this.typeaheadProps, data: [], isLoading: false};
            } else if (!this.searchTerms[this.searchTerms.length - 1]) {
                // last search term is empty, i.e. immediately following a comma [PEP,LEH_AGG,'']
                this.typeaheadProps = {...this.typeaheadProps, data: [], isLoading: false};
            } else {
                this.portfolioSearchItem = null;
                // populate typeahead with latest search term
                this.typeaheadProps = {...this.typeaheadProps, isLoading: true};
                this.typeAheadItemsSubject.next(this.searchTerms[this.searchTerms.length - 1]);
            }
            // clear typeahead and search str if portfolio type is changed
            if (get(event, 'detail.type') === 'selectionChanged') {
                this.typeaheadProps = {
                    ...this.typeaheadProps,
                    data: [],
                    isLoading: false
                };
                this.searchTerms = [];
                this.searchString = this.isBenchmarkSearch || !this.isWhatIfLoaded ? this.searchString : '';
                this.portfolioSearchItem = null;
                this.isAddBtnDisabled = true;
            }
            this.isAddBtnDisabled = this.searchString && isEmpty(this.searchTerms);
            this.changeDetectorRef.markForCheck();
        }
    }

    /**
     * Called when item selected (clicked on) from typeahead
     */
    onSearchSelectionChanged(event: CustomEvent<AuxSearchFieldSelectionChangedDetailInterface>): void {
        // Prevent type-ahead from populating the input with `option.displayValue` instead of `searchValue`
        event.preventDefault();
        // will only be the single term from typeahead
        const selectedTerm =
            this.selectedPortfolioType.displayValue === PortfolioSearchConstants.PORTFOLIO
                ? event.detail.value.searchValue
                : event.detail.value.option.value.fullName;

        // replace the incomplete last search term with the new selected one
        this.searchTerms[this.searchTerms.length - 1] = selectedTerm.toUpperCase().trim();
        this.searchString = this.searchTerms.join(', ');
        this.emitSearchValueChange.emit(this.searchString);

        // For Other Benchmark, portfolio modelling and portfolio search in batch row config, if item is selected from TypeAhead it should get portfolio Information, no need to hit enter
        if (this.isBenchmarkSearch || this.isBatchRowSearch || this.isPortfolioModellingSearch) {
            const portfolio = this.selectedPortfolioType.value.includeWhatIfPorts || this.isPortfolioModellingSearch
                ? event.detail.value.optionGroup.values[0].value
                : new PortfolioSearchItem(this.searchString.toUpperCase());
            this.emitPortfolioSearchItem.emit(portfolio);
            this.initialSearchString = this.searchString;
        }

        // set flag for onSearchValueChanged()
        this.isTypeaheadOptionSelected = true;

        // single search term (portfolio) entered
        if (this.searchTerms.length === 1) {
            this.portfolioSearchItem = event.detail.value.optionGroup.values[0].value;
        }

        // clear out the typeahead
        // Note: due to UX component change detection, must clear using spread operator
        this.typeaheadProps = {
            ...this.typeaheadProps,
            data: undefined,
            isLoading: false
        };
    }

    /**
     * Update portfolio type if the select box value is changed in the stacked view
     * @param event: contains the new select box value
     */
    onPortfolioTypeChange(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        if (get(event, 'detail')) {
            this.selectedPortfolioType = event.detail.value as AuxSelectOption;
            if (this.selectedPortfolioType.displayValue === PortfolioSearchConstants.WHAT_IF_PORTFOLIO) {
                this.whatIfTypeSelected.emit();
            }
        }
    }

    /**
     * Emit portfolio when user clicks outside portfolio search field item in case of other benchmark
     */
    @HostListener('document:click', ['$event'])
    clickout(event: MouseEvent): void {
        // Emit only if search string is changed, it is called from benchmark search and user clicks outside search-field component
        if (!this.eRef.nativeElement.contains(event.target) && this.isBenchmarkSearch && this.initialSearchString !== this.searchString && !this.isWhatIfLoaded) {
            this.emitPortfolioSearchItem.emit(new PortfolioSearchItem(this.searchString.toUpperCase()));
            this.emitPortfolioForTracking.emit(new PortfolioSearchItem(this.searchString.toUpperCase()));
            // Reset searchStringChanged
            this.initialSearchString = this.searchString;
        }
    }

    /**
     * on search button clicked
     */
    onAddPortfolio(): void {
        // do not search for what-if unless user has selected from typeahead
        if (this.selectedPortfolioType.displayValue !== PortfolioSearchConstants.PORTFOLIO) {
            if (!this.isTypeaheadOptionSelected) {
                return;
            }
        }
        // attempting to search on empty str
        if (isEmpty(this.searchTerms) || !this.searchString) {
            return;
        }
        const searchItem = new PortfolioSearchItem(this.searchTerms.join(', ').toUpperCase());
        if (this.searchTerms && this.searchTerms.length > 1) {
            // comma separated list of portfolios.  create PortfolioSearchItem with searchTerms as comma separated string
            this.emitPortfolioSearchItem.emit(searchItem);
            this.emitPortfolioForTracking.emit(searchItem);
        } else if (this.portfolioSearchItem) {
            // single portfolio, emit portfolioSearchItem if it is set
            this.emitPortfolioSearchItem.emit(this.portfolioSearchItem);
            this.emitPortfolioForTracking.emit(this.portfolioSearchItem);
        } else if (this.searchTerms) {
            // single portfolio, create PortfolioSearchItem with searchTerm and emit
            this.emitPortfolioSearchItem.emit(searchItem);
            this.emitPortfolioForTracking.emit(searchItem);
        }
        // clear input after portfolio has been added
        // Note: due to UX component change detection, must clear using spread operator
        this.typeaheadProps = {
            ...this.typeaheadProps,
            data: undefined,
            isLoading: false
        };
        this.searchTerms = [];
        this.searchString = this.isBenchmarkSearch || !this.clearOnAdd ? this.searchString : '';
        this.portfolioSearchItem = null;
        this.initialSearchString = this.searchString;
    }

    /**
     * isDuplicatedRequest
     */
    private isDuplicatedRequest(): boolean {
        return this.requestedParams
            && this.requestedParams.term === this.searchString.toUpperCase()
            && this.requestedParams.includePorts === this.selectedPortfolioType.value.includePorts
            && this.requestedParams.includeWhatIfPorts === this.selectedPortfolioType.value.includeWhatIfPorts;
    }

    /**
     * handy method to refresh select props for this component
     */
    private refreshSelectProps(index: number): void {
        this.selectProps = PortfolioSearchUtils.getSelectProps();
        this.selectProps.selected = {
            ...this.selectProps.data[0].values[index]
        };
    }
}

/**
 * data from portfolioSearchService.searchPortfolio$
 */
interface SearchedPortfolioData {
    searchResults: PortfolioSearchItem[];
}
