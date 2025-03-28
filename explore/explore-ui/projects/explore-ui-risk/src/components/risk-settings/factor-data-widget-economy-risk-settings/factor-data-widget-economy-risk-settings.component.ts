import {Component, EventEmitter, Input , Output} from '@angular/core';
import {EconomyRiskSettingsComponent} from '../../economy-risk-settings/economy-risk-settings.component';
import {BehaviorSubject} from 'rxjs';

/**
 * Factor Data Widget Economy Risk Settings used in RiskSettingsComponent
 * rendered by FactorDataRiskSettingsComponent ( Factor Data Widget Risk Settings Tab)
 */
@Component({
    selector: 'explore-risk-factor-data-widget-economy-risk-settings',
    templateUrl: './factor-data-widget-economy-risk-settings.component.html',
    styleUrls: ['./factor-data-widget-economy-risk-settings.component.scss']
})
export class FactorDataWidgetEconomyRiskSettingsComponent extends EconomyRiskSettingsComponent {

    readonly CLASS_PADDING_TOP_16 = 'padding-top-16';
    readonly CLASS_WIDTH_AUTO = 'width-auto';
    readonly CLASS_WIDTH_460PX = 'width-460px';
    readonly CLASS_FLOAT_NONE = 'float-none';
    readonly CLASS_FLOAT_RIGHT = 'float-right';

    @Input() hideEconomyDate = false;
    @Input() isColumnOption = false;
    @Input() editFactorSettings = false;
    @Input() isRiskSettingChanged$: BehaviorSubject<boolean>;
    @Output() resetRiskSettings$ = new EventEmitter<void>();

    classNameWeighingSchemeLabel: string;
    classNamePeriodHalfLifeDiv: string;
    classNameHalfLifeDiv: string;

    /**
     * Initializes the component
     */
    protected initializeComponent(): void {
        this.hideEconomyDate = this.isColumnOption ? true : this.hideEconomyDate;
        this.classNameWeighingSchemeLabel = !this.hideEconomyDate ? this.CLASS_PADDING_TOP_16 : '';
        this.classNamePeriodHalfLifeDiv = this.isColumnOption && !this.editFactorSettings ? this.CLASS_WIDTH_AUTO : this.CLASS_WIDTH_460PX;
        this.classNameHalfLifeDiv = this.isColumnOption && !this.editFactorSettings ? this.CLASS_FLOAT_NONE : this.CLASS_FLOAT_RIGHT;
    }

    resetRiskSettings(): void {
        this.resetRiskSettings$.emit();
    }

    isDisabledResetButton(): boolean {
        return this.isRiskSettingChanged$ ? !this.isRiskSettingChanged$.getValue() : true;
    }
}
