import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ViewUsageModalComponent} from './view-usage-modal.component';
import {FavoriteService} from '@services/favorite';
import {AuxSelectOption} from '@blk/aladdin-angular-components';
import {CalendarDateUtils, CoreFavoriteVersioningStore, DateValue, FavoriteType} from '@blk/explore-ui-core';
import {of, throwError} from 'rxjs';
import {GridApi} from 'ag-grid-community';
import {AgGridModule} from 'ag-grid-angular';

describe('ViewUsageModalComponent', () => {
    let component: ViewUsageModalComponent;
    let fixture: ComponentFixture<ViewUsageModalComponent>;

    const favoriteServiceStub = {
        getFavoriteUsers$: jest.fn(),
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AgGridModule],
            declarations: [ViewUsageModalComponent],
            providers: [{provide: FavoriteService, useValue: favoriteServiceStub}],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
            .compileComponents();
        CalendarDateUtils.getTodayDate = jest.fn().mockReturnValue('01/01/2024');

        fixture = TestBed.createComponent(ViewUsageModalComponent);
        component = fixture.componentInstance;
        component.modalHeader = 'Workspace';
        component['gridApi'] = {} as GridApi;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('test no rows message', () => {
        component.noRowsReceived = false;
        expect(component.noRowsOverlayComponentParams.noRowsMessageFunc()).toEqual('The request cannot be processed. Please try again.');

        component.noRowsReceived = true;
        expect(component.noRowsOverlayComponentParams.noRowsMessageFunc()).toEqual('No data is available for the period selected.');
    });

    it('test minDate', () => {
        component.endDate = DateValue.newDate(CalendarDateUtils.getTodayDate());
        component.onDateRangeChange();
        expect(component.minDate.toDate().toDateString()).toEqual('Sat Jan 01 2022');
    });

    it('test onUsersSelectionChanged', () => {
        const event = {detail: {value: {value: 10} as AuxSelectOption}} as CustomEvent;
        component.onUsersSelectionChanged(event);
        expect(component.selectedUserCount).toBe(10);
    });

    it('test close modal', () => {
        jest.spyOn(CoreFavoriteVersioningStore.viewUsageTypeAction$, 'next' as any);
        component.closeModal();
        expect(CoreFavoriteVersioningStore.viewUsageTypeAction$['next']).toHaveBeenCalled();
    });

    describe('loadFavoriteUsers Test', () => {
        it('test loadFavoriteUsers for data', () => {
            component.modalHeader = FavoriteType.WORKSPACE;
            component.startDate = new DateValue({
                date: '07/07/2024',
                dateString: false
            });
            component.endDate = new DateValue({
                date: '08/08/2024',
                dateString: false
            });
            const favoriteUsers = [
                {
                    userId: '1557322',
                    usageCount: 100,
                    userFullName: 'Test User'
                }
            ];
            component.topUsersFavoriteDetails = [];
            favoriteServiceStub.getFavoriteUsers$.mockReturnValue(of(favoriteUsers));
            component.loadFavoriteUsers();
            expect(component.topUsersFavoriteDetails[0].userId).toBe('1557322');
        });

        it('test loadFavoriteUsers with no data', () => {
            component.modalHeader = FavoriteType.WORKSPACE;
            component.startDate = new DateValue({
                date: '07/07/2024',
                dateString: false
            });
            component.endDate = new DateValue({
                date: '08/08/2024',
                dateString: false
            });
            const favoriteUsers = [];
            component.topUsersFavoriteDetails = [];
            favoriteServiceStub.getFavoriteUsers$.mockReturnValue(of(favoriteUsers));
            component.loadFavoriteUsers();
            expect(component.topUsersFavoriteDetails).toBeDefined();
        });

        it('test loadFavoriteUsers with error returned', () => {
            component.modalHeader = FavoriteType.WORKSPACE;
            component.startDate = new DateValue({
                date: '07/07/2024',
                dateString: false
            });
            component.endDate = new DateValue({
                date: '08/08/2024',
                dateString: false
            });

            const gridDataLoadedSpy = jest.spyOn(component, 'gridDataLoaded');

            favoriteServiceStub.getFavoriteUsers$.mockReturnValue(throwError(() => new Error('ERROR')));

            component.loadFavoriteUsers();

            expect(gridDataLoadedSpy).toHaveBeenCalled();
        });
    });

    it('test onExportClick', () => {
        expect(component.onExportClick()).toBeFalsy();
    });

    describe('onMenuItemClicked Test', () => {
        it('should test with PDF Export', () => {
            component.gridApi.getAllGridColumns = jest.fn().mockReturnValue(component['columnDefs']);
            component.gridApi.forEachNodeAfterFilterAndSort = jest.fn().mockReturnValue([]);
            const event = {detail: {element: {eventData: 'Export to PDF'}}} as CustomEvent;
            component.onMenuItemClicked(event);
            expect(component.gridApi.getAllGridColumns).toHaveBeenCalled();
        });

        it('should test with Excel Export', () => {
            component.gridApi.exportDataAsExcel = jest.fn();
            const event = {detail: {element: {eventData: 'Export to Excel'}}} as CustomEvent;
            component.onMenuItemClicked(event);
            expect(component.gridApi.exportDataAsExcel).toHaveBeenCalled();
        });
    });

});
