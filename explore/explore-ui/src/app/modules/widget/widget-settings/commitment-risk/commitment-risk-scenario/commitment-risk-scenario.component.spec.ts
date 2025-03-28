import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CommitmentRiskScenarioComponent} from './commitment-risk-scenario.component';
import {Widget} from '@models/widget/widget.model';
import {TestUtils} from '@utils/test.utils';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {WidgetConfigType, WidgetInputType} from '@blk/explore-ui-core';
import {WidgetConfigFactory} from '../../../../../factories';
import {AuxSelectSelectionChangedDetailInterface} from '@blk/aladdin-angular-components';

describe('CommitmentRiskScenarioComponent', () => {
    let component: CommitmentRiskScenarioComponent;
    let fixture: ComponentFixture<CommitmentRiskScenarioComponent>;

    let widget: Widget;

    beforeAll((done) => {
        TestUtils.initialize(done);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [CommitmentRiskScenarioComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(CommitmentRiskScenarioComponent);
        component = fixture.componentInstance;

        widget = new Widget(WidgetConfigType.COMMITMENT_RISK_CHART);
        component.widgetConfigInput = WidgetConfigFactory.getInputsForWidgetConfigByName(WidgetConfigType.COMMITMENT_RISK_CHART, WidgetInputType.COMMITMENT_RISK_SCENARIO);
        component.inputs = widget.getCombinedInputs();

        fixture.detectChanges();
    });

    it('should initialize grouping options correctly', () => {
        component.widgetInput.scenario = 'glob_eqmkt_down';

        component.initializeComponent();
        expect(component.scenarioSelectOptions).toHaveLength(2);
        expect(component.scenarioSelectOptions[1].values).toHaveLength(3);

        const globalEqMktDownOption = component.scenarioSelectOptions[1].values[2];
        expect(globalEqMktDownOption.displayValue).toEqual('Global Equity Market Down');
        expect(globalEqMktDownOption.value).toEqual('glob_eqmkt_down');
        expect(globalEqMktDownOption.isSelected).toEqual(true);
    });

    it('should initialize NONE grouping correctly', () => {
        component.widgetInput.scenario = undefined;

        component.initializeComponent();
        expect(component.scenarioSelectOptions).toHaveLength(2);
        expect(component.scenarioSelectOptions[0].values).toHaveLength(1);

        const noneOption = component.scenarioSelectOptions[0].values[0];
        expect(noneOption.displayValue).toEqual('None');
        expect(noneOption.value).toBeUndefined();
        expect(noneOption.isSelected).toEqual(true);
    });

    it('should update grouping when select option changed', () => {
        component.widgetInput.scenario = 'glob_eqmkt_down';

        const event = {detail: {value: {value: 'fed_adverse'}}} as CustomEvent<AuxSelectSelectionChangedDetailInterface>;

        component.updateScenario(event);

        expect(component.widgetInput.scenario).toEqual('fed_adverse');
    });

    it('openScenariosDocumentationLink test', () => {
        window.open = jest.fn();
        component.openScenariosDocumentationLink();
        expect(window.open).toHaveBeenCalledWith('https://dev.blackrock.com/acs/literature/aladdin-publication/acrm-multiperiod-scenarios.pdf', '_blank');
    });
});
