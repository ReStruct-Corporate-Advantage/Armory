import {Component} from '@angular/core';
import {AuxRadioInterface} from '@blk/aladdin-angular-components';
import {AbsoluteValueSetting} from '@models/widget/inputs/chart-settings/absolute-value-setting.model';
import {BaseWidgetSettingComponent} from '@blk/explore-ui-column-option';

@Component({
    selector: 'app-absolute-value-settings',
    templateUrl: './absolute-value-settings.component.html'
})
/**
 * Component class to control AbsoluteValueSetting for a Tree Map widget
 */
export class AbsoluteValueSettingsComponent extends BaseWidgetSettingComponent<AbsoluteValueSetting> {
    treatAsOptions: AuxRadioInterface[] = [];

    /**
     * Performs required initialization
     * ngOnInit is implemented by the BaseWidgetSettingComponent
     */
    initializeComponent(): void {
        this.initializeTreatAsOptions();
    }

    /**
     * Callback to update the AbsoluteValueSetting with what the user selected
     */
    onRadioGroupChanged(option: any): void {
        this.widgetInput.useAbsoluteValue = option.eventData;
    }

    /**
     * Initialize the absolute value setting options
     */
    initializeTreatAsOptions(): void {
        this.treatAsOptions = [
            {
                label: 'Treat as zero',
                eventData: false,
                checked: !this.widgetInput.useAbsoluteValue
            },
            {
                label: 'Treat as absolute value',
                eventData: true,
                checked: this.widgetInput.useAbsoluteValue === true
            }
        ];
    }
}
