import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AbstractRiskSettings} from '../../models/abstract-risk-settings.model';
import {CoreRiskConstants} from '../../core-risk.constants';

@Component({
    selector: 'explore-risk-revert-risk-setting',
    templateUrl: './revert-risk-setting.component.html'
})
export class RevertRiskSettingComponent implements OnInit {

    @Input() riskSetting: AbstractRiskSettings;
    // property within the risk setting to revert
    @Input() propertyName: string;

    @Output() resetHandler = new EventEmitter();

    tooltip: string;

    ngOnInit() {
        // some values are undefined by default so we will consider that to be Org Default
        const parentSourceName = this.riskSetting?.parentRiskSettings?.getSourceName(this.propertyName) || CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.ORG_DEFAULT;
        if (!!parentSourceName?.length) {
            const parentSourceDisplayName = CoreRiskConstants.RISK_SETTINGS_HIERARCHY_DISPLAY_NAME[parentSourceName];
            const formattedParentValue = this.riskSetting.getFormattedParentValue(this.propertyName);
            this.tooltip = 'Return to ' + parentSourceDisplayName + (formattedParentValue ? ':' : '');
        }
    }

    callResetHandler = (): void => {
        this.resetHandler.emit();
    }
}
