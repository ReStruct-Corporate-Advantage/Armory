import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaximizeAlphaNewStressScenarioModal } from './maximize-alpha-new-stress-scenario-modal.component';
import {NamedScenario} from '@blk/explore-ui-core';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';

describe('MaximizeAlphaNewStressScenarioComponent', () => {
    let component: MaximizeAlphaNewStressScenarioModal;
    let fixture: ComponentFixture<MaximizeAlphaNewStressScenarioModal>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ MaximizeAlphaNewStressScenarioModal ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
            .compileComponents();

        fixture = TestBed.createComponent(MaximizeAlphaNewStressScenarioModal);
        component = fixture.componentInstance;

        component.nameScenarios = [
            new NamedScenario({
                scenName: 'ABC',
                scenCode: 'ABC::XYZ',
                scenCategory: 'Aladdin Scenarios',
            }),
        ];

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        expect(component['scenarioColumnOption'].nameScenarios.length).toBe(1);
        expect(component['scenarioColumnOption'].lookBackDate).toBeDefined();
        expect(component['scenarioColumnOption'].lookBackDate).not.toBeNull();
        expect(component.column).toBeDefined();
    });

    it('test onDoneClicked', () => {
        expect(component['scenarioColumnOption'].nameScenarios.length).toBe(1);
        component.nameScenarios.length = 0;

        component.onDoneClicked();

        expect(component.nameScenarios.length).toBe(1);
    });

    it('test onDoneClicked for error', () => {
        component['scenarioColumnOption'].nameScenarios = [];
        component.nameScenarios.length = 0;

        component.onDoneClicked();

        expect(component.nameScenarios.length).toBe(0);
    });


});
