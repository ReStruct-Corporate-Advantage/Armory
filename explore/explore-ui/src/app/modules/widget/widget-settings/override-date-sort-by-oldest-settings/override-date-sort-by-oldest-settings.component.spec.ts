import {ComponentFixture, TestBed} from '@angular/core/testing';

import {OverrideDateSortByOldestSettingsComponent} from './override-date-sort-by-oldest-settings.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {OverrideDateSortByOldest} from '@models/widget/inputs/override-date-sort-by-oldest.model';

describe('OverrideDateSortByOldestSettingsComponent', () => {
    let component: OverrideDateSortByOldestSettingsComponent;
    let fixture: ComponentFixture<OverrideDateSortByOldestSettingsComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [OverrideDateSortByOldestSettingsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(OverrideDateSortByOldestSettingsComponent);
        component = fixture.componentInstance;
        component.inputs = new Map<string, OverrideDateSortByOldest>();
        component.widgetConfigInput = {
            inputConfigType: 'overrideDateSortByOldest',
            inputTitle: 'Settings',
            inputName: 'overrideDateSortByOldest'
        };
        component.widgetInput = new OverrideDateSortByOldest({sortByOldest: false});
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
