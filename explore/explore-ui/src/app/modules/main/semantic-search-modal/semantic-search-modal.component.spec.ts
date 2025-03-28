import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import {SemanticSearchModalComponent} from './semantic-search-modal.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ExploreColumnSearchService} from '@services/explore-column-search/explore-column-search.service';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {GridApi} from 'ag-grid-community';
import {ExploreSelectOption, TelemetryActionConstants, TelemetrySemanticSearchParameters, TelemetryService, TelemetryUtil} from '@blk/explore-ui-core';
import {ColumnSearchOptions} from '@enums/column-search-options.enum';

describe('SemanticSearchModalComponent', () => {
    let component: SemanticSearchModalComponent;
    let fixture: ComponentFixture<SemanticSearchModalComponent>;

    const exploreColumnSearchServiceStub = {
        searchColumns$: jest.fn((): Observable<any> => {
            return of([{title: 'Market Value', columnTag: 'market_val', score: '0.9'}]);
        })
    };

    beforeEach(async () => {
        TestBed.configureTestingModule({
            declarations: [SemanticSearchModalComponent],
            providers: [
                {provide: ExploreColumnSearchService, useValue: exploreColumnSearchServiceStub}
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(SemanticSearchModalComponent);
        component = fixture.componentInstance;
        component.searchTermSubject$ = new BehaviorSubject<string>(null);
        component['gridApi'] = {} as GridApi;
        component['gridApi'].sizeColumnsToFit = jest.fn();
        component['gridApi'].updateGridOptions = jest.fn();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        expect(component.searchTypeOptions.length).toEqual(1);
        expect(component.widgetTypeOptions.length).toEqual(1);
        expect(component.isLikeDislikeEnabled).toBeFalsy();
    });

    it('Test searchTermSubject$', fakeAsync(() => {
        const performSearchSpy = jest.spyOn(component, 'performSearch');
        component.ngOnInit();
        component.searchTermSubject$.next('Test Search');
        tick(300);
        expect(performSearchSpy).toBeCalledTimes(1);
        expect(performSearchSpy).toHaveBeenCalledWith('Test Search');
        component.searchTermSubject$.next('MA');
        tick(300);
        expect(performSearchSpy).toBeCalledTimes(1);
        component.searchTermSubject$.next('MAR');
        tick(300);
        expect(performSearchSpy).toBeCalledTimes(2);
        expect(performSearchSpy).toHaveBeenCalledWith('MAR');
        component.searchTermSubject$.next('%M');
        tick(300);
        expect(performSearchSpy).toBeCalledTimes(3);
        expect(performSearchSpy).toHaveBeenCalledWith('%M');
        component.searchTermSubject$.next('%MR');
        tick(300);
        expect(performSearchSpy).toBeCalledTimes(4);
        expect(performSearchSpy).toHaveBeenCalledWith('%MR');
        component.searchTermSubject$.next('%');
        tick(300);
        expect(performSearchSpy).toBeCalledTimes(5);
        expect(performSearchSpy).toHaveBeenCalledWith('%');
    }));

    it('should emit modalClosed event', () => {
        jest.spyOn(component.modalClosed, 'emit');
        component.closeModal();
        expect(component.modalClosed.emit).toHaveBeenCalledWith(undefined);
        component.closeModal(true);
        expect(component.modalClosed.emit).toHaveBeenCalledWith(true);
        component.closeModal(false);
        expect(component.modalClosed.emit).toHaveBeenCalledWith(false);
    });

    it('should emit searchTermSubject$ with correct value when onSearchValueChanged is called', () => {
        jest.spyOn(component.searchTermSubject$, 'next');
        component.onSearchValueChanged(new CustomEvent('AuxSearchFieldSearchValueChanged', {}));
        expect(component.searchTermSubject$.next).not.toHaveBeenCalled();
        const event = new CustomEvent('AuxSearchFieldSearchValueChanged', {
            detail: {
                submitValue: {
                    searchValue: 'Test Search'
                }
            }
        });
        component.onSearchValueChanged(event);
        expect(component.searchTermSubject$.next).toHaveBeenCalledWith('Test Search');
    });

    it('should update searchBy when onSearchTypeSelectionChanged is called', () => {
        const event = new CustomEvent('AuxSelectSelectionChanged', {
            detail: {
                value: new ExploreSelectOption('Phrasal Search', ColumnSearchOptions.PHRASAL_SEARCH)
            }
        });
        component.onSearchTypeSelectionChanged(event);
        expect(component.searchBy).toEqual(ColumnSearchOptions.PHRASAL_SEARCH);
    });

    it('should update searchBy when onWidgetTypeSelectionChanged is called', () => {
        const event = new CustomEvent('AuxSelectSelectionChanged', {
            detail: {
                value: new ExploreSelectOption('Return Analysis', 'RA')
            }
        });
        component.onWidgetTypeSelectionChanged(event);
        expect(component.widgetType).toEqual('RA');
    });

    it('should disable like/dislike and track telemetry when onLikeDislikeBtnClicked is called', () => {
        const telemetryTrackSpy = jest.spyOn(TelemetryService, 'track');
        const likeResults = true;
        const expectedTelemetryParameters = new TelemetrySemanticSearchParameters(
            component.widgetType,
            component.searchBy,
            component.rows,
            component.searchString,
            TelemetryUtil.getDuration(component.timeTakenForSearch),
            component.noOfColumns,
            likeResults
        );
        component.isLikeDislikeEnabled = true;
        component.onLikeDislikeBtnClicked(likeResults);

        expect(component.isLikeDislikeEnabled).toBe(false);
        expect(telemetryTrackSpy).toHaveBeenCalledWith(TelemetryActionConstants.USER_BEHAVIOUR.SEMANTIC_SEARCH_QUERY, expectedTelemetryParameters);
    });
});
