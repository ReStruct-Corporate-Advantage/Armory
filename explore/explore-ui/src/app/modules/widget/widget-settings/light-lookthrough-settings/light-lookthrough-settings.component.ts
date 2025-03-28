import {AuxCheckboxChangedDetailInterface} from '@blk/aladdin-angular-components';
import {Component} from '@angular/core';
import {BaseWidgetSettingComponent} from '@blk/explore-ui-column-option';
import {LightLookthrough} from '@models/lookthrough/light-lookthrough.model';

@Component({
    selector: 'app-light-lookthrough-settings',
    templateUrl: './light-lookthrough-settings.component.html',
    styleUrls: ['./light-lookthrough-settings.component.scss']
})
/**
 * Component to enable light lookthrough
 */
export class LightLookthroughSettingsComponent extends BaseWidgetSettingComponent<LightLookthrough> {

    isEnabled: boolean;

    /**
     * Performs required initialization
     * ngOnInit is implemented by the BaseWidgetSettingComponent
     */
    initializeComponent(): void {
        this.isEnabled = this.widgetInput.isEnabled;
    }

    /**
     * Method called when checkbox is checked or unchecked
     */
    onCheckBoxChanged(event: CustomEvent<AuxCheckboxChangedDetailInterface>) {
        this.widgetInput.isEnabled = event.detail.value.checked;
        this.isEnabled = this.widgetInput.isEnabled;
    }

}
