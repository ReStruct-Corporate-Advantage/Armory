import { ComponentFixture, TestBed } from '@angular/core/testing';

import { McvarRiskSettingsComponent } from './mcvar-risk-settings.component';
import { MCVaRRiskSettingsModel } from '../../models/mcvar-risk-settings/mcvar-risk-settings.model';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {RiskSettings} from '../../models/risk-settings/risk-settings.model';
import {BehaviorSubject} from 'rxjs';
import {AuxCheckboxChangedDetailInterface} from '@blk/aladdin-angular-components';
import {CoreRiskConstants} from '../../core-risk.constants';
import {
    AuxNumericStepperValueChangedDetailInterface,
    AuxSelectSelectionChangedDetailInterface
} from '@blk/aladdin-angular-components';

describe('McvarRiskSettingsComponent', () => {
    let component: McvarRiskSettingsComponent;
    let fixture: ComponentFixture<McvarRiskSettingsComponent>;
    const updateRiskSettingsFlag = new BehaviorSubject<boolean>(false);

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [McvarRiskSettingsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(McvarRiskSettingsComponent);
        component = fixture.componentInstance;
        component.riskSettingsModel = new RiskSettings();
        component.isRiskSettingChanged$ = updateRiskSettingsFlag;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {

        it('With empty MCVaR risk settings', () => {

            expect(component.distributionTypeSelectOptionGroup.length).toBe(1);
            expect(component.distributionTypeSelectOptionGroup[0].values.length).toBe(2);
            expect(component.distributionTypeSelectOptionGroup[0].values[0].isSelected).toBeTruthy();

            expect(component.pricingTypeSelectOptionGroup.length).toBe(1);
            expect(component.pricingTypeSelectOptionGroup[0].values.length).toBe(2);
            expect(component.pricingTypeSelectOptionGroup[0].values[0].isSelected).toBeTruthy();

            expect(component.samples).toBe(MCVaRRiskSettingsModel.DEFAULT_SAMPLES);
            expect(component.seed).toBe(MCVaRRiskSettingsModel.DEFAULT_SEED);

            expect(component.includeTimeReturn).toBeTruthy();
            expect(component.useImportanceSampling).toBeFalsy();
        });

        it('With given MCVaR risk settings', () => {
            const mcvarRiskSettings = new MCVaRRiskSettingsModel();
            mcvarRiskSettings.distributionType = 'T';
            mcvarRiskSettings.pricingType = 'DELTA_GAMMA';
            mcvarRiskSettings.samples = 8000;
            mcvarRiskSettings.seed = 100;
            mcvarRiskSettings.includeTimeReturn = false;
            mcvarRiskSettings.useImportanceSampling = false;
            const riskSettings = new RiskSettings();
            riskSettings.mcvarRiskSettings = mcvarRiskSettings;
            component.riskSettingsModel = riskSettings;
            fixture.detectChanges();
            component.ngOnInit();

            expect(component).toBeTruthy();
            expect(component.distributionTypeSelectOptionGroup.length).toBe(1);
            expect(component.distributionTypeSelectOptionGroup[0].values.length).toBe(2);
            expect(component.distributionTypeSelectOptionGroup[0].values[1].isSelected).toBeTruthy();

            expect(component.pricingTypeSelectOptionGroup.length).toBe(1);
            expect(component.pricingTypeSelectOptionGroup[0].values.length).toBe(2);
            expect(component.pricingTypeSelectOptionGroup[0].values[1].isSelected).toBeTruthy();

            expect(component.samples).toBe(8000);
            expect(component.seed).toBe(100);

            expect(component.includeTimeReturn).toBeFalsy();
            expect(component.useImportanceSampling).toBeFalsy();
        });
    });

    describe('test onUseImportanceSamplingChange', () => {
        it('checked false', () => {
            const checkboxEventDetail = {
                detail: {
                    value: {checked: false}
                }
            } as CustomEvent<AuxCheckboxChangedDetailInterface>;
            component.onUseImportanceSamplingChange(checkboxEventDetail);
            expect(component.useImportanceSampling).toBeFalsy();
        });

        it('checked true', () => {
            const checkboxEventDetail = {
                detail: {
                    value: {checked: true}
                }
            } as CustomEvent<AuxCheckboxChangedDetailInterface>;
            component.onUseImportanceSamplingChange(checkboxEventDetail);
            expect(component.mcvarRiskSettingsModel.useImportanceSampling).toBeTruthy();
        });
    });

    describe('test onDistributionTypeSelectionChange', () => {
        it('default value', () => {
            const selectSelectionChangedDetail = {
                detail: {
                    value: {
                        value: CoreRiskConstants.MCVAR_DISTRIBUTION_TYPES[0].value
                    }
                }
            } as CustomEvent<AuxSelectSelectionChangedDetailInterface>;
            component.onDistributionTypeSelectionChange(selectSelectionChangedDetail);
            expect(component.mcvarRiskSettingsModel.distributionType).toBe(CoreRiskConstants.MCVAR_DISTRIBUTION_TYPES[0].value);
        });

        it('other than default value', () => {
            const selectSelectionChangedDetail = {
                detail: {
                    value: {
                        value: CoreRiskConstants.MCVAR_DISTRIBUTION_TYPES[1].value
                    }
                }
            } as CustomEvent<AuxSelectSelectionChangedDetailInterface>;
            component.onDistributionTypeSelectionChange(selectSelectionChangedDetail);
            expect(component.mcvarRiskSettingsModel.distributionType).toBe(CoreRiskConstants.MCVAR_DISTRIBUTION_TYPES[1].value);
        });
    });

    describe('test onSamplesValueChange', () => {
        it('default value', () => {
            const numericStepperValueChangedDetail = {
                target: {
                    value: MCVaRRiskSettingsModel.DEFAULT_SAMPLES
                }
            } as unknown as KeyboardEvent;
            component.onSamplesValueChange(numericStepperValueChangedDetail);
            expect(component.mcvarRiskSettingsModel.samples).toBeUndefined();
        });

        it('other than default value', () => {
            const numericStepperValueChangedDetail = {
                target: {
                    value: 50000
                }
            } as unknown as KeyboardEvent;
            component.onSamplesValueChange(numericStepperValueChangedDetail);
            expect(component.mcvarRiskSettingsModel.samples).toBe(50000);
        });

        it('NaN value', () => {
            const numericStepperValueChangedDetail = {
                target: {
                    value: NaN
                }
            } as unknown as KeyboardEvent;
            component.onSamplesValueChange(numericStepperValueChangedDetail);
            expect(component.mcvarRiskSettingsModel.samples).toBeUndefined();
        });

        it('0 value', () => {
            const numericStepperValueChangedDetail = {
                target: {
                    value: 0
                }
            } as unknown as KeyboardEvent;
            component.onSamplesValueChange(numericStepperValueChangedDetail);
            expect(component.mcvarRiskSettingsModel.samples).toBeUndefined();
        });

        it('greater than MAX value', () => {
            const numericStepperValueChangedDetail = {
                target: {
                    value: 999999
                }
            } as unknown as KeyboardEvent;
            component.onSamplesValueChange(numericStepperValueChangedDetail);
            expect(component.mcvarRiskSettingsModel.samples).toBeUndefined();
        });
    });

    describe('test onSeedValueChange', () => {
        it('default value', () => {
            const numericStepperValueChangedDetail = {
                detail: {
                    value: MCVaRRiskSettingsModel.DEFAULT_SEED
                }
            } as CustomEvent<AuxNumericStepperValueChangedDetailInterface>;
            component.onSeedValueChange(numericStepperValueChangedDetail);
            expect(component.mcvarRiskSettingsModel.seed).toBeUndefined();
        });

        it('other than default value', () => {
            const numericStepperValueChangedDetail = {
                detail: {
                    value: 50000
                }
            } as CustomEvent<AuxNumericStepperValueChangedDetailInterface>;
            component.onSeedValueChange(numericStepperValueChangedDetail);
            expect(component.mcvarRiskSettingsModel.seed).toBe(50000);
        });
    });

    describe('test onPricingTypeOptionChange', () => {
        it('default value', () => {
            const selectSelectionChangedDetail = {
                detail: {
                    value: {
                        value: CoreRiskConstants.MCVAR_PRICING_TYPES[0].value
                    }
                }
            } as CustomEvent<AuxSelectSelectionChangedDetailInterface>;
            component.onPricingTypeOptionChange(selectSelectionChangedDetail);
            expect(component.mcvarRiskSettingsModel.pricingType).toBeUndefined();
        });

        it('other than default value', () => {
            const selectSelectionChangedDetail = {
                detail: {
                    value: {
                        value: CoreRiskConstants.MCVAR_PRICING_TYPES[1].value
                    }
                }
            } as CustomEvent<AuxSelectSelectionChangedDetailInterface>;
            component.onPricingTypeOptionChange(selectSelectionChangedDetail);
            expect(component.mcvarRiskSettingsModel.pricingType).toBe(CoreRiskConstants.MCVAR_PRICING_TYPES[1].value);
        });
    });

    describe('test onIncludeTimeReturnChange', () => {
        it('checked false', () => {
            const checkboxEventDetail = {
                detail: {
                    value: {checked: false}
                }
            } as CustomEvent<AuxCheckboxChangedDetailInterface>;
            component.onIncludeTimeReturnChange(checkboxEventDetail);
            expect(component.mcvarRiskSettingsModel.includeTimeReturn).toBeFalsy();
        });

        it('checked true', () => {
            const checkboxEventDetail = {
                detail: {
                    value: {checked: true}
                }
            } as CustomEvent<AuxCheckboxChangedDetailInterface>;
            component.onIncludeTimeReturnChange(checkboxEventDetail);
            expect(component.mcvarRiskSettingsModel.includeTimeReturn).toBeUndefined();
        });
    });

    describe('test onIdioSyncraticCorrelationOptionChange', () => {
        it('default value', () => {
            const selectSelectionChangedDetail = {
                detail: {
                    value: {
                        value: CoreRiskConstants.MCVAR_IDIO_CALCS[0].value
                    }
                }
            } as CustomEvent<AuxSelectSelectionChangedDetailInterface>;
            component.onIdioSyncraticCorrelationOptionChange(selectSelectionChangedDetail);
            expect(component.mcvarRiskSettingsModel.idiosyncraticCorrelation).toBeUndefined();
        });

        it('other than default value', () => {
            const selectSelectionChangedDetail = {
                detail: {
                    value: {
                        value: CoreRiskConstants.MCVAR_IDIO_CALCS[1].value
                    }
                }
            } as CustomEvent<AuxSelectSelectionChangedDetailInterface>;
            component.onIdioSyncraticCorrelationOptionChange(selectSelectionChangedDetail);
            expect(component.mcvarRiskSettingsModel.idiosyncraticCorrelation).toBe(CoreRiskConstants.MCVAR_IDIO_CALCS[1].value);
        });
    });
});
