import {CoreTestUtils} from '../../../../test-utils/core-test.utils';
import {AttributionSettings} from '../../../models/attribution-settings/attribution-settings.model';
import {AttributionFactorViewComponent} from './attribution-factor-view.component';
import {ChangeDetectorRef, SimpleChange, SimpleChanges} from '@angular/core';
import {fakeAsync, tick} from '@angular/core/testing';

describe('AttributionFactorViewComponent', () => {
    const changeDetectorRef: ChangeDetectorRef = {
        markForCheck: jest.fn(),
    } as unknown as ChangeDetectorRef;
    const component: AttributionFactorViewComponent = new AttributionFactorViewComponent(changeDetectorRef);


    beforeAll(() => {
        CoreTestUtils.initDefinitions();

        const factorsList: any = [{
            'value': 'rf_contr',
            'label': 'Risk Free Contribution',
            'assetClassList': ['FI_MANDATE'],
            'factorGroup': '',
            'factorGroupList': ['Holdings based factors', 'Parametric'],
            'activeColumnTag': 'active_rf_contr'
        }, {
            'value': 'rldn_contr',
            'label': 'Rolldown Contribution',
            'assetClassList': ['FI_MANDATE'],
            'factorGroup': '',
            'factorGroupList': ['Holdings based factors', 'Parametric'],
            'activeColumnTag': 'active_rldn_contr'
        }, {
            'value': 'oas_chg_contr',
            'label': 'OAS Change Contribution',
            'assetClassList': ['FI_MANDATE'],
            'factorGroup': '',
            'factorGroupList': ['Holdings based factors', 'Parametric'],
            'activeColumnTag': 'active_oas_chg_contr'
        }, {
            'value': 'oas_lev_contr',
            'label': 'OAS Level Contribution',
            'assetClassList': ['FI_MANDATE'],
            'factorGroup': '',
            'factorGroupList': ['Holdings based factors', 'Parametric'],
            'activeColumnTag': 'active_oas_lev_contr'
        }, {
            'value': 'mtb_dur_contr',
            'label': 'Mtg/Tsy Duration Contribution',
            'assetClassList': ['FI_MANDATE'],
            'factorGroup': '',
            'factorGroupList': ['Holdings based factors', 'Parametric'],
            'activeColumnTag': 'active_mtb_dur_contr'
        }, {
            'value': 'nvoldur_cont',
            'label': 'Volatility Duration Contribution',
            'assetClassList': ['FI_MANDATE'],
            'factorGroup': '',
            'factorGroupList': ['Holdings based factors', 'Parametric'],
            'activeColumnTag': 'nvoldur_cont'
        }, {
            'value': 'vol_cvx_contr',
            'label': 'Vol Convexity Contribution',
            'assetClassList': ['FI_MANDATE'],
            'factorGroup': '',
            'factorGroupList': ['Holdings based factors', 'Parametric'],
            'activeColumnTag': 'vol_cvx_contr'
        }, {
            'value': 'delta_contr',
            'label': 'Convert Delta Contribution',
            'assetClassList': ['FI_MANDATE'],
            'factorGroup': '',
            'factorGroupList': ['Holdings based factors', 'Parametric'],
            'activeColumnTag': 'active_delta_contr'
        }, {
            'value': 'infl_contr',
            'label': 'Inflation Duration Contribution',
            'assetClassList': ['FI_MANDATE'],
            'factorGroup': '',
            'factorGroupList': ['Holdings based factors', 'Parametric'],
            'activeColumnTag': 'active_infl_contr'
        }, {
            'value': 'dur_contr',
            'label': 'Duration Contribution',
            'assetClassList': ['FI_MANDATE'],
            'factorGroup': '',
            'factorGroupList': ['Holdings based factors', 'Parametric'],
            'activeColumnTag': 'active_dur_contr'
        }, {
            'value': 'crv_contr',
            'label': 'Curve Contribution',
            'assetClassList': ['FI_MANDATE'],
            'factorGroup': '',
            'factorGroupList': ['Holdings based factors', 'Parametric'],
            'activeColumnTag': 'active_crv_contr'
        }, {
            'value': 'conv_contr',
            'label': 'Convexity Contribution',
            'assetClassList': ['FI_MANDATE'],
            'factorGroup': '',
            'factorGroupList': ['Holdings based factors', 'Parametric'],
            'activeColumnTag': 'active_conv_contr'
        }, {
            'value': 'cvx_crv_contr',
            'label': 'Convexity Curve Contribution',
            'assetClassList': ['FI_MANDATE'],
            'factorGroup': '',
            'factorGroupList': ['Holdings based factors', 'Parametric'],
            'activeColumnTag': 'active_cvx_crv_contr'
        }, {
            'value': 'basis_contr',
            'label': 'Currency Swap Basis Contribution',
            'assetClassList': ['FI_MANDATE'],
            'factorGroup': '',
            'factorGroupList': ['Holdings based factors', 'Parametric'],
            'activeColumnTag': 'active_basis_contr'
        }, {
            'value': 'fx_contr',
            'label': 'FX Contribution',
            'assetClassList': ['EQ_MANDATE', 'BAL_MANDATE', 'FI_MANDATE'],
            'factorGroup': '',
            'factorGroupList': ['Holdings based factors', 'Parametric'],
            'activeColumnTag': 'active_fx_contr'
        }, {
            'value': 'fxcarry_contr',
            'label': 'FX Carry Contribution',
            'assetClassList': ['EQ_MANDATE', 'BAL_MANDATE', 'FI_MANDATE'],
            'factorGroup': '',
            'factorGroupList': ['Holdings based factors', 'Parametric'],
            'activeColumnTag': 'active_fxcarry_contr'
        }, {
            'value': 'fx_spot_carry_contr',
            'label': 'FxSpotCarry',
            'assetClassList': ['EQ_MANDATE', 'BAL_MANDATE', 'FI_MANDATE'],
            'factorGroup': '',
            'factorGroupList': ['Holdings based factors', 'Parametric'],
            'activeColumnTag': 'active_fx_spot_carry'
        }, {
            'value': 'ois_bas_contr',
            'label': 'OIS Basis Contribution',
            'assetClassList': ['FI_MANDATE'],
            'factorGroup': '',
            'factorGroupList': ['Holdings based factors', 'Parametric'],
            'activeColumnTag': 'act_ois_bas_contr'
        }, {
            'value': 'swap_spd_contr',
            'label': 'Swap Spread Contribution',
            'assetClassList': ['FI_MANDATE'],
            'factorGroup': '',
            'factorGroupList': ['Holdings based factors', 'Parametric'],
            'activeColumnTag': 'act_swap_spd_contr'
        }, {
            'value': 'price_contr',
            'label': 'Price Contribution',
            'assetClassList': ['EQ_MANDATE', 'BAL_MANDATE', 'FI_MANDATE'],
            'factorGroup': '',
            'factorGroupList': ['Holdings based factors', 'Accounting'],
            'activeColumnTag': 'active_price_contr'
        }, {
            'value': 'paydn_contr',
            'label': 'Paydown Contribution',
            'assetClassList': ['EQ_MANDATE', 'BAL_MANDATE', 'FI_MANDATE'],
            'factorGroup': '',
            'factorGroupList': ['Holdings based factors', 'Accounting'],
            'activeColumnTag': 'active_paydn_contr'
        }, {
            'value': 'income_contr',
            'label': 'Income Contribution',
            'assetClassList': ['EQ_MANDATE', 'BAL_MANDATE', 'FI_MANDATE'],
            'factorGroup': '',
            'factorGroupList': ['Holdings based factors', 'Accounting'],
            'activeColumnTag': 'active_income_contr'
        }, {
            'value': 'fin_contr',
            'label': 'Financing Contribution',
            'assetClassList': ['EQ_MANDATE', 'BAL_MANDATE', 'FI_MANDATE'],
            'factorGroup': '',
            'factorGroupList': ['Holdings based factors', 'Accounting'],
            'activeColumnTag': 'active_fin_contr'
        }, {
            'value': 'wht_contr',
            'label': 'Withholding Tax Contribution',
            'assetClassList': ['EQ_MANDATE', 'BAL_MANDATE', 'FI_MANDATE'],
            'factorGroup': '',
            'factorGroupList': ['Transaction based factors', 'Trade based'],
            'activeColumnTag': 'active_wht_contr'
        }, {
            'value': 'sec_lending_contr',
            'label': 'Security Lending Contribution',
            'assetClassList': ['EQ_MANDATE', 'BAL_MANDATE', 'FI_MANDATE'],
            'factorGroup': '',
            'factorGroupList': ['Transaction based factors', 'Trade based'],
            'activeColumnTag': 'active_sec_lend_cont'
        }, {
            'value': 'px_diff_contr',
            'label': 'Price Difference Contribution',
            'assetClassList': ['EQ_MANDATE', 'BAL_MANDATE', 'FI_MANDATE'],
            'factorGroup': '',
            'factorGroupList': ['Holdings based factors', 'Accounting'],
            'activeColumnTag': 'active_px_diff_contr'
        }, {
            'value': 'sec_litigation_contr',
            'label': 'Sec Litigation Contribution',
            'assetClassList': ['EQ_MANDATE', 'BAL_MANDATE', 'FI_MANDATE'],
            'factorGroup': '',
            'factorGroupList': ['Holdings based factors', 'Accounting'],
            'activeColumnTag': 'active_sec_lit_contr'
        }, {
            'value': 'mgr_selec_contr',
            'label': 'Manager Selection Contribution',
            'assetClassList': ['BAL_MANDATE'],
            'factorGroup': '',
            'factorGroupList': ['Holdings based factors', 'Accounting'],
            'activeColumnTag': 'act_mgrsel_contr'
        }, {
            'value': 'mngr_select',
            'label': 'Manager Selection',
            'assetClassList': ['BAL_MANDATE'],
            'factorGroup': '',
            'factorGroupList': ['Holdings based factors', 'Accounting'],
            'activeColumnTag': 'mngr_select'
        }, {
            'value': 'te_ms',
            'label': 'Manager Tracking',
            'assetClassList': ['BAL_MANDATE'],
            'factorGroup': '',
            'factorGroupList': ['Holdings based factors', 'Accounting'],
            'activeColumnTag': 'te_ms'
        }, {
            'value': 'market_contr',
            'label': 'Market Basis Contribution',
            'assetClassList': ['BAL_MANDATE'],
            'factorGroup': '',
            'factorGroupList': ['Holdings based factors', 'Accounting'],
            'activeColumnTag': 'active_market_contr'
        }, {
            'value': 'option_gl_contr',
            'label': 'Option Overwrite Contribution',
            'assetClassList': ['EQ_MANDATE'],
            'factorGroup': '',
            'factorGroupList': ['Holdings based factors', 'Accounting'],
            'activeColumnTag': 'active_opt_gl_contr'
        }, {
            'value': 'total_diff_contr',
            'label': 'Total Difference Contribution',
            'assetClassList': ['EQ_MANDATE', 'BAL_MANDATE', 'FI_MANDATE'],
            'factorGroup': '',
            'factorGroupList': ['Holdings based factors', 'Accounting'],
            'activeColumnTag': 'act_total_diff_contr'
        }];

        component.factorsList = factorsList;

        const setting: AttributionSettings = new AttributionSettings('EQ_MANDATE', 'CUSTOM');
        setting.factors = [];
        setting.sectorWeighting = 'MARKET_VALUE';
        setting.attributionCalculatorMethod = 'RELATIVE';
        setting.sectorLevel = 'BENCHMARK_TOTAL_LEVEL';
        setting.exposureMode = 'NotionalMV';
        setting.assetType = 'EQ_MANDATE';
        setting.multiManagerAttribution = false;

        const parentSettings: AttributionSettings = new AttributionSettings('EQ_MANDATE', 'CUSTOM');
        setting.parentAttributionSettings = parentSettings;

        component.settings = setting;
        component.settings.factors = ['price_contr', 'paydn_contr', 'income_contr'];
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('test ngOnInit', () => {
        component.isSelectionAllowed = true;

        jest.spyOn(component, 'updateColumnsList');

        component.ngOnInit();
        expect(component.updateColumnsList).toBeCalledTimes(0);
    });

    it('check functions', () => {
        expect(typeof component.ngOnChanges).toBe('function');
        expect(typeof component.isInNoShowList).toBe('function');
        expect(typeof component.setFactorsAsExcessAndNonExcess).toBe('function');
        expect(typeof component.groupAndSetFactorsAsExcessAndNonExcess).toBe('function');
    });

    it('should Initialize', fakeAsync(() => {
        const change = new SimpleChange('CUSTOM', 'FIXED_INCOME', true);
        const changes: SimpleChanges = {cannedMethod: change};
        component.ngOnChanges(changes);

        tick(200);

        expect(component.advTreeListData.length).toBe(2);
        expect(component.excessAdvTreeListData.length).toBe(1);
        expect(component.nonExcessAdvTreeListData.length).toBe(2);

        expect(component.advTreeListData[0].children.length).toBe(2);
        expect(component.excessAdvTreeListData[0].children.length).toBe(1);
        expect(component.nonExcessAdvTreeListData[0].children.length).toBe(2);

        expect(component.advTreeListData[1].children.length).toBe(1);
        expect(component.nonExcessAdvTreeListData[1].children.length).toBe(1);

        const change2 = new SimpleChange('FIXED_INCOME', 'EQUITY', false);
        const changes2: SimpleChanges = {cannedMethod: change2};
        component.ngOnChanges(changes2);

        tick(200);

        expect(component.advTreeListData.length).toBe(2);
        expect(component.excessAdvTreeListData.length).toBe(1);
        expect(component.nonExcessAdvTreeListData.length).toBe(2);

        expect(component.advTreeListData[0].children.length).toBe(2);
        expect(component.excessAdvTreeListData[0].children.length).toBe(1);
        expect(component.nonExcessAdvTreeListData[0].children.length).toBe(2);

        expect(component.advTreeListData[1].children.length).toBe(1);
        expect(component.nonExcessAdvTreeListData[1].children.length).toBe(1);

        component.resetExcessFlagMap = true;
        const change3 = new SimpleChange(false, true, false);
        const changes3: SimpleChanges = {resetExcessFlagMap: change3};
        component.ngOnChanges(changes3);

        tick(200);

        expect(component.resetExcessFlagMap).toBe(false);
    }));

    /**
     * Test case for the method isInNoShowList for FI factors for Balanced fund.
     */
    it('isInNoShowList for FI factors for Balanced fund ', function () {
        component.settings = new AttributionSettings('BAL_MANDATE', 'EQUITY_TD_xFX');
        const praadaFactor: any = {'assetClassList': ['FI_MANDATE']};

        expect(component.isInNoShowList(praadaFactor)).toBe(false);
    });

    /**
     * Test case for the method isInNoShowList for Enhanced brinson.
     */
    it('isInNoShowList for Enhanced brinson', function () {
        component.settings = new AttributionSettings('BAL_MANDATE', 'EB_MULTI_ASSET_xFXMTE');
        const praadaFactor: any = {'assetClassList': ['FI_MANDATE']};

        expect(component.isInNoShowList(praadaFactor)).toBe(true);
    });

    /**
     * Test case for the method isInNoShowList for manager select factors for Balanced fund.
     */
    it('isInNoShowList for manager select factors for Balanced fund ', function () {
        component.settings = new AttributionSettings('BAL_MANDATE', 'EQUITY_TD_xFX');
        const praadaFactor: any = {'assetClassList': ['BAL_MANDATE'], 'value': 'te_ms'};

        expect(component.isInNoShowList(praadaFactor)).toBe(true);
    });

    /**
     * Expected holding return excess factors for FIXED_INCOME
     */
    function getExpectedTargetData() {
        return [{
            'header': 'FX',
            'eventData': 'FX',
            'children': [{'header': 'FX Contribution', 'eventData': 'fx_contr'}, {
                'header': 'FX Carry Contribution',
                'eventData': 'fxcarry_contr'
            }]
        }, {
            'header': 'Accounting',
            'eventData': 'Accounting',
            'children': [{
                'header': 'Price Contribution',
                'eventData': 'price_contr'
            }, {'header': 'Paydown Contribution', 'eventData': 'paydn_contr'}, {
                'header': 'Income Contribution',
                'eventData': 'income_contr'
            }, {
                'header': 'Financing Contribution',
                'eventData': 'fin_contr'
            }, {
                'header': 'Withholding Tax Contribution',
                'eventData': 'wht_contr'
            }, {
                'header': 'Security Lending Contribution',
                'eventData': 'sec_lending_contr'
            }, {
                'header': 'Price Difference Contribution',
                'eventData': 'px_diff_contr'
            }, {
                'header': 'Sec Litigation Contribution',
                'eventData': 'sec_litigation_contr'
            }, {
                'header': 'Option Overwrite Contribution',
                'eventData': 'option_gl_contr'
            }, {'header': 'Total Difference Contribution', 'eventData': 'total_diff_contr'}]
        }];

    }

    /**
     * Expected trade based return factors for FIXED_INCOME
     */
    function getExpectedTargetAdvTreeListData() {
        return [{
            'label': 'FX',
            'eventData': 'FX',
            'children': [{'label': 'FX Contribution', 'eventData': 'fx_contr'}, {
                'label': 'FX Carry Contribution',
                'eventData': 'fxcarry_contr'
            }]
        }, {
            'label': 'Accounting',
            'eventData': 'Accounting',
            'children': [{'label': 'Price Contribution', 'eventData': 'price_contr'}, {
                'label': 'Paydown Contribution',
                'eventData': 'paydn_contr'
            }, {'label': 'Income Contribution', 'eventData': 'income_contr'}, {
                'label': 'Financing Contribution',
                'eventData': 'fin_contr'
            }, {
                'label': 'Withholding Tax Contribution',
                'eventData': 'wht_contr'
            }, {
                'label': 'Security Lending Contribution',
                'eventData': 'sec_lending_contr'
            }, {
                'label': 'Price Difference Contribution',
                'eventData': 'px_diff_contr'
            }, {
                'label': 'Sec Litigation Contribution',
                'eventData': 'sec_litigation_contr'
            }, {
                'label': 'Option Overwrite Contribution',
                'eventData': 'option_gl_contr'
            }, {'label': 'Total Difference Contribution', 'eventData': 'total_diff_contr'}]
        }];
    }

});
