import {Component, OnInit, Input, ViewChild, Output, EventEmitter} from '@angular/core';
import {LtSecurityProxyTypes} from '../models/lt-security-types/lt-security-proxy-types.model';
import {LtSecurityTypes} from '../models/lt-security-types/lt-security-types.model';
import {ExploreCheckbox, CommonUtils, ExploreRadioButton} from '@blk/explore-ui-core';
import {isEmpty, isNil} from 'lodash';
import {
    AuxPicklist,
    AuxCheckboxGroupChangedDetailInterface,
    AuxToggleChangedDetailInterface,
    AuxRadioInterface,
    AuxRadioGroupChangedDetailInterface,
    AuxTreeListDataInterface,
    AuxAdvancedTreeListInterface,
    AuxRadioGroup,
} from '@blk/aladdin-angular-components';
import {LookThroughSettings} from '../models/lookthrough-settings/look-through-settings.model';
import {LookthroughConstants} from '../constants/lookthrough.constants';
import {LookThroughSettingsChangeType} from '../enums/look-through-settings-change-type.enum';

@Component({
    selector: 'explore-look-through-settings',
    templateUrl: './explore-look-through-settings.component.html',
    styleUrls: ['./explore-look-through-settings.component.scss']
})
export class LookThroughSettingsComponent implements OnInit {
    readonly LT_WITH_SMALL_L = 'Enable look-through';

    @ViewChild('auxPickList', {static: false}) auxPickList: AuxPicklist;
    @ViewChild('radioGroup', {static: false}) radioGroup: AuxRadioGroup;

    @Input() availableSecurityTypes: LtSecurityTypes[];  // all available security types
    @Input() availableProxyTypes: LtSecurityProxyTypes[];  // all available proxy types
    @Input() lookthroughSettings: LookThroughSettings;
    @Output() lookthroughChangeTypeEmitter: EventEmitter<LookThroughSettingsChangeType> = new EventEmitter<LookThroughSettingsChangeType>();
    @Output() lookthroughSettingsChange: EventEmitter<LookThroughSettings> = new EventEmitter<LookThroughSettings>();
    lookThroughEnabled = false;
    availableSecurities: ExploreCheckbox[] = [];
    lookthroughEnableRadioLabels: AuxRadioInterface[] = [];
    availableProxies: AuxTreeListDataInterface[] = [];
    selectedProxies: AuxTreeListDataInterface[] = [];
    availableProxiesAdv: AuxAdvancedTreeListInterface[] = [];
    selectedProxiesAdv: AuxAdvancedTreeListInterface[] = [];
    enabledElements = true;

    ngOnInit(): void {
        this.lookthroughEnableRadioLabels.push(new ExploreRadioButton(LookthroughConstants.PORTFOLIO, this.lookthroughSettings.isLookThroughEnabled && !this.lookthroughSettings.isBenchLookThroughEnabled, false));
        this.lookthroughEnableRadioLabels.push(new ExploreRadioButton(LookthroughConstants.PORTFOLIO_BENCHMARK, this.lookthroughSettings.isLookThroughEnabled && this.lookthroughSettings.isBenchLookThroughEnabled, false));
        this.lookthroughEnableRadioLabels.push(new ExploreRadioButton(LookthroughConstants.BENCHMARK, !this.lookthroughSettings.isLookThroughEnabled && this.lookthroughSettings.isBenchLookThroughEnabled, false));
        if (this.lookthroughSettings && !isEmpty(this.lookthroughSettings.ltSecurityTypes)) {
            this.availableSecurityTypes.forEach(securityType => securityType.selected = this.lookthroughSettings.ltSecurityTypes.indexOf(securityType.name) !== -1);
        }
        this.availableSecurities = this.availableSecurityTypes
            .map(availableSecurityType => new ExploreCheckbox(CommonUtils.toSentenceCase(availableSecurityType.description), availableSecurityType.selected, false));
        this.availableProxies = this.lookthroughSettings && !isNil(this.lookthroughSettings.ltProxies)
            ? this.availableProxyTypes.filter(availableProxy => !this.lookthroughSettings.ltProxies.includes(availableProxy.name))
                .map(proxy => {
                    return {
                        header: proxy.description,
                        eventData: proxy.name
                    };
                })
            : this.availableProxyTypes.filter(proxy => !proxy.selected)
                .map(selectedProxyType => {
                    return {
                        header: selectedProxyType.description,
                        eventData: selectedProxyType.name
                    };
                });
        this.selectedProxies = this.lookthroughSettings && !isNil(this.lookthroughSettings.ltProxies)
            ? this.lookthroughSettings.ltProxies
                .map(ltProxy => {
                    const selectedProxy = this.availableProxyTypes.filter(availableProxy => availableProxy.name === ltProxy)[0];
                    return {
                        header: selectedProxy.description,
                        eventData: selectedProxy.name
                    };
                })
            : this.availableProxyTypes.filter(proxy => proxy.selected)
                .map(selectedProxyType => {
                    return {
                        header: selectedProxyType.description,
                        eventData: selectedProxyType.name
                    };
                });
        CommonUtils.initializeDataForAdvTreeList(this.availableProxies, this.availableProxiesAdv);
        CommonUtils.initializeDataForAdvTreeList(this.selectedProxies, this.selectedProxiesAdv);
        this.lookThroughEnabled = this.enabledElements = this.lookthroughSettings.isAnyLookthroughEnabled();
    }

    /**
     * Event handler for onCheckboxChanged for look-through inheritance
     */
    onLookthroughInheritanceChanged(event: CustomEvent<AuxToggleChangedDetailInterface>): void {
        if (!event) {
            return;
        }

        this.lookthroughSettings.isLookThroughInheritanceEnabled = event.detail.value.checked;
        this.lookthroughSettingsChange.emit(this.lookthroughSettings);
    }

    /**
     * Event handler for onCheckboxGroupChanged for look-through enable flags
     */
    onLookthroughEnableGroupChanged(event: CustomEvent<AuxRadioGroupChangedDetailInterface>): void {
        if (!event) {
            return;
        }
        this.setLookThroughSettings(event.detail.value.uid);
        this.lookthroughChangeTypeEmitter.emit(LookThroughSettingsChangeType.ENABLED_TYPE);
        this.enabledElements = this.lookthroughSettings.isAnyLookthroughEnabled();
        this.lookthroughSettingsChange.emit(this.lookthroughSettings);
    }

    onLookThroughEnabled(event: CustomEvent<AuxToggleChangedDetailInterface>): void {
        if (!event) {
            return;
        }
        const checkedValue = event.detail.value.checked;
        if (checkedValue === false) {
            this.lookthroughSettings.isLookThroughEnabled = false;
            this.lookthroughSettings.isBenchLookThroughEnabled = false;
            this.lookthroughSettingsChange.emit(this.lookthroughSettings);
        }
        this.lookThroughEnabled = checkedValue;
        if (checkedValue) {
            this.reassignCheckboxValue(this.radioGroup.data.find(val => val.checked === true));
        }
        if (checkedValue) {
            this.lookthroughChangeTypeEmitter.emit(LookThroughSettingsChangeType.LOOKTHROUGH_ENABLED);
        } else {
            this.lookthroughChangeTypeEmitter.emit(LookThroughSettingsChangeType.LOOKTHROUGH_DISABLED);
        }
        this.enabledElements = checkedValue && this.lookthroughSettings.isAnyLookthroughEnabled();
        this.lookthroughSettingsChange.emit(this.lookthroughSettings);
    }

    /**
     * Event handler for onCheckboxGroupChanged for security types
     */
    onSecurityTypeGroupChanged(event: CustomEvent<AuxCheckboxGroupChangedDetailInterface>): void {
        if (!event) {
            return;
        }

        this.lookthroughSettings.ltSecurityTypes = this.availableSecurityTypes
            .filter(securityType =>
                event.detail.value
                    .filter(value => value.checked)
                    .map(value => value.label)
                    .indexOf(CommonUtils.toSentenceCase(securityType.description)) !== -1
            )
            .map(securityType => securityType.name);

        this.lookthroughChangeTypeEmitter.emit(LookThroughSettingsChangeType.SECURITY_TYPE_CHANGED);
        this.lookthroughSettingsChange.emit(this.lookthroughSettings);
    }

    /**
     * Event handler for updateColumnsList
     */
    updateColumnsList($event) {
        const sourceData = $event.map(val => val.eventData);
        this.lookthroughSettings.ltProxies = this.availableProxyTypes.filter(proxy => !sourceData.includes(proxy.name))
                                             .map(proxy => proxy.name);
    }

    private reassignCheckboxValue(radioValue: any): void {
        if (radioValue == null) {
            return;
        }
        this.setLookThroughSettings(LookthroughConstants.LOOK_THROUGH_GROUP_MAP[radioValue.label]);
    }

    private setLookThroughSettings(id: number): void {
        if (isNil(id)) {
            return;
        }

        if (id === 0) {
            this.lookthroughSettings.isLookThroughEnabled = true;
            this.lookthroughSettings.isBenchLookThroughEnabled = false;
        } else if (id === 1) {
            this.lookthroughSettings.isLookThroughEnabled = true;
            this.lookthroughSettings.isBenchLookThroughEnabled = true;
        } else {
            this.lookthroughSettings.isLookThroughEnabled = false;
            this.lookthroughSettings.isBenchLookThroughEnabled = true;
        }
    }

    onReorder(event: any): void {
        this.lookthroughSettings.ltProxies = event.map(val => val.eventData);
    }
}
