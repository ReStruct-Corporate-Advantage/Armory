import {Component} from '@angular/core';
import {ColorScale} from '@models/widget/inputs/chart-settings/color-scale.model';
import {BaseWidgetSettingComponent} from '@blk/explore-ui-column-option';
import {ColorScaleFormatOption} from '@enums/color-scale-format-option';
import {AuxButtonTypeEnum, AuxSelectOption, AuxSelectSelectionChangedDetailInterface} from '@blk/aladdin-angular-components';
import {ExploreSelectOptionGroup} from '@blk/explore-ui-core';
import {ColorScaleMidpointOption} from '@enums/color-scale-midpoint-option';
import {ColorScaleGradientOption, GradientEnum} from '@enums/color-scale-gradient-option.enum';

const COLORSCALE_MEDIAN = 'median';

@Component({
    selector: 'app-color-scale-settings',
    templateUrl: './color-scale-settings.component.html',
    styleUrls: ['./color-scale-settings.component.scss'],
})

/**
 * Component for the Color Scale settings
 */
export class ColorScaleSettingsComponent extends BaseWidgetSettingComponent<ColorScale> {

    readonly AuxButtonTypeEnum = AuxButtonTypeEnum;
    formatOptions: ExploreSelectOptionGroup[];
    midpointOptions: ExploreSelectOptionGroup[];

    gradientType = GradientEnum.GRADIENTS__THREE_SCALE;
    gradientSelected = this.gradientType[0];

    public threeColorScale = true;
    public isPopoverOpen = false;


    initializeComponent(): void {
        this.initializeFormatOptions();
        this.initializeMidpointTypes();
        this.initializeGradient();
    }

    /**
     * Initializes format types
     */
    private initializeFormatOptions(): void {
        if (this.widgetInput.format === undefined) {
            this.formatOptions = ExploreSelectOptionGroup.createSimpleSelectOptionGroup(Object.values(ColorScaleFormatOption), undefined, ColorScaleFormatOption.THREE_COLOR_SCALE);
        } else {
            this.formatOptions = ExploreSelectOptionGroup.createSimpleSelectOptionGroup(Object.values(ColorScaleFormatOption), undefined, this.widgetInput.format);
        }
    }

    /**
     * Initializes midpoint types
     */
    private initializeMidpointTypes(): void {
        if (this.gradientType === GradientEnum.GRADIENTS__THREE_SCALE) {
            // check for backward compatibility since median is the value saved by default.
            if (this.widgetInput.midpoint === ColorScaleMidpointOption.AUTO_SCALE || this.widgetInput.midpoint.toString() === COLORSCALE_MEDIAN ) {
                this.midpointOptions = ExploreSelectOptionGroup.createSimpleSelectOptionGroup(Object.values(ColorScaleMidpointOption), undefined, ColorScaleMidpointOption.AUTO_SCALE);
            } else {
                this.midpointOptions = ExploreSelectOptionGroup.createSimpleSelectOptionGroup(Object.values(ColorScaleMidpointOption), undefined, this.widgetInput.midpoint);
            }
        }
    }

    /**
     * Initializes gradient
     */
    private initializeGradient(): void {
        this.gradientType = (this.widgetInput.format === ColorScaleFormatOption.THREE_COLOR_SCALE) ? GradientEnum.GRADIENTS__THREE_SCALE : GradientEnum.GRADIENTS__TWO_SCALE;
        this.threeColorScale = this.gradientType === GradientEnum.GRADIENTS__THREE_SCALE;

        if (this.widgetInput.colors){
            this.gradientSelected = GradientEnum.parseEnum(this.widgetInput.colors);
        } else {
            this.gradientSelected = this.gradientType[0];
        }
    }

    onFormatChanged(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        this.widgetInput.format = (event.detail.value as AuxSelectOption).value;
        if (this.widgetInput.format === ColorScaleFormatOption.THREE_COLOR_SCALE) {
            this.threeColorScale = true;
            this.gradientType = GradientEnum.GRADIENTS__THREE_SCALE;
            this.gradientSelected = this.gradientType[1];
            this.widgetInput.colors = ColorScaleGradientOption.RED_TO_GREEN;
        } else {
            this.threeColorScale = false;
            this.gradientType = GradientEnum.GRADIENTS__TWO_SCALE;
            this.gradientSelected = this.gradientType[0];
            this.widgetInput.colors = ColorScaleGradientOption.BLUE;
        }
    }

    onMidpointChanged(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        this.widgetInput.midpoint = (event.detail.value as AuxSelectOption).value;
    }

    onGradientChanged(gradient: GradientEnum): void {
        this.gradientSelected = gradient;
        this.widgetInput.colors =  gradient.colorOption;
    }
}
