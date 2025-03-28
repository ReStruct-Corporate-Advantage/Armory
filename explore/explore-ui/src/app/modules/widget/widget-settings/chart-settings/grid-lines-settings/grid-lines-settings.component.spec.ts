import {ComponentFixture, TestBed} from '@angular/core/testing';
import {GridLinesSettingsComponent} from './grid-lines-settings.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {GridLines} from '@models/widget/inputs/chart-settings/grid-lines.model';

describe('GridLinesSettingsComponent', () => {
    let component: GridLinesSettingsComponent;
    let fixture: ComponentFixture<GridLinesSettingsComponent>;

    /**
     * Performs required initialisation before each test is run
     */
    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [GridLinesSettingsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(GridLinesSettingsComponent);
        component = fixture.componentInstance;
        component.widgetInput = new GridLines({showGridLines: true});
    });

    describe('Test initializeComponent method', () => {
        it('initializeComponent should initialize showGridLines to true', () => {
            component.ngOnInit();
            expect(component.showGridLines).toEqual(true);
        });
    });

    describe('Test onShowGridLineChanged method', () => {
        it('onShowGridLineChanged should change the value properly', () => {
            expect(component.widgetInput.showGridLines).toEqual(true);
            const event = {detail: { value: {checked: false}}};
            component.onShowGridLineChanged(event as CustomEvent);
            expect(component.widgetInput.showGridLines).toEqual(false);
        });
    });

});
