import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TestUtils} from '@utils/test.utils';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ColorScaleSettingsComponent} from './color-scale-settings.component';
import {ColorScale} from '@models/widget/inputs/chart-settings/color-scale.model';
import { ColorScaleMidpointOption } from '@enums/color-scale-midpoint-option';
import { ColorScaleGradientOption, GradientEnum } from '@enums/color-scale-gradient-option.enum';
import {ColorScaleFormatOption} from '@enums/color-scale-format-option';
describe('ColorScaleSettingsComponent', () => {
    let component: ColorScaleSettingsComponent;
    let fixture: ComponentFixture<ColorScaleSettingsComponent>;

    beforeAll((done) => {
        TestUtils.initialize(done);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ColorScaleSettingsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(ColorScaleSettingsComponent);
        component = fixture.componentInstance;
        component.widgetInput = new ColorScale({
            format: ColorScaleFormatOption.TWO_COLOR_SCALE,
            midpoint: ColorScaleMidpointOption.AUTO_SCALE,
            colors: ColorScaleGradientOption.BLUE
        });
    });


    it('Test Initialize', () => {
        component.initializeComponent();
        expect(component.formatOptions[0].values.length).toEqual(2);
        expect(component.midpointOptions[0].values.length).toEqual(3);
    });

    it('Test Format Type Change', () => {
        expect(component.widgetInput.format).toEqual(ColorScaleFormatOption.TWO_COLOR_SCALE);

        let event = new CustomEvent('build', {detail: {value: {value: ColorScaleFormatOption.TWO_COLOR_SCALE, displayValue: ColorScaleFormatOption.TWO_COLOR_SCALE}}});
        component.onFormatChanged(event as CustomEvent);
        expect(component.threeColorScale).toBeFalsy();

        event = new CustomEvent('build', {detail: {value: {value: ColorScaleFormatOption.THREE_COLOR_SCALE, displayValue: ColorScaleFormatOption.THREE_COLOR_SCALE}}});
        component.onFormatChanged(event as CustomEvent);
        expect(component.widgetInput.format).toBe(ColorScaleFormatOption.THREE_COLOR_SCALE);
        expect(component.threeColorScale).toBeTruthy();
    });

    it('Test Midpoint Type Change', () => {
        expect(component.widgetInput.midpoint).toEqual(ColorScaleMidpointOption.AUTO_SCALE);

        const event = new CustomEvent('build', {detail: {value: {value: ColorScaleMidpointOption.ZERO_CENTERED, displayValue: ColorScaleMidpointOption.ZERO_CENTERED}}});
        component.onMidpointChanged(event as CustomEvent);
        expect(component.widgetInput.midpoint).toBe(ColorScaleMidpointOption.ZERO_CENTERED);
    });

    it('Test Gradient Color Change', () => {
        expect(component.widgetInput.colors).toEqual(ColorScaleGradientOption.BLUE);

        const event = new CustomEvent('build', {detail: {value: {value: ColorScaleMidpointOption.ZERO_CENTERED, displayValue: ColorScaleMidpointOption.ZERO_CENTERED}}});
        component.onGradientChanged(GradientEnum.GREEN);
        expect(component.widgetInput.colors).toStrictEqual(GradientEnum.GREEN.colorOption);
    });

});
