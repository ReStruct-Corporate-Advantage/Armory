import {LoadingSpinnerComponent} from './loading-spinner.component';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {UserMetaDataStore} from '@stores/index';
import {UserPreference} from '@constants/user-preference.constants';
import {ExploreConstants} from '@constants/explore.constants';

describe('Loading Spinner Component', () => {
    let component: LoadingSpinnerComponent;
    let fixture: ComponentFixture<LoadingSpinnerComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [LoadingSpinnerComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(LoadingSpinnerComponent);
        component = fixture.componentInstance;
    });

    it('Test ngOnInit', () => {
        component.ngOnInit();
        // Should default to true
        expect(component.isLightTheme).toBeTruthy();

        UserMetaDataStore.getPreferenceSubject(UserPreference.THEME).next(ExploreConstants.THEME_DARK_MODE);
        // Should be dark theme
        expect(component.isLightTheme).toBeFalsy();
    });
});
