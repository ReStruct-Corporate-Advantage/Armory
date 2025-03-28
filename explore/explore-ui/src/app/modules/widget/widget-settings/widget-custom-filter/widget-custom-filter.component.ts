import {Component} from '@angular/core';
import {FavoriteConstants} from '@constants/favorite.constants';
import {BaseWidgetSettingComponent} from '@blk/explore-ui-column-option';
import {CustomFilter, NormalizedFlag} from '@blk/explore-ui-breakdown';

@Component({
    selector: 'app-widget-custom-filter',
    templateUrl: './widget-custom-filter.component.html',
    styleUrls: ['./widget-custom-filter.component.scss']
})
export class WidgetCustomFilterComponent extends BaseWidgetSettingComponent<CustomFilter> {

    filter: CustomFilter;
    normalizedFlag: NormalizedFlag;

    /**
     * Initialize filter for widget-setting
     */
    initializeComponent(): void {
        this.filter = this.widgetInput;
        this.normalizedFlag = this.getInput(FavoriteConstants.NORMALIZED_FLAG) as NormalizedFlag;
    }

    /**
     * updated normalized flag value coming from custom filter component
     */
    updateNormalizedCheckbox(flagValue: boolean): void {
        this.normalizedFlag.data = flagValue;
    }
}
