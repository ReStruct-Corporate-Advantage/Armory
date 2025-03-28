import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {Observable, of} from 'rxjs';

import {PortfolioSearchComponent} from './portfolio-search.component';
import {CUSTOM_ELEMENTS_SCHEMA, Renderer2, Type} from '@angular/core';
import {PortfolioSearchItem} from '../portfolio-search-item.model';
import {AuxTypeAheadSuggestion} from '@blk/aladdin-angular-components';

describe('ExplorePortfolioSearchComponent', () => {
    let component: PortfolioSearchComponent;
    let fixture: ComponentFixture<PortfolioSearchComponent>;
    let renderer2: Renderer2;

    const portfolioSearchServiceStub = {
        searchPortfolio$: jest.fn((): Observable<any> => {
            return of({
                searchResults: [
                    {
                        code: '9214',
                        currency: 'USD',
                        familyTree: [],
                        fullName: 'BGF Pacific Equity Fund',
                        ticker: 'PEP'
                    }, {
                        code: '-74272',
                        currency: 'USD',
                        familyTree: [],
                        fullName: 'Perf Benchmark for PEP-AU',
                        ticker: 'PEP--HP'
                    }, {
                        code: '-551466',
                        currency: 'USD',
                        familyTree: [],
                        fullName: '1885 PRIVATE OPPORTUNITIES FUND, L.P.',
                        ticker: 'PEP-1885'
                    }
                ]
            });
        })
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [PortfolioSearchComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            imports: [
                FormsModule,
                CommonModule,
            ],
            providers: [Renderer2]
        });

        fixture = TestBed.createComponent(PortfolioSearchComponent);
        component = fixture.componentInstance;
        renderer2 = fixture.componentRef.injector.get<Renderer2>(Renderer2 as Type<Renderer2>);
        jest.spyOn(renderer2, 'listen').mockImplementation((_a: any, _b: any, _c: any) => () => {});
        component.portSearchField = {el: document.createElement('div')};
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    describe('createTypeAheadItemsList Test', () => {
        it('should createTypeAheadItemsList from the returned data from searchPortfolio$', (done: any) => {
            const typeAheadValues: {tickerList: AuxTypeAheadSuggestion[], fullNameList: AuxTypeAheadSuggestion[]} = {
                tickerList: [
                    {
                        value: new PortfolioSearchItem('PEP', 'BGF Pacific Equity Fund', 'USD', '9214'),
                        displayValue: 'PEP'
                    },
                    {
                        value: new PortfolioSearchItem('PEP--HP', 'Perf Benchmark for PEP-AU', 'USD', '-74272'),
                        displayValue: 'PEP--HP'
                    },
                    {
                        value: new PortfolioSearchItem('PEP-1885', '1885 PRIVATE OPPORTUNITIES FUND, L.P.', 'USD', '-551466'),
                        displayValue: 'PEP-1885'
                    }
                ],
                fullNameList: [
                    {displayValue: 'BGF Pacific Equity Fund', value: undefined},
                    {displayValue: 'Perf Benchmark for PEP-AU', value: undefined},
                    {displayValue: '1885 PRIVATE OPPORTUNITIES FUND, L.P.', value: undefined}
                ]
            };

            const expectedTypeAheadItemList = [
                {label: 'Ticker', values: typeAheadValues.tickerList, isKey: true},
                {label: 'Full Name', values: typeAheadValues.fullNameList}
            ];

            portfolioSearchServiceStub.searchPortfolio$().subscribe((data) => {
                expect(component.createTypeAheadItemsList(data)).toEqual(expectedTypeAheadItemList);
                done();
            });
        });
    });

    describe('Test keyDownEventListener', () => {
        it('Test keydown listener with ENTER key', () => {
            jest.spyOn(component.emitPortfolioSearchItem, 'emit');
            const event = new KeyboardEvent('keydown', {code: 'Enter'});
            component.keyDownEventListener(event);
            expect(component.emitPortfolioSearchItem.emit).not.toHaveBeenCalled();
        });

        it('Test keydown listener with Tab key but not batchRow', () => {
            jest.spyOn(component.emitPortfolioSearchItem, 'emit');
            const event = new KeyboardEvent('keydown', {code: 'Tab'});
            component.keyDownEventListener(event);
            expect(component.emitPortfolioSearchItem.emit).not.toHaveBeenCalled();
        });

        it('Test keydown listener with Tab key with batchRow', () => {
            jest.spyOn(component.emitPortfolioSearchItem, 'emit');
            component.isBatchRowSearch = true;
            component.searchString = 'pep';
            const event = new KeyboardEvent('keydown', {code: 'Tab'});
            component.keyDownEventListener(event);
            expect(component.emitPortfolioSearchItem.emit).toHaveBeenCalled();
        });
    });

    describe('onBlur Test', () => {
        beforeEach(() => {
            jest.spyOn(component['typeAheadItemsSubject'], 'next');
            component.searchString = 'PEP';
            component.searchTerms = ['PEP'];
        });
        it('should call typeAheadItemsSubject on the search string on blur if the request is NOT made already', () => {
            jest.spyOn<any, string>(component, 'isDuplicatedRequest').mockReturnValue(false);
            component.onBlur();
            expect(component['typeAheadItemsSubject'].next).toHaveBeenCalledWith('PEP');
        });

        it('should NOT call typeAheadItemsSubject on the search string on blur if the request is made already', () => {
            jest.spyOn<any, string>(component, 'isDuplicatedRequest').mockReturnValue(true);
            component.onBlur();
            expect(component['typeAheadItemsSubject'].next).not.toHaveBeenCalledWith('PEP');
        });

        describe('isDuplicatedRequest Test', () => {
            it('should return true if the request is made already', () => {
                component['requestedParams'] = {term: 'PEP', includePorts: true, includeWhatIfPorts: false};
                component.searchString = 'pep';
                component.selectedPortfolioType = {
                    value: {
                        includePorts: true,
                        includeWhatIfPorts: false
                    }
                } as any;

                expect(component['isDuplicatedRequest']()).toBe(true);
            });
        });
    });

    describe('onSearchValueChanged Test', () => {
        beforeEach(() => {
            jest.spyOn(component['typeAheadItemsSubject'], 'next');
        });

        it('should set TypeAhead props with isLoading false', () => {
            const mockEvent = null;
            component.onSearchValueChanged(mockEvent);
            expect(component['typeaheadProps'].isLoading).toBeFalsy();
        });
        it('should set TypeAhead props with isLoading false', () => {
            const mockEvent = {
                detail: {submitValue: {
                    searchValue: '',
                    parameter: {value: 'All', displayValue: 'All', isSelected: true},
                    type: 'valueChanged'
                }
            }
            } as any;
            component.onSearchValueChanged(mockEvent);
            expect(component['typeaheadProps'].isLoading).toBeFalsy();
        });
        it('should set TypeAhead props with isLoading false', () => {
            const mockEvent = {
                detail: {submitValue: {
                    searchValue: ' ',
                    parameter: {
                        displayValue: 'Portfolios',
                        value: {'includePorts': true, 'includeWhatIfPorts': false},
                        isSelected: true
                    },
                    type: 'valueChanged'
                }
            }
            } as any;
            component.onSearchValueChanged(mockEvent);
            expect(component['typeaheadProps'].isLoading).toBeFalsy();
        });
        it('should disable add btn and reset TypeAhead when there are no search terms', () => {
            component.searchTerms = [];
            const mockEvent = {
                detail: {submitValue: {
                    searchValue: null,
                    parameter: {
                        displayValue: 'Portfolios',
                        value: {'includePorts': true, 'includeWhatIfPorts': false},
                        isSelected: true
                    },
                    type: 'valueChanged'
                }
            }
            } as any;
            component.onSearchValueChanged(mockEvent);
            expect(component.isAddBtnDisabled === true);
            expect(component['typeaheadProps'].isLoading).toBeFalsy();
            expect(!!component['typeaheadProps'].data.length).toBeFalsy();


        });

        describe('single portfolio search', () => {

            const mockEvent = {
                detail: {
                    submitValue: {
                        searchValue: 'PEP',
                        parameter: {
                            displayValue: 'Portfolios',
                            value: {'includePorts': true, 'includeWhatIfPorts': false},
                            isSelected: true
                        },
                        type: 'valueChanged'
                    }
                }
            };

            beforeEach(() => {
                // @ts-ignore - to mock event since detail in CustomEvent is read-only property
                component.onSearchValueChanged(mockEvent);
            });

            it('should update selectedPortfolioType', () => {
                expect(component['selectedPortfolioType']).toEqual(mockEvent.detail.submitValue.parameter);
            });
            it('should set TypeAhead props with isLoading true', () => {
                expect(component['typeaheadProps'].isLoading).toBeTruthy();
            });

            it('should update searchTerm', () => {
                expect(component.searchString).toBe('PEP');
                expect(component.searchTerms.length).toBe(1);
                expect(component.searchTerms[0]).toBe('PEP');
            });

            it('should fire the subject.next with "PEP"', () => {
                expect(component['typeAheadItemsSubject'].next).toHaveBeenCalledWith('PEP');
            });
        });

        describe('custom portfolio search with comma', () => {

            const mockEvent = {
                detail: {
                    submitValue: {
                        searchValue: 'PEP, IP, CORE-HQ',
                        parameter: {value: 'All', displayValue: 'All', isSelected: true},
                        type: 'valueChanged'
                    }
                }
            } as CustomEvent;

            beforeEach(() => {
                component.onSearchValueChanged(mockEvent);
            });

            it('should fire the subject.next with "CORE-HQ"', () => {
                expect(component['typeAheadItemsSubject'].next).toHaveBeenCalledWith('CORE-HQ');
            });
        });

        describe('custom portfolio search with comma selected from typeahead', () => {

            const mockEvent = {
                detail: {
                    submitValue: {
                        searchValue: 'PEP, IP, CORE-HQ',
                        parameter: {value: 'All', displayValue: 'All', isSelected: true},
                        type: 'valueChanged'
                    }
                }
            } as CustomEvent;

            beforeEach(() => {
                component.searchString = 'PEP, IP, CORE-HQ';
                component.searchTerms = ['PEP', 'IP', 'CORE-HQ'];
                component['isTypeaheadOptionSelected'] = true;
                component.onSearchValueChanged(mockEvent);
            });

            it('should reset the flag and not change the searchTerm', () => {
                expect(component.searchString).toBe('PEP, IP, CORE-HQ');
                expect(component.searchTerms).toEqual(['PEP', 'IP', 'CORE-HQ']);
                expect(component['isTypeaheadOptionSelected']).toBeFalsy();
            });
        });
        describe('portfolio type change', () => {
            it('should clear typeahead and search str when portfolio type changed', () => {
                const mockEvent = {
                    detail: {
                        submitValue: {
                            parameter: {
                                displayValue: 'What-if Portfolios',
                                value: {'includePorts': false, 'includeWhatIfPorts': true},
                                isSelected: true
                            },
                        },
                        type: 'selectionChanged'
                    }
                } as CustomEvent;
                component.isWhatIfLoaded = true;   // search string will not be reset if it's a regular port that is loaded currently
                component.onSearchValueChanged(mockEvent);
                expect(component.searchTerms.length).toBe(0);
                expect(component.searchString).toBe('');
                expect(component.isAddBtnDisabled === true);
                expect(!!component.typeaheadProps['data'].length).toBeFalsy();
                expect(component.typeaheadProps['isLoading'] === false);
            });
        });
    });

    describe('onSearchSelectionChanged Test', () => {
        describe('single portfolio search', () => {
            const mockEvent = {
                preventDefault: jest.fn(),
                detail: {
                    value: {
                        searchValue: 'PEP--HP',
                        parameter: {
                            displayValue: 'Portfolios',
                            value: {'includePorts': true, 'includeWhatIfPorts': false},
                            isSelected: true
                        },
                        rowIndex: 1,
                        optionGroup: {
                            values: [{
                                displayValue: 'PEP--HP',
                                value: {
                                    ticker: 'PEP--HP',
                                    fullName: 'Perf Benchmark for PEP-AU',
                                    currency: 'USD',
                                    code: '-74272'
                                },
                                awId: '31f52de4-0d37-4e72-bd28-69a24c3d597b',
                                awMatch: {startIndex: 0, endIndex: 3},
                                isHover: false,
                                hasHoverStyle: false
                            }, {
                                displayValue: 'Perf Benchmark for PEP-AU',
                                awId: 'a8905428-0e16-4fe3-91a5-7143ca8c2c65',
                                awMatch: {startIndex: 19, endIndex: 22}
                            }]
                        }
                    }
                },
            };

            beforeEach(() => {
                component.searchString = 'PEP';
                component.searchTerms = ['PEP'];
                component.isAddBtnHidden = false;
                jest.spyOn(component.emitPortfolioSearchItem, 'emit');
            });

            it('should set selectedTerm as event.detail.searchValue', function () {
                // @ts-ignore - to mock event since detail in CustomEvent is read-only property
                component.onSearchSelectionChanged(mockEvent);
                expect(component.searchString).toBe('PEP--HP');
                expect(component.searchTerms[0]).toBe('PEP--HP');
            });

            it('should set selectedTerm as event.detail.searchValue is empty', function () {
                component.searchString = '';
                component.searchTerms = [''];

                // @ts-ignore - to mock event since detail in CustomEvent is read-only property
                component.onSearchSelectionChanged(mockEvent);
                expect(component.searchString).toBe('PEP--HP');
                expect(component.searchTerms[0]).toBe('PEP--HP');
            });

            it('should update portfolioSearchItem', () => {
                // @ts-ignore - to mock event since detail in CustomEvent is read-only property
                component.onSearchSelectionChanged(mockEvent);
                expect(component['portfolioSearchItem']).toEqual(mockEvent.detail.value.optionGroup.values[0].value);
            });

            it('should clear out typeaheadProps.data after select', function () {
                // @ts-ignore - to mock event since detail in CustomEvent is read-only property
                component.onSearchSelectionChanged(mockEvent);
                expect(component.typeaheadProps.data).toBeUndefined();
            });

            it('for other benchmark should emit emitPortfolioSearchItem method test case for auto reloading', () => {
                jest.spyOn(component.emitPortfolioSearchItem, 'emit');
                // If request not coming from benchmark then keep the behavior intact
                component.isBenchmarkSearch = false;
                const event = {preventDefault: jest.fn(),
                    detail: {
                        value: {
                            searchValue: 'PEP',
                            optionGroup: {values: [{value: new PortfolioSearchItem('PEP')}]}
                        }
                    }
                };
                component.onSearchSelectionChanged(event as unknown as CustomEvent);
                expect(component.emitPortfolioSearchItem.emit).not.toHaveBeenCalled();

                // If it's set as true then emit benchmark value for auto-reloading
                component.isBenchmarkSearch = true;
                component.onSearchSelectionChanged(event as unknown as CustomEvent);
                expect(component.emitPortfolioSearchItem.emit).toHaveBeenCalled();
            });
        });

        describe('custom portfolio search with comma', () => {
            const mockEvent = {
                preventDefault: jest.fn(),
                detail: {
                    value: {
                        searchValue: 'IP-529',
                        parameter: {
                            displayValue: 'Portfolios',
                            value: {'includePorts': true, 'includeWhatIfPorts': false},
                            isSelected: true
                        },
                        rowIndex: 1,
                        optionGroup: {
                            values: [{
                                displayValue: 'IP-529',
                                value: {
                                    ticker: 'IP-529',
                                    fullName: 'BlackRock Inflation Protected Option (529 Ohio)',
                                    currency: 'USD',
                                    code: '35517'
                                },
                                awId: '9378e657-108a-48bb-9057-4670d4b2b4d9',
                                isHover: false,
                                hasHoverStyle: false
                            }, {
                                displayValue: 'BlackRock Inflation Protected Option (529 Ohio)',
                                awId: '723c091b-b4ea-4914-a473-5d8458969e2d'
                            }]
                        }
                    },
                }
            };

            beforeEach(() => {
                component.isAddBtnHidden = false;
                component.searchString = 'PEP, IP';
                component.searchTerms = ['PEP', 'IP'];
                // @ts-ignore - to mock event since detail in CustomEvent is read-only property
                component.onSearchSelectionChanged(mockEvent);
            });

            it('should update the searchTerm, selectedTerm, and set flag isTypeaheadOptionSelected', () => {
                expect(component['isTypeaheadOptionSelected']).toBeTruthy();
                expect(component.searchString).toBe('PEP, IP-529');
                expect(component.searchTerms.length).toBe(2);
                expect(component.searchTerms[0]).toBe('PEP');
                expect(component.searchTerms[1]).toBe('IP-529');
            });
        });
    });

    describe('onPortfolioTypeChange Test', () => {
        it('should update selectedPortfolioType', () => {
            const mockEvent = {
                type: 'selectionChanged',
                detail: {
                    value: {
                        displayValue: 'What-if Portfolios',
                        value: {includePorts: false, includeWhatIfPorts: true},
                        isSelected: true
                    }
                }
            };

            // @ts-ignore - to mock event since detail in CustomEvent is read-only property
            component.onPortfolioTypeChange(mockEvent);
            expect(component.selectedPortfolioType.displayValue).toBe('What-if Portfolios');
            expect(component.selectedPortfolioType.value).toEqual({includePorts: false, includeWhatIfPorts: true});
        });
    });

    describe('on click outside Test', () => {
        it('should emit typed in portfolio', () => {
            jest.spyOn(component['eRef'].nativeElement, 'contains').mockReturnValue(false);
            jest.spyOn(component.emitPortfolioSearchItem, 'emit');
            component.initialSearchString = 'PEP';
            component.isBenchmarkSearch = true;
            component.searchString = 'CORE-HQ';
            component.clickout(new MouseEvent('click'));
            expect(component.emitPortfolioSearchItem.emit).toHaveBeenCalled();
            expect(component.initialSearchString).toBe(component.searchString);
        });
    });


    describe('onAddPortfolio Test', () => {
        beforeEach(() => {
            jest.spyOn(component.emitPortfolioSearchItem, 'emit');
        });

        describe('custom portfolio search with comma', () => {
            it('should emit PortfolioSearchItem with searchTerm.toUpperCase as ticker', () => {
                component.searchString = 'PEP, IP, CORE-HQ';
                component.searchTerms = ['PEP', 'IP', 'CORE-HQ'];
                const expectedPortfolioSearchItem = new PortfolioSearchItem('PEP, IP, CORE-HQ');

                component.onAddPortfolio();
                expect(component.emitPortfolioSearchItem.emit).toHaveBeenCalledWith(expectedPortfolioSearchItem);
            });

            it('Search String empty or not test case', () => {
                component.isBenchmarkSearch = false;
                component.searchTerms = ['BELSH'];
                component.searchString = 'BELSH';
                component.onAddPortfolio();
                // Since it is false will set searchString to be empty
                expect(component.searchString).toBe('');

                // If parent is Benchmark then don't set searchString empty
                component.isBenchmarkSearch = true;
                component.searchString = 'BELSH';
                component.onAddPortfolio();
                // Since it is true will keep searchString whatever it is
                expect(component.searchString).toBe('BELSH');
            });
        });

        describe('single portfolio search', () => {
            beforeEach(() => {
                component.searchString = 'PEP';
                component.searchTerms = ['PEP'];
            });

            it('should clear input field', () => {
                component.onAddPortfolio();
                expect(component.searchString).toEqual('');
                expect(component['portfolioSearchItem']).toBeNull();
            });

            it('clearOnAdd false', () => {
                component.clearOnAdd = false;
                component.onAddPortfolio();
                expect(component.searchString).toEqual('PEP');
            });

            it('should emit component.portfolioSearchItem if exists', () => {
                const expectedPortfolioSearchItem = new PortfolioSearchItem('PEP', 'BGF Pacific Equity Fund', 'USD', '9214');
                component['portfolioSearchItem'] = expectedPortfolioSearchItem;

                component.onAddPortfolio();
                expect(component.emitPortfolioSearchItem.emit).toHaveBeenCalledWith(expectedPortfolioSearchItem);
            });

            it('should emit PortfolioSearchItem with searchTerm.toUpperCase as ticker', () => {
                const expectedPortfolioSearchItem = new PortfolioSearchItem('PEP');

                component.onAddPortfolio();
                expect(component.emitPortfolioSearchItem.emit).toHaveBeenCalledWith(expectedPortfolioSearchItem);
            });

            it('Multiple times clicking enter should not emit any value and searchString contains previous value test case', () => {
                component.searchString = 'Belsh';
                // Hitting multiple times enter makes searchString as empty as searchTerm will be an empty array
                // Not emitting anything when we encounter to this would make our searchString contain previous value
                component.searchTerms = [];
                component.onAddPortfolio();
                expect(component.emitPortfolioSearchItem.emit).not.toHaveBeenCalled();
                expect(component.searchString).toBe('Belsh');
            });
        });

        describe('triggered by enter key', () => {
            it('should not do anything if selected portfolio type is not portfolios and there is no typeahead selected', () => {
                component.selectedPortfolioType.displayValue = 'What-if Portfolios';
                (component as any).isTypeaheadOptionSelected = false;
                component.onAddPortfolio();
                expect(component.emitPortfolioSearchItem.emit).not.toHaveBeenCalled();
            });

            it('should continue searching if selected portfolio type is not portfolios and typeahead is selected', () => {
                component.selectedPortfolioType.displayValue = 'What-if Portfolios';
                component.searchString = 'PEP';
                component.searchTerms = ['PEP'];
                (component as any).isTypeaheadOptionSelected = true;
                component.onAddPortfolio();
                expect(component.emitPortfolioSearchItem.emit).toHaveBeenCalled();
            });
        });
    });
});
