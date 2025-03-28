import {Component} from '@angular/core';
import {AuxRadioInterface} from '@blk/aladdin-angular-components';
import {SectorModeTypeEnum} from '@enums/sector-mode-type.enum';
import {BaseWidgetSettingComponent} from '@blk/explore-ui-column-option';
import {TopBottomSectoring} from '@models/widget/inputs/top-bottom-sectoring/top-bottom-sectoring.model';
import {AuxCheckboxChangedDetailInterface, AuxRadioChangedDetailInterface} from '@blk/aladdin-angular-components';

/**
 * component to handle top-down sectoring info
 */
@Component({
    selector: 'app-top-bottom-sectoring',
    templateUrl: './top-bottom-sectoring.component.html',
    styleUrls: ['./top-bottom-sectoring.component.scss']
})
export class TopBottomSectoringComponent extends BaseWidgetSettingComponent<TopBottomSectoring> {

    readonly SectorModeTypeEnum = SectorModeTypeEnum;

    sectorModeOptions: AuxRadioInterface[];
    sectorModeType: SectorModeTypeEnum = SectorModeTypeEnum.BOTTOM_UP;
    displayAtGroupNode = false;

    /**
     * initialize
     */
    initializeComponent(): void {
        this.sectorModeType = this.widgetInput.isTopBottomSectoring
            ? SectorModeTypeEnum.TOP_DOWN
            : SectorModeTypeEnum.BOTTOM_UP;

        this.displayAtGroupNode = this.widgetInput.displayAtGroupNode;

        this.sectorModeOptions = [{
            label: SectorModeTypeEnum.BOTTOM_UP,
            eventData: SectorModeTypeEnum.BOTTOM_UP,
            checked: this.sectorModeType === SectorModeTypeEnum.BOTTOM_UP
        }, {
            label: SectorModeTypeEnum.TOP_DOWN,
            eventData: SectorModeTypeEnum.TOP_DOWN,
            checked: this.sectorModeType === SectorModeTypeEnum.TOP_DOWN
        }];
    }

    /**
     * to do when sector mode changes
     */
    onSectorModeChanged(eventData: CustomEvent<AuxRadioChangedDetailInterface>) {
        this.sectorModeType = eventData.detail.value.eventData;
        this.widgetInput.isTopBottomSectoring = this.sectorModeType === SectorModeTypeEnum.TOP_DOWN;
    }

    /**
     * display at group node check toggle
     */
    updateDisplayAtGroupNode(eventData: CustomEvent<AuxCheckboxChangedDetailInterface>) {
        this.displayAtGroupNode = eventData.detail.value.checked;
        this.widgetInput.displayAtGroupNode = this.displayAtGroupNode;
    }
}
