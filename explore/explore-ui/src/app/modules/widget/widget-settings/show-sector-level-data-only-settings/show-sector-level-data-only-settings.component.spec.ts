import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ShowSectorLevelDataOnlySettingsComponent} from './show-sector-level-data-only-settings.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ShowSectorLevelDataOnlyModel} from '@models/widget/inputs/show-sector-level-data-only.model';

describe('ShowSectorLevelDataOnlySettingsComponent', () => {
    let component: ShowSectorLevelDataOnlySettingsComponent;
    let fixture: ComponentFixture<ShowSectorLevelDataOnlySettingsComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ShowSectorLevelDataOnlySettingsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(ShowSectorLevelDataOnlySettingsComponent);
        component = fixture.componentInstance;
        component.inputs = new Map<string, ShowSectorLevelDataOnlyModel>();
        component.widgetConfigInput = {
            inputConfigType: 'sectorLevelDataOnly',
            inputTitle: 'Security level data',
            inputName: 'sectorLevelDataOnly'
        };
        component.widgetInput = new ShowSectorLevelDataOnlyModel(true);
        component.inputs.set('sectorLevelDataOnly', component.widgetInput);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });


    it('should set variables onInit', () => {
        component.ngOnInit();
        expect(component.showSecurityLevelDataOptions.length).toBe(2);
    });

    it('Test onShowSecurityLevelDataOptionChanged', () => {
        expect(component.widgetInput?.isSectorView).toBeTruthy();
        component.onShowSecurityLevelDataOptionChanged({eventData: true});
        expect(component.widgetInput?.isSectorView).toBeFalsy();
    });
});
