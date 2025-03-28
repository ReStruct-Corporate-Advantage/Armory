import {ComponentFixture, TestBed} from '@angular/core/testing';
import {DateRangeScenarioComponent} from './date-range-scenario.component';
import {StressScenario} from '../../../../../../models/stress-scenario.model';
import {ScenarioTypeEnum} from '../../../../../../enums/scenario-type.enum';
import {DateValue, DateStore, DateService, NOTIFICATION_SERVICE_TOKEN} from '@blk/explore-ui-core';
import {BehaviorSubject, of} from 'rxjs';

describe('DateRangeScenarioComponent', () => {
    let component: DateRangeScenarioComponent;
    let fixture: ComponentFixture<DateRangeScenarioComponent>;

    const dateServiceStub = {
        parseDateString$: jest.fn(() => of(new Date(2023, 10, 31))),
    };
    const notificationServiceStub = {
        error: jest.fn()
    };

    beforeAll(() => {
        const currentDate = DateValue.newDate('03/31/2021');
        currentDate.calCode = '';
        DateStore.updateCurrentDate(currentDate);
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ DateRangeScenarioComponent ],
            providers: [
                {provide: DateService, useValue: dateServiceStub},
                {provide: NOTIFICATION_SERVICE_TOKEN, useValue: notificationServiceStub},
            ]
        })
            .compileComponents();

        fixture = TestBed.createComponent(DateRangeScenarioComponent);
        component = fixture.componentInstance;
        component.scenario = new StressScenario({ scenType: ScenarioTypeEnum.DATE_RANGE });
        component.showSpinner$ = new BehaviorSubject<boolean>(false);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        expect(component.minDate).toBeDefined();
        expect(component.validator).toBeDefined();
        expect(component.scenario.dateScenario.dxsShockUnit).toBeDefined();
        expect(component.scenario.dateScenario.fromDate).toBeDefined();
        expect(component.scenario.dateScenario.toDate).toBeDefined();
    });

    it('test onHoldingPeriodOverrideChanged', () => {
        component.onHoldingPeriodOverrideChanged('');
        expect(component.scenario.dateScenario.holdingPeriodOverride).toBeUndefined();

        component.onHoldingPeriodOverrideChanged('3');
        expect(component.scenario.dateScenario.holdingPeriodOverride).toBe(3);
    });

    it('test validateStressScenario for valid scenario', () => {
        const date = '03/31/2015';
        component.scenario.dateScenario.fromDate.date = date;
        component.scenario.dateScenario.toDate.date = date;
        component.scenario.dateScenario.holdingPeriodOverride = 5;
        jest.spyOn(component.scenarioValidatedEmitter, 'emit');
        component['validateStressScenario']();
        expect(component.scenarioValidatedEmitter.emit).toHaveBeenCalledWith(true);

        component.scenario.dateScenario.holdingPeriodOverride = undefined;
        component['validateStressScenario']();
        expect(component.scenarioValidatedEmitter.emit).toHaveBeenCalledWith(true);
    });

    it('test validateStressScenario for invalid scenario', () => {
        const scenarioValidatedEmitterSpy = jest.spyOn(component.scenarioValidatedEmitter, 'emit');
        const date = '03/31/2015';

        scenarioValidatedEmitterSpy.mockClear();

        // Invalid absolute dates
        component.scenario.dateScenario.fromDate = DateValue.newDate(date);
        component.scenario.dateScenario.toDate = DateValue.newDate(undefined);
        component['validateStressScenario']();
        expect(scenarioValidatedEmitterSpy).toHaveBeenLastCalledWith(false);

        // Invalid relative dates
        component.scenario.dateScenario.fromDate = DateValue.newRelativeDate('T-2');
        component.scenario.dateScenario.toDate = DateValue.newRelativeDate(undefined);
        component['validateStressScenario']();
        expect(scenarioValidatedEmitterSpy).toHaveBeenLastCalledWith(false);

        component.scenario.dateScenario.fromDate = DateValue.newDate(date);
        component.scenario.dateScenario.toDate = DateValue.newDate(date);

        // Invalid holdingPeriodOverride
        component.scenario.dateScenario.holdingPeriodOverride = 0;
        component['validateStressScenario']();
        expect(scenarioValidatedEmitterSpy).toHaveBeenLastCalledWith(false);

        component.scenario.dateScenario.holdingPeriodOverride = 2.3;
        component['validateStressScenario']();
        expect(scenarioValidatedEmitterSpy).toHaveBeenLastCalledWith(false);

        component.scenario.dateScenario.holdingPeriodOverride = 2;
        component['validateStressScenario']();
        expect(scenarioValidatedEmitterSpy).toHaveBeenLastCalledWith(true);
    });
});
