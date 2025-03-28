import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {TestUtils} from '@utils/test.utils';
import {Widget} from '../../../../models/widget/widget.model';
import {RiskAndExposureSettingsComponent} from './risk-and-exposure-settings.component';
import {RiskAndExposureAdditionalSettings} from '../../../../models/widget/inputs/risk-and-exposure-additional-settings.model';
import {WidgetConfigFactory} from '../../../../factories/widget-config.factory';
import {WorkspaceStore} from '../../../../stores';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {ExploreSelectOption, ExploreSelectOptionGroup, WidgetConfigType} from '@blk/explore-ui-core';

describe('RiskAndExposureSettingsComponent', () => {
    let component: RiskAndExposureSettingsComponent;
    let fixture: ComponentFixture<RiskAndExposureSettingsComponent>;
    let riskAndExposureAdditionalSettings: RiskAndExposureAdditionalSettings;
    let widget;

    /**
     * Performs required initialisation before any test is run
     */
    beforeAll((done) => {
        TestUtils.initialize(done);
        WorkspaceStore.init();
        WorkspaceStore.updateCurrentPortfolio(new Portfolio('PEP'));
    });

    /**
     * Performs required initialisation before each test is run     */
    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [RiskAndExposureSettingsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(RiskAndExposureSettingsComponent);
        component = fixture.componentInstance;
        widget = new Widget(WidgetConfigType.RISK_EXPOSURE);

        component.widgetConfigInput = WidgetConfigFactory.getInputsForWidgetConfigByName(WidgetConfigType.RISK_EXPOSURE, 'riskAndExposureAdditionalSettings');
        component.inputs = widget.dataStore.metaData.inputs;
        riskAndExposureAdditionalSettings = component.getInput(component.widgetConfigInput.inputName) as RiskAndExposureAdditionalSettings;
    });

    /**
     * Scenario.
     *   RiskAndExposureAdditionalSettings has agg types setup
     * Expected result.
     *   Each agg type collection should have the selected item that matches the corresponding agg type
     *   in RiskAndExposureAdditionalSettings
     */
    it('Check component initialisation - agg types setup', () => {
        // Set agg types
        riskAndExposureAdditionalSettings.closedPositionAggregationType = 'GROUP';
        riskAndExposureAdditionalSettings.benchmarkPositionAggregationType = 'EXCLUDE';
        riskAndExposureAdditionalSettings.portfolioPositionAggregationType = 'NONE';

        // Initialise
        component.ngOnInit();

        // Validate
        validatePositionTypes(component.closedPositionAggregationTypes, riskAndExposureAdditionalSettings.closedPositionAggregationType);
        validateAggregationTypes(component.benchmarkPositionAggregationTypes, riskAndExposureAdditionalSettings.benchmarkPositionAggregationType);
        validateAggregationTypes(component.portfolioPositionAggregationTypes, riskAndExposureAdditionalSettings.portfolioPositionAggregationType);
    });

    /**
     * Scenario.
     *   RiskAndExposureAdditionalSettings does not have agg types setup
     * Expected result.
     *   Each agg type collection should have the selected item that matches the corresponding default agg type
     */
    it('Check component initialisation - agg types are not setup', () => {
        // Set agg types
        riskAndExposureAdditionalSettings.closedPositionAggregationType = null;
        riskAndExposureAdditionalSettings.benchmarkPositionAggregationType = null;
        riskAndExposureAdditionalSettings.portfolioPositionAggregationType = null;

        // Initialise
        component.ngOnInit();

        // Validate
        validatePositionTypes(component.closedPositionAggregationTypes, component.widgetConfigInput.default.closedPositionAggregationType);
        validateAggregationTypes(component.benchmarkPositionAggregationTypes, component.widgetConfigInput.default.benchmarkPositionAggregationType);
        validateAggregationTypes(component.portfolioPositionAggregationTypes, component.widgetConfigInput.default.portfolioPositionAggregationType);
    });

    /**
     * Test setting the agg types
     */
    it('Test setting the agg types', () => {
        component.ngOnInit();

        let aggType = 'GROUP';
        component.setClosedPositionAggregationType(aggType);
        expect(component.widgetInput.closedPositionAggregationType).toStrictEqual(aggType);

        aggType = 'EXCLUDE';
        component.setBenchmarkPositionAggregationType(aggType);
        expect(component.widgetInput.benchmarkPositionAggregationType).toStrictEqual(aggType);

        aggType = 'xyz';
        component.setPortfolioPositionAggregationType(aggType);
        expect(component.widgetInput.portfolioPositionAggregationType).toStrictEqual(aggType);
    });

    /**
     * Validates given aggregationTypes
     * @param aggregationTypes agg types to validate
     * @param expectedSelectedAggType the expected selected agg type
     */
    function validateAggregationTypes(aggregationTypes: ExploreSelectOptionGroup[], expectedSelectedAggType: string) {
        const items: Array<ExploreSelectOption> = aggregationTypes[0].values;

        // Validate the number of items
        expect(items.length).toStrictEqual(4);

        // Find the selected item
        let selectedAggType: string = null;
        items.forEach((item) => {
            if (item.isSelected) {
                selectedAggType = item.value;
            }
        });

        // Validate the selected item
        expect(selectedAggType).toStrictEqual(expectedSelectedAggType);
    }
    function validatePositionTypes(positionTypes: ExploreSelectOptionGroup[], expectedSelectedPosType: string) {
        const items: Array<ExploreSelectOption> = positionTypes[0].values;

        // Validate the number of items
        expect(items.length).toStrictEqual(3);

        // Find the selected item
        let selectedPosType: string = null;
        items.forEach((item) => {
            if (item.isSelected) {
                selectedPosType = item.value;
            }
        });

        // Validate the selected item
        expect(selectedPosType).toStrictEqual(expectedSelectedPosType);
    }
});
