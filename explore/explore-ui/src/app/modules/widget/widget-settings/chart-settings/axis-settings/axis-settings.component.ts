import {Component, Input} from '@angular/core';
import {
    AuxCheckboxChangedDetailInterface,
    AuxInputMaskValueChangedDetailInterface,
    AuxTextInputValueChangedDetailInterface,
    AuxMaskOptionsInterface
} from '@blk/aladdin-angular-components';
import {isEmpty, isNil, isUndefined} from 'lodash';
import {BaseWidgetSettingComponent} from '@blk/explore-ui-column-option';
import {AxisSettings, AxisType} from '@models/widget/inputs/chart-settings/axis-settings.model';
import {SecondaryAxis} from '@models/widget/inputs/chart-settings/secondary-axis.model';
import {ChartWidgetInputConfigType} from '@blk/explore-ui-core';

/**
 * Axis Settings Component for chart widget
 */
@Component({
    selector: 'app-axis-settings',
    templateUrl: './axis-settings.component.html',
    styleUrls: ['./axis-settings.component.scss']
})
export class AxisSettingsComponent extends BaseWidgetSettingComponent<AxisSettings> {
    readonly AxisType = AxisType;
    readonly isNil = isNil;

    @Input() axisType: AxisType;

    axisTitleInputLabel: string;

    secondaryAxisColumn: SecondaryAxis;

    /**
     * maskOptions to allow negative number in minimum and maximum bounds.
     */
    maskOptions: AuxMaskOptionsInterface = {
        mask: Number,
        normalizeZeros: false
    };

    /**
     * initialize
     * ngOnInit is implemented by the BaseWidgetSettingComponent
     */
    initializeComponent(): void {
        // If widgetInput is undefined, instantiate it and set it in inputs map.
        if (isUndefined(this.widgetInput)) {
            this.widgetInput = new AxisSettings();
            this.inputs.set(this.widgetConfigInput.inputName, this.widgetInput);
        }
        this.widgetInput.axisType = this.axisType;
        this.axisTitleInputLabel = this.axisType === AxisType.PRIMARY ? 'Primary axis override' : 'Secondary axis override';

        if (this.axisType === AxisType.SECONDARY) {
            this.secondaryAxisColumn = this.inputs.get(ChartWidgetInputConfigType.SECONDARY_AXIS_COLUMN) as SecondaryAxis;
        }
    }

    onAxisTitleChanged(event: CustomEvent<AuxTextInputValueChangedDetailInterface>): void {
        this.widgetInput.axisTitle = event.detail.value;
    }

    onHideAxisTitleChanged(event: CustomEvent<AuxCheckboxChangedDetailInterface>): void {
        this.widgetInput.hideAxisTitle = event.detail.value.checked;
    }

    onYIntervalChanged(event: CustomEvent<AuxInputMaskValueChangedDetailInterface>): void {
        this.widgetInput.yInterval = isEmpty(event.detail.value) ? null : +event.detail.value;
    }

    /**
     * On blur event, yUpperBound value must be greater than or equal to the yLowerBound for better ux.
     * force yUpperBound to be yLowerBound.
     */
    onYLowerBoundBlur(event: CustomEvent<AuxInputMaskValueChangedDetailInterface>): void {
        this.widgetInput.yLowerBound = isEmpty(event.detail.value) ? null : Number(event.detail.value);
        if (isNil(this.widgetInput.yLowerBound) || isNil(this.widgetInput.yUpperBound)) {
            return;
        }
        if (this.widgetInput.yUpperBound < this.widgetInput.yLowerBound) {
            this.widgetInput.yUpperBound = this.widgetInput.yLowerBound;
        }
    }

    /**
     * On blur event, yUpperBound value must be greater than or equal to the yLowerBound for better ux.
     * force yLowerBound to be yUpperBound.
     */
    onYUpperBoundBlur(event: CustomEvent<AuxInputMaskValueChangedDetailInterface>): void {
        this.widgetInput.yUpperBound = isEmpty(event.detail.value) ? null : Number(event.detail.value);
        if (isNil(this.widgetInput.yLowerBound) || isNil(this.widgetInput.yUpperBound)) {
            return;
        }
        if (this.widgetInput.yUpperBound < this.widgetInput.yLowerBound) {
            this.widgetInput.yLowerBound = this.widgetInput.yUpperBound;
        }
    }

    /**
     * callback passed to core-undo-button component
     */
    resetYLowerBound = () => {
        this.widgetInput.yLowerBound = null;
    };

    /**
     * callback passed to core-undo-button component
     */
    resetYUpperBound = () => {
        this.widgetInput.yUpperBound = null;
    };

    /**
     * callback passed to core-undo-button component
     */
    resetYInterval = () => {
        this.widgetInput.yInterval = null;
    };
}
