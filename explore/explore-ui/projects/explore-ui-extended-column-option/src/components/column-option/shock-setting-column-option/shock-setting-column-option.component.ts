import {ChangeDetectorRef, Component, Inject, Optional} from '@angular/core';
import {BaseColumnOptionComponent} from '@blk/explore-ui-column-option';
import {AuxTextInputBlurDetailInterface, Validator} from '@blk/aladdin-angular-components';
import {isEmpty, isNil} from 'lodash';
import {FactorDefinitionsService} from '../../../services/factor-definitions.service';
import {takeUntil} from 'rxjs/operators';
import {getImpliedShockUnitEnumValue, ImpliedShockUnitEnum} from '../../../enums/implied-shock-unit.enum';
import {
    NOTIFICATION_SERVICE_TOKEN,
    NotificationServiceInterface,
} from '@blk/explore-ui-core';
import {ShockSettingColumnOption} from '../../../models/column-option/shock-setting-column-option.model';
import {finalize} from 'rxjs';

@Component({
  selector: 'explore-extended-shock-setting-column-option',
  templateUrl: './shock-setting-column-option.component.html',
  styleUrls: ['./shock-setting-column-option.component.scss']
})
/**
 * Stress scenario shock settings column option
 */
export class ShockSettingColumnOptionComponent extends BaseColumnOptionComponent<ShockSettingColumnOption> {

    public static readonly OPTION_KEY = 'shockSettingColumnOption';
    private readonly SHOCK_VALUE = 'Shock value';
    private readonly STD_DEV = 'Std Dev';

    validator: Validator[];

    shock: string;
    shockUnit = '';

    constructor(protected factorDefinitionsService: FactorDefinitionsService, @Optional() @Inject(NOTIFICATION_SERVICE_TOKEN) protected notificationService: NotificationServiceInterface, private changeDetectorRef: ChangeDetectorRef) {
        super();
    }

    /**
     * Get the type of option value this component should create.
     */
    protected getOptionValueConfigType(): string {
        return ShockSettingColumnOption.CONFIG_TYPE;
    }

    /**
     * Performs the required initialization.
     */
    protected initializeComponent(): void {
        this.updateShock(this.optionValue.shock);
        this.validator = [{
            validate: (value: number) => {
                return isEmpty(value) || !isNaN(value);
            },
            errorMessage: 'Invalid input'
        }];
        // Update the factor shock unit label
        this.setShockUnitLabel();

        // Subscribe to scenario updated subject to update the factor shock unit label
        this.optionValue.scenario.scenarioUpdated$
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: () => {
                    this.setShockUnitLabel();
                },
            });
    }

    private setShockUnitLabel(): void {
        const impliedShockUnit = getImpliedShockUnitEnumValue(this.optionValue.scenario.impliedShockScenario.impliedShockUnit, this.optionValue.scenario.impliedShockScenario.dxsShockUnit);

        if (impliedShockUnit === ImpliedShockUnitEnum.NUMBER_OF_STD_DEVS) {
            this.shockUnit = this.STD_DEV;
            return;
        }

        this.factorDefinitionsService.fetchFactorDefinitionsForFactorShocks$([ this.column.columnTag ], impliedShockUnit)
            .pipe(
                takeUntil(this.ngUnsubscribe),
                finalize(() => {
                    this.changeDetectorRef.markForCheck();
                })
            )
            .subscribe({
                next: (factors: { colTag: string, shockUnit: string }[]) => {
                    this.shockUnit = factors[0].shockUnit;
                },
                error: () => {
                    this.shockUnit = this.SHOCK_VALUE;
                    this.notificationService?.error('Unable to fetch shock unit for factor: ' + this.column.columnTag);
                },
            });
    }

    onShockValueChanged(ev: CustomEvent<AuxTextInputBlurDetailInterface>): void {
        const value = (ev.detail.srcEvent.target as HTMLAuxTextInputElement).value;
        if (this.validator[0].validate(value)) {
            if (isEmpty(value)) {
                this.optionValue.shock = undefined;
            } else {
                this.updateShock(Number(value));
            }
        }
    }

    private updateShock(value: number): void {
        if (isNil(value)) {
            return;
        }
        this.shock = value.toFixed(2);
        this.optionValue.shock = Number(this.shock);
    }

    onRestrictImpliedShocksChanged(value: string[]): void {
        this.optionValue.restrictImpliedShocks = value;
    }

}
