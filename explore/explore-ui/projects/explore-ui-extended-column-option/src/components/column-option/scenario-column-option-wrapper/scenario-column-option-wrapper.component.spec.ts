import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScenarioColumnOptionWrapperComponent } from './scenario-column-option-wrapper.component';
import {TokenConstants, TokenUtils} from '@blk/explore-ui-core';

describe('ScenarioColumnOptionWrapperComponent', () => {
    let component: ScenarioColumnOptionWrapperComponent;
    let fixture: ComponentFixture<ScenarioColumnOptionWrapperComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ ScenarioColumnOptionWrapperComponent ]
        })
            .compileComponents();

        fixture = TestBed.createComponent(ScenarioColumnOptionWrapperComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should init with old scenario column option component', () => {
        expect(component.isNewStressScenarioEnabled).toBeFalsy();
        const compiled = fixture.debugElement.nativeElement;
        const selectCtrl = compiled.querySelector('explore-extended-stress-scenario-column-option');
        expect(selectCtrl).toBeNull();
    });

    it('should init with new stress scenario column option component', () => {
        // Set the token to be enabled.
        jest.spyOn(TokenUtils, 'isFeatureEnabled').mockImplementation((tokenName: string): boolean => {
            return tokenName === TokenConstants.EXPLORE_ENABLE_NEW_STRESS_SCENARIOS;
        });

        component.ngOnInit();
        fixture.detectChanges();

        expect(component.isNewStressScenarioEnabled).toBeTruthy();
        const compiled = fixture.debugElement.nativeElement;
        const selectCtrl = compiled.querySelector('explore-extended-stress-scenario-column-option');
        expect(selectCtrl).not.toBeNull();
    });
});
