import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import {SecuritySearchBarComponent} from './security-search-bar.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {SecuritySearchService} from '@services/security-search/security-search.service';
import {Observable, of, Subscription} from 'rxjs';
import {SecuritySearchItem} from '@interfaces/security-search-item.interface';
import {TestUtils} from '@utils/test.utils';

describe('SecuritySearchBarComponent', () => {
    let component: SecuritySearchBarComponent;
    let fixture: ComponentFixture<SecuritySearchBarComponent>;

    const securitySearchServiceStub = {
        searchSecurity$: jest.fn((): Observable<SecuritySearchItem[]> => {
            return of([
                {
                    cusip: '037833100',
                    description: 'APPLE INC',
                    securityGroup: 'EQUITY',
                    securityType: 'EQUITY',
                    ticker: 'AAPL',
                },
                {
                    cusip: '037833AA8',
                    description: 'APPLE COMPUTER INC 6.5 15-FEB-2004',
                    securityGroup: 'BND',
                    securityType: 'CORP',
                    ticker: 'AAPL',
                },
            ]);
        })
    };

    beforeAll((done) => {
        TestUtils.initialize(done);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [SecuritySearchBarComponent],
            providers: [{provide: SecuritySearchService, useValue: securitySearchServiceStub}],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(SecuritySearchBarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create the search bar', () => {
        expect(component).toBeTruthy();
    });

    describe('onSearchValueChanged tests', () => {
        beforeEach(() => {
            jest.spyOn(component['typeaheadSearchTermSubject'], 'next');
        });

        it('should set TypeAhead props with isLoading false on null event', () => {
            component['typeaheadProps'].data = [{values: []}];
            component['typeaheadProps'].isLoading = true;

            const mockEvent = null;
            component.onSearchValueChanged(mockEvent);
            expect(component['typeaheadProps'].isLoading).toBeTruthy();
            expect(component['typeaheadProps'].data.length).toBe(1);
            expect(component['typeaheadSearchTermSubject'].next).not.toHaveBeenCalled();
        });

        it('should set TypeAhead props with isLoading false when input is empty', () => {
            component['typeaheadProps'].data = [{values: []}];
            component['typeaheadProps'].isLoading = true;

            const mockEvent = {
                detail: {submitValue:{
                    searchValue: '',
                    type: 'valueChanged'
                }
            }
            } as CustomEvent;

            component.onSearchValueChanged(mockEvent);

            expect(component['typeaheadProps'].isLoading).toBeFalsy();
            expect(component['typeaheadProps'].data.length).toBe(0);
            expect(component['typeaheadSearchTermSubject'].next).not.toHaveBeenCalled();
        });

        it('should populate the typeahead when a term is entered', fakeAsync(() => {
            component['typeaheadProps'].data = [];
            component['typeaheadProps'].isLoading = false;

            const mockEvent = {
                detail: {submitValue:{
                    searchValue: 'aapl ',
                    type: 'valueChanged'
                }
            }
            } as CustomEvent;

            component.onSearchValueChanged(mockEvent);
            tick(500); // needed for debounceTime in typeaheadSearchTermSubject pipe

            expect(component['typeaheadProps'].isLoading).toBeFalsy();
            expect(component['typeaheadProps'].data.length).toBe(5);  // 5 columns in typeahead
            expect(component['typeaheadProps'].data[0].values.length).toBe(2);
            expect(component['typeaheadSearchTermSubject'].next).toHaveBeenCalledWith('aapl');
        }));
    });

    describe('validateThenAddSecurity Tests', () => {
        let subscription: Subscription;

        beforeEach(() => {
            jest.spyOn(component.securitySelected, 'emit');
        });

        it('should emit a security if it is found', () => {
            const mockEvent = {
                detail: {submitValue:{
                    searchValue: '037833100'
                }
            }
            } as CustomEvent;

            subscription = component.securitySelected.subscribe((security: SecuritySearchItem) => {
                expect(security.cusip).toBe('037833100');
                expect(security.error).toBeUndefined();
            });

            component.validateThenAddSecurity(mockEvent);

            expect(component.securitySelected.emit).toHaveBeenCalledTimes(1);
        });

        it('should not emit a dummy security with an error if not found', () => {
            securitySearchServiceStub.searchSecurity$.mockReturnValue(of([]));

            const mockEvent = {
                detail: {submitValue:{
                    searchValue: '037833100'
                }
            }
            } as CustomEvent;

            subscription = component.securitySelected.subscribe((security: SecuritySearchItem) => {
                expect(security.cusip).toBe('037833100');
                expect(security.error).toBe('Security not found');
            });

            component.validateThenAddSecurity(mockEvent);

            expect(component.securitySelected.emit).toHaveBeenCalledTimes(0);
        });

        afterEach(() => {
            if (subscription) {
                subscription.unsubscribe();
            }
        });
    });

    describe('addSecurity Tests', () => {
        let subscription: Subscription;

        beforeEach(() => {
            jest.spyOn(component.securitySelected, 'emit');
        });

        it('should emit the selected security', () => {
            const item: SecuritySearchItem = {
                cusip: '037833100',
                description: 'APPLE INC',
                securityGroup: 'EQUITY',
                securityType: 'EQUITY',
                ticker: 'AAPL',
            };

            const mockEvent = {
                detail: {value:{
                    optionGroup:{
                    values: [{
                        value: item
                    }]
                }
            }
            }
            } as CustomEvent;

            subscription = component.securitySelected.subscribe((security: SecuritySearchItem) => {
                expect(security).toBe(item);
            });

            component.addSecurity(mockEvent);

            expect(component.securitySelected.emit).toHaveBeenCalledTimes(1);

        });

        afterEach(() => {
            if (subscription) {
                subscription.unsubscribe();
            }
        });
    });
});
