import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {of, Subject} from 'rxjs';

import {FavoriteUserSearchComponent} from './favorite-user-search.component';
import {FavoriteUser} from '@interfaces/favorite-user.interface';
import {FavoriteService} from '@services/index';

describe('FavoriteUserSearchComponent', () => {
    let component: FavoriteUserSearchComponent;
    let fixture: ComponentFixture<FavoriteUserSearchComponent>;

    const getUsersForFavoriteTypeReponse: FavoriteUser[] = [
        {login: '_SHARED', fullName: ' Shared Account', type: 'Personal'},
        {login: 'seakim', fullName: 'Sean Kim', type: 'Personal'},
        {login: 'aaanand', fullName: 'Aakansha Aanand', type: 'Personal'},
        {login: 'rolin', fullName: 'Robert Lin', type: 'Personal'},
    ];

    const favoriteServiceStub = {
        getUsersForFavoriteType$: jest.fn( () => of(getUsersForFavoriteTypeReponse))
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [FavoriteUserSearchComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [{provide: FavoriteService, useValue: favoriteServiceStub}]
        });

        fixture = TestBed.createComponent(FavoriteUserSearchComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        expect(fixture.debugElement.nativeElement.querySelector('.favorite-user-search-area')).toMatchSnapshot();
    });

    describe('onInit Test', () => {
        it('should call loadFavoriteUsers on initialize', () => {
            jest.spyOn<any>(component, 'loadFavoriteUsers');
            component.ngOnInit();

            expect(component['loadFavoriteUsers']).toHaveBeenCalled();
        });
    });

    describe('loadFavoriteUsers Test', () => {
        it('should update isLoading, allFavoriteUsers, and auxAllFavoriteUsersData', () => {
            component.allFavoriteUsers = [];
            component['loadFavoriteUsers']('WORKSPACE');

            expect(component.isLoading).toBeFalsy();
            expect(component.allFavoriteUsers.length).toBe(4);
            expect(component.allFavoriteUsers[1].displayValue).toBe('Sean Kim');
            expect(component.auxAllFavoriteUsersData).toStrictEqual([{label: 'Users', values: component.allFavoriteUsers}]);
        });
    });

    describe('createAuxFavUserData Test', () => {
        it('should create auxFavUserData from getUsersForFavoriteType$ response', () => {
            const expectedResult = [
                {displayValue: ' Shared Account', value: '_SHARED'},
                {displayValue: 'Sean Kim', value: 'seakim'},
                {displayValue: 'Aakansha Aanand', value: 'aaanand'},
                {displayValue: 'Robert Lin', value: 'rolin'},
            ];
            expect(component['createAuxFavUserData'](getUsersForFavoriteTypeReponse)).toStrictEqual(expectedResult);
        });
    });

    describe('onDynamicTypeaheadValueChanged Test', () => {
        beforeEach( () => {
            component.allFavoriteUsers = [
                {displayValue: ' Shared Account', value: '_SHARED'},
                {displayValue: 'Sean Kim', value: 'seakim'},
                {displayValue: 'Aakansha Aanand', value: 'aaanand'},
                {displayValue: 'Robert Lin', value: 'rolin'},
            ];
            component.auxAllFavoriteUsersData = [{label: 'Users', values: component.allFavoriteUsers}];
        });

        it('should update favoriteUsersData to update the search result', () => {
            const expectedResult = [
                {displayValue: ' Shared Account', value: '_SHARED'},
                {displayValue: 'Sean Kim', value: 'seakim'},
                {displayValue: 'Aakansha Aanand', value: 'aaanand'},
            ];
            // @ts-ignore to mock event with searchValue 'a' since detail in CustomEvent is readonly property
            component.onDynamicTypeaheadValueChanged({detail:{value: 'a'}});

            expect(component.auxFilteredFavoriteUsersData).toStrictEqual([{label: 'Users', values: expectedResult}]);
        });

        it('should update favoriteUsersData to update the search result', () => {
            let expectedResult = [
                {displayValue: ' Shared Account', value: '_SHARED'},
                {displayValue: 'Sean Kim', value: 'seakim'},
                {displayValue: 'Aakansha Aanand', value: 'aaanand'},
            ];
            // @ts-ignore to mock event with searchValue 'a' since detail in CustomEvent is readonly property
            component.onDynamicTypeaheadValueChanged({detail:{value: 'a'}});

            expect(component.auxFilteredFavoriteUsersData).toStrictEqual([{label: 'Users', values: expectedResult}]);

            expectedResult = [{displayValue: 'Robert Lin', value: 'rolin'}];
            // @ts-ignore to mock event with searchValue 'rob li' since detail in CustomEvent is readonly property
            component.onDynamicTypeaheadValueChanged({detail:{value: 'rob li'}});
            expect(component.auxFilteredFavoriteUsersData).toStrictEqual([{label: 'Users', values: expectedResult}]);
        });

        it('should update filteredFavoriteUsers back to default and update selectedFavoriteUserSubject$ with undefined when event.detail is empty', () => {
            component.selectedFavoriteUserSubject$ = new Subject<string>();
            jest.spyOn(component.selectedFavoriteUserSubject$, 'next');
            // @ts-ignore to mock event with searchValue 'a' since detail in CustomEvent is readonly property
            component.onDynamicTypeaheadValueChanged({detail: {value:''}});

            expect(component.selectedFavoriteUserSubject$.next).toHaveBeenCalled();
        });
    });

    describe('onFavoriteUserSelected Test', () => {
        beforeEach(() => {
            component.selectedFavoriteUserSubject$ = new Subject<string>();
            jest.spyOn(component.selectedFavoriteUserSubject$, 'next');
        });

        it('should update selectedFavoriteUserSubject$ onFavoriteUserSelected', () => {
            // @ts-ignore to mock event with searchValue 'a' since detail in CustomEvent is readonly property
            component.onFavoriteUserSelected({detail: {optionGroup: {values: [{value: 'seakim'}]}}});
            expect(component.selectedFavoriteUserSubject$.next).toHaveBeenCalledWith('seakim');
        });
    });
});
