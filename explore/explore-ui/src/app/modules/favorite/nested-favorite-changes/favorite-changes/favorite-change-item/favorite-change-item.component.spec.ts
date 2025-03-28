import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FavoriteChangeItemComponent} from './favorite-change-item.component';
import {FavoriteChange} from '@models/favorite/favorite-change.model';
import {ColumnSet} from '@blk/explore-ui-column-option';
import {TestUtils} from '@utils/test.utils';
import {ColumnConfig, CoreUserMetaDataStore, FavoriteDisplayEnum} from '@blk/explore-ui-core';
import {By} from '@angular/platform-browser';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';

describe('FavoriteChangeItemComponent', () => {
    let favoriteChange: FavoriteChange;

    let colSetFavorite: ColumnSet;

    let component: FavoriteChangeItemComponent;
    let fixture: ComponentFixture<FavoriteChangeItemComponent>;

    beforeAll((done) => {
        TestUtils.initialize(done);
        CoreUserMetaDataStore.userMetaData.login = 'user01';
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [FavoriteChangeItemComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(FavoriteChangeItemComponent);
        component = fixture.componentInstance;

        colSetFavorite = new ColumnSet();
        colSetFavorite.id = 1234;
        colSetFavorite.owner = 'user01';

        favoriteChange = new FavoriteChange(colSetFavorite, FavoriteDisplayEnum.COLUMN_SET);
        component.favoriteChange = favoriteChange;

        fixture.detectChanges();
    });

    it('should add nesting to the component if it is nested', () => {
        expect(fixture.debugElement.query(By.css('.nested-row--top-padding'))).toBeFalsy();

        component.level = 2;
        fixture.detectChanges();

        expect(fixture.debugElement.query(By.css('.nested-row--top-padding'))).toBeTruthy();
    });

    it('should display nested child favorite changes', () => {
        expect(fixture.debugElement.nativeElement.querySelector('app-favorite-change-item')).toBeFalsy();

        const customCalcFavorite = new ColumnConfig();
        customCalcFavorite.id = 5678;
        customCalcFavorite.owner = 'user02';
        const customCalcFavoriteChange = new FavoriteChange(customCalcFavorite, FavoriteDisplayEnum.CUSTOM_CALC);
        favoriteChange.nestedChanges = [customCalcFavoriteChange];

        fixture.detectChanges();

        expect(fixture.debugElement.nativeElement.querySelector('app-favorite-change-item')).toBeTruthy();
    });

    it('toggles saving selection state', () => {
        expect(component.favoriteChange.isSelected).toBeTruthy();
        component.updateSelectedState();
        expect(component.favoriteChange.isSelected).toBeFalsy();
    });

    it('should display workspace owner name as Enterprise for Admin User', () => {
        component.favoriteChange.value.owner = '_ADMIN';
        component.ngOnInit();
        fixture.detectChanges();
        expect(component.ownerDisplayName).toEqual('Enterprise');
    });

    it('should display workspace owner name as Aladdin for GLOBAL User', () => {
        component.favoriteChange.value.owner = '_GLOBAL';
        component.ngOnInit();
        fixture.detectChanges();
        expect(component.ownerDisplayName).toEqual('Aladdin');
    });

    it('should display current user name as workspace owner name for  other user', () => {
        component.favoriteChange.value.owner = 'current user';
        component.ngOnInit();
        fixture.detectChanges();
        expect(component.ownerDisplayName).toEqual('current user');
    });

});
