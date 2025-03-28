import {Component} from '@angular/core';
import {BaseWidgetSettingComponent} from '@blk/explore-ui-column-option';
import {OverrideDateSortByOldest} from '@models/widget/inputs/override-date-sort-by-oldest.model';

@Component({
    selector: 'app-override-date-sort-by-oldest-settings',
    templateUrl: './override-date-sort-by-oldest-settings.component.html'
})
export class OverrideDateSortByOldestSettingsComponent extends BaseWidgetSettingComponent<OverrideDateSortByOldest> {

    initializeComponent(): void {
        // no implementation required
    }
}
