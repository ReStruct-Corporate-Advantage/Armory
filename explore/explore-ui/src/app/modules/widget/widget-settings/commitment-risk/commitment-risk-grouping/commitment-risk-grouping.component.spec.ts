import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CommitmentRiskGroupingComponent} from './commitment-risk-grouping.component';
import {Widget} from '@models/widget/widget.model';
import {WidgetConfigType, WidgetInputType} from '@blk/explore-ui-core';
import {WidgetConfigFactory} from '../../../../../factories';
import {TestUtils} from '@utils/test.utils';
import {AuxSelectSelectionChangedDetailInterface} from '@blk/aladdin-angular-components';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';

describe('CommitmentRiskGroupingComponent', () => {
    let component: CommitmentRiskGroupingComponent;
    let fixture: ComponentFixture<CommitmentRiskGroupingComponent>;

    let widget: Widget;

    beforeAll((done) => {
        TestUtils.initialize(done);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [CommitmentRiskGroupingComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(CommitmentRiskGroupingComponent);
        component = fixture.componentInstance;

        widget = new Widget(WidgetConfigType.COMMITMENT_RISK_CHART);
        component.widgetConfigInput = WidgetConfigFactory.getInputsForWidgetConfigByName(WidgetConfigType.COMMITMENT_RISK_CHART, WidgetInputType.COMMITMENT_RISK_GROUPING);
        component.inputs = widget.getCombinedInputs();

        fixture.detectChanges();
    });

    it('should initialize grouping options correctly', () => {
        component.widgetInput.groupBy = 'COHORT';

        component.initializeComponent();
        expect(component.groupingSelectOptions).toHaveLength(2);
        expect(component.groupingSelectOptions[1].values).toHaveLength(3);

        const cohortOption = component.groupingSelectOptions[1].values[0];
        expect(cohortOption.displayValue).toEqual('Cohort');
        expect(cohortOption.value).toEqual('COHORT');
        expect(cohortOption.isSelected).toEqual(true);
    });

    it('should initialize NONE grouping correctly', () => {
        component.widgetInput.groupBy = undefined;

        component.initializeComponent();
        expect(component.groupingSelectOptions).toHaveLength(2);
        expect(component.groupingSelectOptions[0].values).toHaveLength(1);

        const noneOption = component.groupingSelectOptions[0].values[0];
        expect(noneOption.displayValue).toEqual('None');
        expect(noneOption.value).toBeUndefined();
        expect(noneOption.isSelected).toEqual(true);
    });

    it('should update grouping when select option changed', () => {
        component.widgetInput.groupBy = 'COHORT';

        const event = {detail: {value: {value: 'GEOGRAPHY_FOCUS'}}} as CustomEvent<AuxSelectSelectionChangedDetailInterface>;

        component.updateGrouping(event);

        expect(component.widgetInput.groupBy).toEqual('GEOGRAPHY_FOCUS');
    });
});
