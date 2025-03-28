import {ComponentFixture, TestBed} from '@angular/core/testing';

import {MainTabsComponent} from './main-tabs.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {JOB_MANAGEMENT, PREVIOUSLY_USED_WIDGETS} from '../../../constants/export-hub.constants';
import {AuxTabBarSelectedDetailInterface} from '@blk/aladdin-angular-components';

describe('MainTabsComponent', () => {
    let component: MainTabsComponent;
    let fixture: ComponentFixture<MainTabsComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            declarations: [MainTabsComponent]
        });
        fixture = TestBed.createComponent(MainTabsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize selectedTab on ngOnInit', () => {
        component.ngOnInit();
        expect(component.selectedTab).toBe(JOB_MANAGEMENT);
        expect(component.allMainTabs).toEqual([
            {
                'label': 'Job Management',
                'uid': JOB_MANAGEMENT
            }
        ]);
    });

    it('should update selectedTab on tabBarItemSelected', () => {
        const event: CustomEvent<AuxTabBarSelectedDetailInterface> = {
            detail: {
                uid: PREVIOUSLY_USED_WIDGETS
            }
        } as CustomEvent<AuxTabBarSelectedDetailInterface>;

        component.tabBarItemSelected(event);
        expect(component.selectedTab).toBe(PREVIOUSLY_USED_WIDGETS);
    });
});
