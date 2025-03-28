import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {SecondaryAxisColumnSettingsComponent} from './secondary-axis-column-settings.component';
import {Widget} from '@models/widget/widget.model';
import {SecondaryAxis} from '@models/widget/inputs/chart-settings/secondary-axis.model';
import {TestUtils} from '@utils/test.utils';
import {WidgetConfigType} from '@blk/explore-ui-core';

describe('SecondaryAxisColumnSettingsComponent', () => {
    let component: SecondaryAxisColumnSettingsComponent;
    let fixture: ComponentFixture<SecondaryAxisColumnSettingsComponent>;
    let widget;

    /**
     * Performs required initialisation before any test is run
     */
    beforeAll((done) => {
        TestUtils.initialize(done);
    });

    /**
     * Performs required initialisation before each test is run
     */
    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [SecondaryAxisColumnSettingsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(SecondaryAxisColumnSettingsComponent);
        component = fixture.componentInstance;
        widget = new Widget(WidgetConfigType.TIME_SERIES);

        component.inputs = widget.dataStore.metaData.inputs;
        component.widgetInput = new SecondaryAxis();
    });

    describe('Test initializeComponent method', () => {
        it('initializeComponent should initialize widgetColumns and secondaryAxisColumns', () => {
            component.widgetInput.secondaryAxisColumn = 'pct_notional_val_0';
            component.ngOnInit();

            expect(component.allColumnsSelectOptions[0].values.filter(secondaryAxisColumn => secondaryAxisColumn.value === component.widgetInput.secondaryAxisColumn)[0].isSelected).toBe(true);

            component.widgetInput = undefined;
            component.ngOnInit();

            expect(component.widgetInput instanceof SecondaryAxis);
            expect(component.widgetInput.secondaryAxisColumn).toBeUndefined();
        });
    });

    describe('Test onSecondaryAxisColSelectionChanged method', () => {
        it('onSecondaryAxisColSelectionChanged should change the value properly', () => {
            const event = {detail: {value: {value: 'pct_notional_val_0'}}};

            component.onSecondaryAxisColSelectionChanged(event as CustomEvent);
            expect(component.widgetInput.secondaryAxisColumn).toEqual('pct_notional_val_0');
        });

        it('onSecondaryAxisColSelectionChanged - when no column is selected', () => {
            const event = {detail: {value: null}};

            component.onSecondaryAxisColSelectionChanged(event as CustomEvent);
            expect(component.widgetInput.secondaryAxisColumn).toBeUndefined();
        });
    });

});
