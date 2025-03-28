import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CustomSectorBuilderComponent} from './custom-sector-builder.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ColumnSectorRule, CustomSector, LinkedFavoriteSector, CustomSectorEventsService} from '@blk/explore-ui-breakdown';
import {AppStore} from '../../../app.store';
import {cloneDeep} from 'lodash';
import {By} from '@angular/platform-browser';
import {FavoriteService} from '@services/favorite';
import {of} from 'rxjs';

describe('CustomSectorBuilderComponent', () => {
    let component: CustomSectorBuilderComponent;
    let fixture: ComponentFixture<CustomSectorBuilderComponent>;
    const customSectorEventsServiceStub = {
        setActiveCustomSector: jest.fn()
    };
    const favoriteServiceStub = {
        getFavorite$: jest.fn()
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [CustomSectorBuilderComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                AppStore,
                {provide: CustomSectorEventsService, useValue: customSectorEventsServiceStub},
                {provide: FavoriteService, useValue: favoriteServiceStub}
            ]
        });

        fixture = TestBed.createComponent(CustomSectorBuilderComponent);
        component = fixture.componentInstance;
        component.customSector = new CustomSector();
        const columnSectorRule = new ColumnSectorRule();
        columnSectorRule.columnName = 'Test';
        component.customSector.rule = columnSectorRule;
        fixture.detectChanges();
    });

    it('Test onSectorNameChange', () => {
        component.titleChangeCallBack = jest.fn();
        component.onSectorNameChange('Sector Name');
        expect(component.customSector.title).toEqual('Sector Name');
        expect(component.titleChangeCallBack).toHaveBeenCalled();
    });

    it('Test saveCustomSector', () => {
        expect(fixture.debugElement.query(By.css('.custom-sector-details-author'))).toBeFalsy();
        component.titleChangeCallBack = jest.fn();
        component.customSector.children = [new LinkedFavoriteSector()];
        const savedCustomSector = cloneDeep(component.customSector);
        savedCustomSector.children = [];
        component.saveCustomSector();
        expect(component['appStore'].saveFavoriteAction$.getValue().configToSave).toEqual(savedCustomSector);
        component['appStore'].saveFavoriteAction$.getValue().configToSave.id = 123;
        component['appStore'].saveFavoriteAction$.getValue().configToSave.title = 'Test change';
        component['appStore'].saveFavoriteAction$.getValue().configToSave.owner = 'simsingh';
        component['appStore'].saveFavoriteAction$.getValue().callback();
        fixture.detectChanges();
        expect(component.customSector.id).toEqual(123);
        expect(component.customSector.title).toEqual('Test change');
        expect(component.customSector.owner).toEqual('simsingh');
        expect(component.titleChangeCallBack).toHaveBeenCalled();
        expect(fixture.debugElement.query(By.css('.custom-sector-details-author'))).toBeTruthy();
    });

    it('Test Clear rules', () => {
        component.customSectorItemComponent = {};
        component.clearCustomSectorRules();
        expect((component.customSector.rule as ColumnSectorRule).columnName).toBeUndefined();
        expect(customSectorEventsServiceStub.setActiveCustomSector).toHaveBeenCalledWith(component.customSectorItemComponent);
    });

    it('Test loadCustomSectorVersion', () => {
        const customSector = new CustomSector();
        const columnSectorRule = new ColumnSectorRule();
        columnSectorRule.columnName = 'Test2';
        customSector.rule = columnSectorRule;

        favoriteServiceStub.getFavorite$.mockReturnValueOnce(of(customSector));
        component.loadCustomSectorVersion(123, 'Loading', true);
        expect(component.customSector).toEqual(customSector)
    });
});
