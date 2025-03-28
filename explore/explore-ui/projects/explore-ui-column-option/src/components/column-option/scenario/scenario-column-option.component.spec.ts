import {
    ColumnOptionFactory,
    CoreTestUtils,
    CoreWidgetConfigStore,
    DateScenarioComponent,
    NamedScenarioComponent,
    OtherScenarioComponent,
    TokenUtils,
    WidgetConfigType,
    UserScenarioService,
    DateService, NamedScenario, UserScenariosConstants, DateValue, DateStore
} from '@blk/explore-ui-core';
import {ScenarioColumnOption} from '../../../models/column-option/scenario-column-option.model';
import {ColumnOptionTestBed} from '../../../test-utils';
import {ScenarioColumnOptionComponent} from './scenario-column-option.component';
import {Subject, of} from 'rxjs';

describe('Scenario column option component', () => {
    let testBed: ColumnOptionTestBed<ScenarioColumnOptionComponent, ScenarioColumnOption>;

    const defaultLookBackDate = DateValue.newRelativeDate('T-' + 8000);
    defaultLookBackDate.calCode = '';
    const fetchedScenarios = new Map<string, NamedScenario[]>();
    fetchedScenarios.set('key', []);
    const dateServiceMock = {
        midNightRefresh$: new Subject(),
        parseDateString$: jest.fn(() => {
            return of(new Date('12/1/2014'));
        }),
        getMaxDateByCalendarCode$: () => of(new Date(2023, 10, 31))
    };

    /**
     * Performs required initialisation before any test is run
     */
    beforeEach(() => {
        CoreTestUtils.initDefinitions();
        ColumnOptionFactory.registerOptionType(ScenarioColumnOption.CONFIG_TYPE, ScenarioColumnOption);

        // Create the mocked column option to validate this control.
        const mockedOption = {
            columnOptionTitle: 'Scenario Selection',
            columnOptionAttributes: [{
                title: 'Named Scenario',
                key: 'NAMED-SCENARIO',
                dataType: 'S'
            }],
            columnOptionKey: 'scenarioRiskFactorViewColumnSettings'
        };

        const scenarioColumnOption = new ScenarioColumnOption();
        scenarioColumnOption.fetchedScenarios = fetchedScenarios;
        scenarioColumnOption.lookBackDate = defaultLookBackDate;

        DateStore.currentDate$.next(defaultLookBackDate);

        // Create the testbed for testing the component.
        testBed = new ColumnOptionTestBed<ScenarioColumnOptionComponent, ScenarioColumnOption>(
            ScenarioColumnOptionComponent,
            scenarioColumnOption,
            mockedOption,
            [NamedScenarioComponent, DateScenarioComponent, OtherScenarioComponent],
            undefined,
            undefined,
            undefined,
            [{provide: UserScenarioService, useValue: {fetchUserScenarios$: jest.fn(() => {
                        const mockResponse = new Map<string, NamedScenario[]>();
                        mockResponse.set(UserScenariosConstants.USER_DEFINED_SCENARIOS, [
                            new NamedScenario({
                                scenName: 'JKSTDABS',
                                scenCode: 'JKSTDABS::DEV',
                            })]);
                        return of(mockResponse);
                    })} },
                {provide: DateService, useValue: dateServiceMock}]
        );
    });

    it('should have initialised', () => {
        expect(testBed.component.isDateScenarioEnabled).toBeTruthy();
        expect(testBed.component.isAdvancedPraEnabled).toBeFalsy();

        // Make sure we get a child control.
        const compiled = testBed.fixture.debugElement.nativeElement;
        const selectCtrl = compiled.querySelector('explore-core-named-scenario');
        expect(selectCtrl).not.toBe(null);
    });

    it('init with modeller and date enabled', () => {
        // Set the widget and token to be enabled.
        CoreWidgetConfigStore.updateCurrentWidgetConfigType(WidgetConfigType.PRA);
        jest.spyOn(TokenUtils, 'isOptionEnabledBasedOnTokenOrUserPerm').mockReturnValue(true);

        testBed.fixture.detectChanges();
        testBed.component.ngOnInit();

        expect(testBed.component.isDateScenarioEnabled).toBeTruthy();
        expect(testBed.component.isAdvancedPraEnabled).toBeTruthy();
        expect(testBed.component['allowNamedScenarioSingleSelection']).toBeFalsy();
    });

    it('test loading spinner', () => {
        testBed.component.showSpinner$.next(true);
        testBed.fixture.detectChanges();

        // Make sure we get a child control.
        let compiled = testBed.fixture.debugElement.nativeElement;
        let selectCtrl = compiled.querySelector('explore-core-named-scenario');
        expect(selectCtrl.parentElement.hidden).toBeTruthy();

        let selectCtrl2 = compiled.querySelector('aux-progress-indicator');
        expect(selectCtrl2).not.toBe(null);

        testBed.component.showSpinner$.next(false);
        testBed.fixture.detectChanges();

        // Make sure we get a child control.
        compiled = testBed.fixture.debugElement.nativeElement;
        selectCtrl = compiled.querySelector('explore-core-named-scenario');
        expect(selectCtrl.parentElement.hidden).not.toBeTruthy();

        selectCtrl2 = compiled.querySelector('aux-progress-indicator');
        expect(selectCtrl2).toBe(null);
    });
});
