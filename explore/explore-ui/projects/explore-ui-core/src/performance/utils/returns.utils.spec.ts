import {CoreTestUtils} from '../../test-utils/core-test.utils';
import {ReturnsUtils} from './returns.utils';

describe('ReturnsUtils', () => {

    it('getAccountingFactors', () => {
        const selectedFactors: any = ['rf_contr', 'delta_contr', 'option_gl_contr', 'comm_contr'];
        const factorList: any = [{
            'value': 'price_contr',
            'label': 'Price Contribution',
            'assetClassList': ['EQ_MANDATE', 'BAL_MANDATE', 'FI_MANDATE'],
            'factorGroup': 'Accounting',
            'activeColumnTag': 'active_price_contr'
        }, {
            'value': 'paydn_contr',
            'label': 'Paydown Contribution',
            'assetClassList': ['EQ_MANDATE', 'BAL_MANDATE', 'FI_MANDATE'],
            'factorGroup': 'Accounting',
            'activeColumnTag': 'active_paydn_contr'
        }, {
            'value': 'income_contr',
            'label': 'Income Contribution',
            'assetClassList': ['EQ_MANDATE', 'BAL_MANDATE', 'FI_MANDATE'],
            'factorGroup': 'Accounting',
            'activeColumnTag': 'active_income_contr'
        }, {
            'value': 'fin_contr',
            'label': 'Financing Contribution',
            'assetClassList': ['EQ_MANDATE', 'BAL_MANDATE', 'FI_MANDATE'],
            'factorGroup': 'Accounting',
            'activeColumnTag': 'active_fin_contr'
        }, {
            'value': 'wht_contr',
            'label': 'Withholding Tax Contribution',
            'assetClassList': ['EQ_MANDATE', 'BAL_MANDATE', 'FI_MANDATE'],
            'factorGroup': 'Accounting',
            'activeColumnTag': 'active_wht_contr'
        }, {
            'value': 'sec_lending_contr',
            'label': 'Security Lending Contribution',
            'assetClassList': ['EQ_MANDATE', 'BAL_MANDATE', 'FI_MANDATE'],
            'factorGroup': 'Accounting',
            'activeColumnTag': 'active_sec_lend_cont'
        }, {
            'value': 'px_diff_contr',
            'label': 'Price Difference Contribution',
            'assetClassList': ['EQ_MANDATE', 'BAL_MANDATE', 'FI_MANDATE'],
            'factorGroup': 'Accounting',
            'activeColumnTag': 'active_px_diff_contr'
        }, {
            'value': 'sec_litigation_contr',
            'label': 'Sec Litigation Contribution',
            'assetClassList': ['EQ_MANDATE', 'BAL_MANDATE', 'FI_MANDATE'],
            'factorGroup': 'Accounting',
            'activeColumnTag': 'active_sec_lit_contr'
        }, {
            'value': 'mgr_selec_contr',
            'label': 'Manager Selection Contribution',
            'assetClassList': ['BAL_MANDATE'],
            'factorGroup': 'Accounting',
            'activeColumnTag': 'act_mgrsel_contr'
        }, {
            'value': 'mngr_select',
            'label': 'Manager Selection',
            'assetClassList': ['BAL_MANDATE'],
            'factorGroup': 'Accounting',
            'activeColumnTag': 'mngr_select'
        }, {
            'value': 'te_ms',
            'label': 'Manager Tracking',
            'assetClassList': ['BAL_MANDATE'],
            'factorGroup': 'Accounting',
            'activeColumnTag': 'te_ms'
        }, {
            'value': 'market_contr',
            'label': 'Market Basis Contribution',
            'assetClassList': ['BAL_MANDATE'],
            'factorGroup': 'Accounting',
            'activeColumnTag': 'active_market_contr'
        }, {
            'value': 'option_gl_contr',
            'label': 'Option Overwrite Contribution',
            'assetClassList': ['EQ_MANDATE'],
            'factorGroup': 'Accounting',
            'activeColumnTag': 'active_opt_gl_contr'
        }, {
            'value': 'total_diff_contr',
            'label': 'Total Difference Contribution',
            'assetClassList': ['EQ_MANDATE', 'BAL_MANDATE', 'FI_MANDATE'],
            'factorGroup': 'Accounting',
            'activeColumnTag': 'act_total_diff_contr'
        }, {
            'value': 'comm_contr',
            'label': 'Commissions Contribution',
            'assetClassList': ['EQ_MANDATE', 'BAL_MANDATE', 'FI_MANDATE'],
            'factorGroup': 'Trade Based Factors',
            'activeColumnTag': 'active_comm_contr'
        }, {
            'value': 'tradeprice_contr',
            'label': 'Trade Contribution',
            'assetClassList': ['EQ_MANDATE', 'BAL_MANDATE', 'FI_MANDATE'],
            'factorGroup': 'Trade Based Factors',
            'activeColumnTag': 'active_trade_contr'
        }];

        const accountingFactors = ReturnsUtils.getFactorsPresentInFactorList(selectedFactors, factorList);
        expect(CoreTestUtils.validate(accountingFactors, ['option_gl_contr', 'comm_contr'])).toBeTruthy();
    });

    it('getAttributionFactors', () => {
        const selectedFactors: any = ['rf_contr', 'delta_contr', 'option_gl_contr', 'comm_contr'];
        const factorList: any = [{
            'value': 'rf_contr',
            'label': 'Risk Free Contribution',
            'assetClassList': ['FI_MANDATE'],
            'factorGroup': 'Yield Curve',
            'activeColumnTag': 'active_rf_contr'
        }, {
            'value': 'rldn_contr',
            'label': 'Rolldown Contribution',
            'assetClassList': ['FI_MANDATE'],
            'factorGroup': 'Yield Curve',
            'activeColumnTag': 'active_rldn_contr'
        }, {
            'value': 'oas_chg_contr',
            'label': 'OAS Change Contribution',
            'assetClassList': ['FI_MANDATE'],
            'factorGroup': 'OAS',
            'activeColumnTag': 'active_oas_chg_contr'
        }, {
            'value': 'oas_lev_contr',
            'label': 'OAS Level Contribution',
            'assetClassList': ['FI_MANDATE'],
            'factorGroup': 'OAS',
            'activeColumnTag': 'active_oas_lev_contr'
        }, {
            'value': 'mtb_dur_contr',
            'label': 'Mtg/Tsy Duration Contribution',
            'assetClassList': ['FI_MANDATE'],
            'activeColumnTag': 'active_mtb_dur_contr'
        }, {
            'value': 'nvoldur_cont',
            'label': 'Volatility Duration Contribution',
            'assetClassList': ['FI_MANDATE'],
            'factorGroup': 'VOL',
            'activeColumnTag': 'active_vol_dur_contr'
        }, {
            'value': 'vol_cvx_contr',
            'label': 'Vol Convexity Contribution',
            'assetClassList': ['FI_MANDATE'],
            'factorGroup': 'VOL',
            'activeColumnTag': 'active_vol_cvx_contr'
        }, {
            'value': 'delta_contr',
            'label': 'Convert Delta Contribution',
            'assetClassList': ['FI_MANDATE'],
            'factorGroup': 'Other',
            'activeColumnTag': 'active_delta_contr'
        }, {
            'value': 'infl_contr',
            'label': 'Inflation Duration Contribution',
            'assetClassList': ['FI_MANDATE'],
            'activeColumnTag': 'active_infl_contr'
        }, {
            'value': 'dur_contr',
            'label': 'Duration Contribution',
            'assetClassList': ['FI_MANDATE'],
            'factorGroup': 'Yield Curve',
            'activeColumnTag': 'active_dur_contr'
        }, {
            'value': 'crv_contr',
            'label': 'Curve Contribution',
            'assetClassList': ['FI_MANDATE'],
            'factorGroup': 'Yield Curve',
            'activeColumnTag': 'active_crv_contr'
        }, {
            'value': 'conv_contr',
            'label': 'Convexity Contribution',
            'assetClassList': ['FI_MANDATE'],
            'factorGroup': 'Yield Curve',
            'activeColumnTag': 'active_conv_contr'
        }, {
            'value': 'cvx_crv_contr',
            'label': 'Convexity Curve Contribution',
            'assetClassList': ['FI_MANDATE'],
            'factorGroup': 'Yield Curve',
            'activeColumnTag': 'active_cvx_crv_contr'
        }, {
            'value': 'basis_contr',
            'label': 'Currency Swap Basis Contribution',
            'assetClassList': ['FI_MANDATE'],
            'factorGroup': 'Other',
            'activeColumnTag': 'active_basis_contr'
        }, {
            'value': 'fx_contr',
            'label': 'FX Contribution',
            'assetClassList': ['EQ_MANDATE', 'BAL_MANDATE', 'FI_MANDATE'],
            'factorGroup': 'FX',
            'activeColumnTag': 'active_fx_contr'
        }, {
            'value': 'fxcarry_contr',
            'label': 'FX Carry Contribution',
            'assetClassList': ['EQ_MANDATE', 'BAL_MANDATE', 'FI_MANDATE'],
            'factorGroup': 'FX',
            'activeColumnTag': 'active_fxcarry_contr'
        }, {
            'value': 'fx_spot_carry_contr',
            'label': 'FxSpotCarry',
            'assetClassList': ['EQ_MANDATE', 'BAL_MANDATE', 'FI_MANDATE'],
            'factorGroup': 'FX',
            'activeColumnTag': 'active_fx_spot_carry'
        }, {
            'value': 'ois_bas_contr',
            'label': 'OIS Basis Contribution',
            'assetClassList': ['FI_MANDATE'],
            'factorGroup': 'Other',
            'activeColumnTag': 'act_ois_bas_contr'
        }, {
            'value': 'swap_spd_contr',
            'label': 'Swap Spread Contribution',
            'assetClassList': ['FI_MANDATE'],
            'factorGroup': 'Other',
            'activeColumnTag': 'act_swap_spd_contr'
        }];
        const attributionFactors = ReturnsUtils.getFactorsPresentInFactorList(selectedFactors, factorList);
        expect(CoreTestUtils.validate(attributionFactors, ['rf_contr', 'delta_contr'])).toBeTruthy();
    });
});
