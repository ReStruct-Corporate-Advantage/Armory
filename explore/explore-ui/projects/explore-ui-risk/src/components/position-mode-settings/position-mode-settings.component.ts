import {Component, Input, OnInit} from '@angular/core';
import {
    AuxRadioInterface,
    AuxRadioGroupChangedDetailInterface
} from '@blk/aladdin-angular-components';
import {isUndefined, isEqual, has} from 'lodash';
import {PositionModeSettings} from '../../models/position-mode-settings/position-mode-settings.model';
import {PositionModeType, PositionModeUtil} from '../../enums/position-mode.enum';


@Component({
    selector: 'position-mode-settings',
    templateUrl: './position-mode-settings.component.html',
    styleUrls: ['./position-mode-settings.component.scss']
})

export class PositionModeSettingsComponent implements OnInit {

    positionModes: AuxRadioInterface[] = [];

    @Input() positionModeSettings: PositionModeSettings;

    positionModeSelection: PositionModeType;

    /**
     * Init hook
     */
    ngOnInit(): void {
        this.positionModeSelection =  isUndefined(this.positionModeSettings.positionModeSelection) ? PositionModeType.AS_OF_W : this.positionModeSettings.positionModeSelection;
        PositionModeUtil.values().forEach(positionMode => {
                            this.positionModes.push(
                            {label: PositionModeUtil.getDisplayName(positionMode), checked: isEqual(positionMode, this.positionModeSelection), eventData: positionMode});
                            });
    }

    onPositionModeChanged(event: CustomEvent<AuxRadioGroupChangedDetailInterface>): void {
        if (!event) {
            return;
        }
        if (has(event.detail, 'value')) {
            this.positionModeSelection = event.detail.value.eventData;
            this.positionModeSettings.positionModeSelection = event.detail.value.eventData;
        }
    }
}

