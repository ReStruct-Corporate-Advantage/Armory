import {Component, OnInit} from '@angular/core';
import {BaseWidgetSettingComponent} from '@blk/explore-ui-column-option';
import {ShowSectorLevelDataOnlyModel} from '@models/widget/inputs/show-sector-level-data-only.model';
import {AuxRadioInterface} from '@blk/aladdin-angular-components';

/**
 * Widget setting component to show only sector-level data (or to see Security Level data)
 */
@Component({
    selector: 'app-show-sector-level-data-only-settings',
    templateUrl: './show-sector-level-data-only-settings.component.html',
    styleUrls: ['./show-sector-level-data-only-settings.component.scss']
})
export class ShowSectorLevelDataOnlySettingsComponent extends BaseWidgetSettingComponent<ShowSectorLevelDataOnlyModel> implements OnInit {
    showSecurityLevelDataOptions: AuxRadioInterface[];

    initializeComponent(): void {
        // no implementation required
    }

    ngOnInit(): void {
        super.ngOnInit();
        // The options are framed as "Show Security Level Data"
        // But the request param is framed as isSectorView
        // Hence, the flags are reversed
        this.showSecurityLevelDataOptions = [
            {
                label: 'Yes',
                eventData: true,
                checked: !this.widgetInput.isSectorView
            },
            {
                label: 'No',
                eventData: false,
                checked: this.widgetInput.isSectorView
            }
        ];
    }

    onShowSecurityLevelDataOptionChanged(option: AuxRadioInterface): void {
        this.widgetInput.isSectorView = !option.eventData;
    }
}
