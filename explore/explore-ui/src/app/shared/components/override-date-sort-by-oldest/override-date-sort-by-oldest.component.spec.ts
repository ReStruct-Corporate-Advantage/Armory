import {ComponentFixture, TestBed} from '@angular/core/testing';

import {OverrideDateSortByOldestComponent} from './override-date-sort-by-oldest.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';

describe('OverrideDateSortByOldestComponent', () => {
    let component: OverrideDateSortByOldestComponent;
    let fixture: ComponentFixture<OverrideDateSortByOldestComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [OverrideDateSortByOldestComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(OverrideDateSortByOldestComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('Test ngOnInit', () => {
        component.sortByOldest = true;
        component.ngOnInit();
        expect(component.overrideDateSortOptions[0].checked).toBeFalsy();
        expect(component.overrideDateSortOptions[1].checked).toBeTruthy();
    });

    it('Test onOverrideDateSortOptionChanged', () => {
        jest.spyOn(component.sortByOldestChange, 'emit');
        component.onOverrideDateSortOptionChanged({eventData: 'OLDEST'});
        expect(component.sortByOldestChange.emit).toHaveBeenCalledWith(true);
    });
});
