import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FavoriteChangesComponent} from './favorite-changes.component';
import {CUSTOM_ELEMENTS_SCHEMA, SimpleChange} from '@angular/core';
import {Breakdown} from '@blk/explore-ui-breakdown';
import {ColumnSet} from '@blk/explore-ui-column-option';
import {ColumnConfig, CoreUserMetaDataStore, FavoriteDisplayEnum, UserMetaData} from '@blk/explore-ui-core';
import {FavoriteChange} from '@models/favorite/favorite-change.model';
import {By} from '@angular/platform-browser';

describe('FavoriteChangesComponent', () => {
    let component: FavoriteChangesComponent;
    let fixture: ComponentFixture<FavoriteChangesComponent>;

    beforeAll(() => {
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        CoreUserMetaDataStore.userMetaData.login = 'user01';
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [FavoriteChangesComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(FavoriteChangesComponent);
        component = fixture.componentInstance;

        component.favoriteChanges = [];

        fixture.detectChanges();
    });

    it('should display message if there are no favorite changes', () => {
        component.favoriteChanges = [];
        component.ngOnChanges({ favoriteChanges: new SimpleChange(undefined, component.favoriteChanges, false)});
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('.no-changes-text'))).toBeTruthy();
    });

    it('should display favorite change items', () => {
        const breakdownFavorite = new Breakdown();
        breakdownFavorite.id = 1234;
        breakdownFavorite.owner = 'user01';
        breakdownFavorite.title = 'favorite breakdown';

        const breakdownFavoriteChange = new FavoriteChange(breakdownFavorite, FavoriteDisplayEnum.BREAKDOWN);

        const columnSetFavorite = new ColumnSet();
        columnSetFavorite.id = 5678;
        columnSetFavorite.owner = 'user01';
        columnSetFavorite.title = 'column set favorite';

        const colSetFavoriteChange = new FavoriteChange(columnSetFavorite, FavoriteDisplayEnum.COLUMN_SET);

        component.favoriteChanges = [colSetFavoriteChange, breakdownFavoriteChange];
        component.ngOnChanges({ favoriteChanges: new SimpleChange(undefined, component.favoriteChanges, false)});
        fixture.detectChanges();

        expect(fixture.debugElement.nativeElement.querySelectorAll('app-favorite-change-item')).toHaveLength(2);
    });

    it('should display message if any favorite owned by a different user', () => {
        const columnSetFavorite = new ColumnSet();
        columnSetFavorite.id = 5678;
        columnSetFavorite.owner = 'user01';
        columnSetFavorite.title = 'column set favorite';

        const customCalc = new ColumnConfig();
        customCalc.id = 9102;
        customCalc.owner = 'user02';
        customCalc.title = 'custom calc favorite';

        const customCalcFavoriteChange = new FavoriteChange(customCalc, FavoriteDisplayEnum.CUSTOM_CALC);

        const colSetFavoriteChange = new FavoriteChange(columnSetFavorite, FavoriteDisplayEnum.COLUMN_SET);
        colSetFavoriteChange.nestedChanges.push(customCalcFavoriteChange);

        component.favoriteChanges = [customCalcFavoriteChange];
        component.ngOnChanges({ favoriteChanges: new SimpleChange(undefined, component.favoriteChanges, false)});
        fixture.detectChanges();

        expect(fixture.debugElement.query(By.css('.other-owners-container'))).toBeTruthy();
    });
});
