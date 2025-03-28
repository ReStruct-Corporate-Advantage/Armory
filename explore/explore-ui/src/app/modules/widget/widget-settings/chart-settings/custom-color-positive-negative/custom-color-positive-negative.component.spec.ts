import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {WidgetConfigType} from '@blk/explore-ui-core';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {TestUtils} from '@utils/test.utils';
import {WidgetConfigFactory} from '../../../../../factories';
import {Widget} from '@models/widget/widget.model';
import {WorkspaceStore} from '@stores/index';
import {CustomColorPositiveNegativeComponent} from './custom-color-positive-negative.component';
import {Breakdown} from '@blk/explore-ui-breakdown';

describe('CustomColorPositiveNegative', () => {
    let component: CustomColorPositiveNegativeComponent;
    let fixture: ComponentFixture<CustomColorPositiveNegativeComponent>;
    let widget: Widget;

    beforeAll((done) => {
        TestUtils.initialize(done);
        WorkspaceStore.init();
        WorkspaceStore.updateCurrentPortfolio(new Portfolio('PEP'));
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [CustomColorPositiveNegativeComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(CustomColorPositiveNegativeComponent);
        component = fixture.componentInstance;
        widget = new Widget(WidgetConfigType.BAR);

        component.widgetConfigInput = WidgetConfigFactory.getInputsForWidgetConfigByName(WidgetConfigType.BAR, 'customColorPositiveNegative');
        component.inputs = widget.getCombinedInputs();
        component.ngOnInit();
    });

    it('check if component is initialized correctly', () => {
        const stackedBreakdown = component.getInput('stackedBreakdownTree');
        component.widgetInput.isEnabled = true;
        component.initializeComponent();
        expect(component.disableOption).toBeFalsy();
        expect(component.widgetInput.isEnabled).toBeTruthy();
        (stackedBreakdown as Breakdown).deserialize(Breakdown.getDefaultBreakdown().serialize());
        component.widgetInput.positiveColor = '#00FFFF';
        component.widgetInput.negativeColor = '#FFFFFF';
        component.initializeComponent();
        expect(component.disableOption).toBeTruthy();
        expect(component.widgetInput.isEnabled).toBeFalsy();
        expect(component.widgetInput.positiveColor).toEqual('#008000');
        expect(component.widgetInput.negativeColor).toEqual('#FF0000');
    });


    describe('Test onCheckboxGroupChanged method', () => {
        it('onCheckboxGroupChanged should change the includeTotalValues properly', () => {
            // component.widgetInput = component.getInput('customColorPositiveNegative') as CustomColorPositiveNegative;
            component.onCheckboxGroupChanged(true);
            expect(component.widgetInput.isEnabled).toBeTruthy();
            component.widgetInput.positiveColor = '#00FFFF';
            component.widgetInput.negativeColor = '#FFFFFF';
            component.onCheckboxGroupChanged(false);
            expect(component.widgetInput.isEnabled).toBeFalsy();
            expect(component.widgetInput.positiveColor).toEqual('#00FFFF');
            expect(component.widgetInput.negativeColor).toEqual('#FFFFFF');
        });
    });
});
