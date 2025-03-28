import {ComponentFixture, TestBed} from '@angular/core/testing';
import {BreakdownCustomSectorSelectorComponent} from './breakdown-custom-sector-selector.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {BreakdownBuilderSettings} from '@blk/explore-ui-breakdown';
import {BehaviorSubject} from 'rxjs';
import {CoreUserMetaDataStore, UserMetaData} from '@blk/explore-ui-core';

describe('BreakdownCustomSectorSelectorComponent', () => {
    let component: BreakdownCustomSectorSelectorComponent;
    let fixture: ComponentFixture<BreakdownCustomSectorSelectorComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [BreakdownCustomSectorSelectorComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        CoreUserMetaDataStore.userMetaData.login = 'simsingh';
        fixture = TestBed.createComponent(BreakdownCustomSectorSelectorComponent);
        component = fixture.componentInstance;
        component.breakdownBuilderSettings = new BreakdownBuilderSettings();
        component.searchTermSubject$ = new BehaviorSubject<string>(null);
        fixture.detectChanges();
    });

    it('should create', () => {
        component.searchTermSubject$.next('');
        expect(component.isExpanded).toBeFalsy();
        component.searchTermSubject$.next('Test');
        expect(component.isExpanded).toBeTruthy();
    });
});
