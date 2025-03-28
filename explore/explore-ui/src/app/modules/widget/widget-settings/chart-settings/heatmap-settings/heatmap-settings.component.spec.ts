import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {HeatmapSettingsComponent} from './heatmap-settings.component';
import {GridLines} from '@models/widget/inputs/chart-settings/grid-lines.model';
import {WidgetInput} from '@blk/explore-ui-core';

describe('HeatmapSettingsComponent', () => {
    let component: HeatmapSettingsComponent;
    let fixture: ComponentFixture<HeatmapSettingsComponent>;

    /**
     * Performs required initialisation before each test is run
     */
    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [HeatmapSettingsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(HeatmapSettingsComponent);
        component = fixture.componentInstance;
        component.inputs = new Map<string, WidgetInput>();
        component.inputs.set('showGridLines', new GridLines());
    });

    it('should initialize gridLines', () => {
        component.ngOnInit();
        expect(component.gridLines instanceof GridLines).toBeTruthy();
    });
});
