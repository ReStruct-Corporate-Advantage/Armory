import {ComponentFixture, TestBed} from '@angular/core/testing';

import {MarginAnalyticsCassiniSettingsComponent} from './margin-analytics-cassini-settings.component';
import {TestUtils} from '@utils/test.utils';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {CoreDefinitionStore, TokenConstants} from '@blk/explore-ui-core';
import {MarginAnalyticsCassiniSettings} from '@models/widget/inputs/margin-analytics-cassini-settings.model';

describe('MarginAnalyticsCassiniSettingsComponent', () => {
    let component: MarginAnalyticsCassiniSettingsComponent;
    let fixture: ComponentFixture<MarginAnalyticsCassiniSettingsComponent>;

    beforeAll((done) => {
        TestUtils.initialize(done);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [MarginAnalyticsCassiniSettingsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(MarginAnalyticsCassiniSettingsComponent);
        component = fixture.componentInstance;
        component.widgetInput = new MarginAnalyticsCassiniSettings({
            groupingStyle: 'Portfolio',
            calculationStyle: 'LEVEL_PROPORTIONAL'
        });
    });


    it('Test Initialize', () => {
        CoreDefinitionStore.tokens = [];
        CoreDefinitionStore.tokens[TokenConstants.EXPLORE_MARGIN_ANALYTICS_GROUPING_STYLES] = 'Instrument,Portfolio,Position,Strategy';
        component.initializeComponent();
        expect(component.groupingStyleOptions[0].values.length).toEqual(4);
        expect(component.calculationStyleOptions[0].values.length).toEqual(4);
    });
});
