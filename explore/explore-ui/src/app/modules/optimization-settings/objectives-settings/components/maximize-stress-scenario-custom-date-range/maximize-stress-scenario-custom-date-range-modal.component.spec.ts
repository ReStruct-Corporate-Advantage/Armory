import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {MaximizeStressScenarioCustomDateRangeModalComponent} from '@optimization-settings/objectives-settings/components/maximize-stress-scenario-custom-date-range/maximize-stress-scenario-custom-date-range-modal.component';
import {StressScenarioDateRangeObjective} from '@models/portfolio/objectives/stress-scenario-date-range-objective.model';
import {CoreDefinitionStore, DateScenario, TokenConstants} from '@blk/explore-ui-core';

describe('MaximizeStressScenarioCustomDateRangeModal', () => {
    let component: MaximizeStressScenarioCustomDateRangeModalComponent;
    let fixture: ComponentFixture<MaximizeStressScenarioCustomDateRangeModalComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [MaximizeStressScenarioCustomDateRangeModalComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(MaximizeStressScenarioCustomDateRangeModalComponent);
        component = fixture.componentInstance;
        component.portfolioObjective = new StressScenarioDateRangeObjective();
        fixture.detectChanges();
        component.isOpen = true;
    });

    describe('test for isNewStressScenarioEnabled token is false', () => {

        describe('ngOnInit Test', () => {
            it('should initialize dateRangeScenarios', () => {
                component.portfolioObjective = new StressScenarioDateRangeObjective();
                component.ngOnInit();
                expect(component.dateRangeScenarios.length).toEqual(1);
            });
        });

        describe('closeModal Test', () => {
            it('should close modal on cancel button clicked', () => {
                jest.spyOn(component.modalClosed, 'emit');
                component.onClosed(false);

                expect(component.isOpen).toBeFalsy();
                expect(component.modalClosed.emit).toHaveBeenCalled();
            });

            it('should apply settings on apply button clicked', () => {
                component.dateRangeScenarios = [new DateScenario({data: {id: 'a', toDate: {date: '03/11/2020'}, fromDate: {date: '03/11/2021'}}})];
                jest.spyOn(component.modalClosed, 'emit');
                component.onClosed(true);
                (component.portfolioObjective as StressScenarioDateRangeObjective).dateRangeScenarios = component.dateRangeScenarios;
                expect(component.isOpen).toBeFalsy();
                expect(component.modalClosed.emit).toHaveBeenCalled();
            });
        });
    });

    describe('test for isNewStressScenarioEnabled token is true', () => {

        beforeAll(() => {
            CoreDefinitionStore.tokens[TokenConstants.EXPLORE_ENABLE_NEW_STRESS_SCENARIOS] = 'Y';
        });

        describe('ngOnInit Test', () => {
            it('should initialize dateRangeScenarios', () => {
                component.portfolioObjective = new StressScenarioDateRangeObjective();
                component.ngOnInit();
                expect(component.dateRangeScenarios.length).toEqual(1);
                expect(component.stressScenario).toBeDefined();
            });
        });

        describe('closeModal Test', () => {
            it('should close modal on cancel button clicked', () => {
                jest.spyOn(component.modalClosed, 'emit');
                component.onClosed(false);

                expect(component.isOpen).toBeFalsy();
                expect(component.modalClosed.emit).toHaveBeenCalled();
            });

            it('should apply settings on apply button clicked', () => {
                component.dateRangeScenarios = [new DateScenario({data: {id: 'a', toDate: {date: '03/11/2020'}, fromDate: {date: '03/11/2021'}}})];
                jest.spyOn(component.modalClosed, 'emit');
                component.onClosed(true);
                expect(component.validateStressScenario).toBeTruthy();
                expect(component.isOpen).not.toBeFalsy();
                expect(component.modalClosed.emit).not.toHaveBeenCalled();
            });
        });

        describe('test  validateStressScenarioHandler', () => {
            it('validateStressScenarioHandler called when isValid true', () => {
                jest.spyOn(component.modalClosed, 'emit');
                component.validateStressScenarioHandler(true);

                expect(component.stressScenario.dateScenario).toEqual((component.portfolioObjective as StressScenarioDateRangeObjective).dateRangeScenarios[0]);
                expect(component.validateStressScenario).not.toBeTruthy();
                expect(component.isOpen).toBeFalsy();
                expect(component.modalClosed.emit).toHaveBeenCalled();
            });

            it('validateStressScenarioHandler called when isValid false', () => {
                jest.spyOn(component.modalClosed, 'emit');
                component.validateStressScenarioHandler(false);
                expect(component.validateStressScenario).not.toBeTruthy();
                expect(component.isOpen).not.toBeFalsy();
                expect(component.modalClosed.emit).not.toHaveBeenCalled();
            });
        });
    });


});
