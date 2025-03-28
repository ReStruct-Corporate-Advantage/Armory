import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {CoreTestUtils} from '@blk/explore-ui-core';
import {ColumnSetService} from '@services/column-set/column-set.service';
import {TestUtils} from '@utils/test.utils';
import {of} from 'rxjs';
import {PerformanceAttributionSettingsService} from './performance-attribution-settings.service';

describe('PerformanceAttributionSettingsService', () => {
    let service: PerformanceAttributionSettingsService;

    const columnSetServiceStub = {
        fetchColumnData$: jest.fn(() => of({}))
    };

    const allFactorColumns = [
        'active_rf_contr',
        'active_rldn_contr',
        'active_oas_chg_contr',
        'active_oas_lev_contr',
        'active_mtb_dur_contr',
        'nvoldur_cont',
        'vol_cvx_contr',
        'active_delta_contr',
        'active_infl_contr',
        'active_dur_contr',
        'active_crv_contr',
        'active_conv_contr',
        'active_cvx_crv_contr',
        'active_basis_contr',
        'active_fx_contr',
        'active_fxcarry_contr',
        'active_fx_spot_carry',
        'act_ois_bas_contr',
        'act_swap_spd_contr',
        'active_price_contr',
        'active_paydn_contr',
        'active_income_contr',
        'active_fin_contr',
        'active_wht_contr',
        'active_sec_lend_cont',
        'active_px_diff_contr',
        'active_sec_lit_contr',
        'act_mgrsel_contr',
        'mngr_select',
        'te_ms',
        'active_market_contr',
        'active_opt_gl_contr',
        'act_total_diff_contr',
        'active_comm_contr',
        'active_trade_contr'
    ];

    beforeAll((done) => {
        TestUtils.initialize(done);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {provide: ColumnSetService, useValue: columnSetServiceStub},
            ]
        });
        service = TestBed.inject(PerformanceAttributionSettingsService);
    });

    it('should be created', () => {
        const serviceInstance: PerformanceAttributionSettingsService = TestBed.inject(PerformanceAttributionSettingsService);
        expect(serviceInstance).toBeTruthy();
    });

    /**
     * Test case for method getFilteredFactorTagsToAdd
     */
    it('getFilteredFactorTagsToAdd', () => {
        const columns: any = [{'columnTag': 'cusip'}, {'columnTag': 'pnl_sec_desc'}, {'columnTag': 'total_ret'}, {'columnTag': 'excess_contr'}, {'columnTag': 'active_fx_contr'}];

        const filteredTags = service['getFilteredFactorTagsToAdd'](columns, ['fx_contr', 'oas_chg_contr']);
        // active_fx_contr is already present in columns so only oas_chg_contr would be returned
        expect(CoreTestUtils.validate(filteredTags, ['oas_chg_contr'])).toBe(true);
    });

    /**
     * Test case for method removeFactorColumns
     */
    it('removeFactorColumns', () => {
        const columns: any = [{'columnTag': 'cusip'}, {'columnTag': 'pnl_sec_desc'}, {'columnTag': 'total_ret'}, {'columnTag': 'excess_contr'}, {'columnTag': 'active_fx_contr'}, {'columnTag': 'active_fxcarry_contr'}];


        service['removeFactorColumns'](columns, allFactorColumns, ['active_fxcarry_contr']);
        // active_fx_contr has been removed as its a factor column and not present in the passed in list of factor tags to add ot retain.
        // Since active_fxcarry_contr is in that list it is still present even though its a factor column
        expect(CoreTestUtils.validate(CoreTestUtils.getColTags(columns), ['cusip', 'pnl_sec_desc', 'total_ret', 'excess_contr', 'active_fxcarry_contr'])).toBe(true);
    });

    /**
     * This test is moved out from attribution settings component spec as modifyColumns is factored out from updateColumnsList in the attribution settings component.
     */
    it('should modify columns', () => {
        // active_fx_contr would be present in the beginning oif the expected cols after column updating as it is already present
        const columns: any = [{'columnTag': 'active_fx_contr'}];
        const factorsToAdd = [
            'rf_contr',
            'rldn_contr',
            'dur_contr',
            'conv_contr',
            'crv_contr',
            'tradeprice_contr',
            'comm_contr',
            'fx_contr',
            'fxcarry_contr',
            'cvx_crv_contr'
        ];
        service.modifyColumns(columns, allFactorColumns, factorsToAdd, 'FIXED_INCOME');
        expect(CoreTestUtils.validate(CoreTestUtils.getColTags(columns), getExpectedColTagsOrdered())).toBe(true);
    });

    /**
     * Expected factor columns for FIXED_INCOME with a particular order
     */
    function getExpectedColTagsOrdered() {
        return ['active_fx_contr', 'active_rf_contr', 'active_rldn_contr', 'active_dur_contr',
            'active_crv_contr', 'active_conv_contr', 'active_cvx_crv_contr', 'active_fxcarry_contr',
            'active_comm_contr', 'active_trade_contr'];
    }
});


