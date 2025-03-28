import {ColumnOptionTestBed} from '@blk/explore-ui-column-option';
import {CollapsedLookthroughColumnOption} from '@models/columns/column-options/collapsed-lookthrough-column-option.model';
import {isEmpty} from 'lodash';
import {CollapsedLookthroughColumnOptionComponent} from './collapsed-lookthrough-column-option.component';
import {LtSecurityTypes} from '@blk/explore-ui-look-through-settings';

/**
 * Test cases for the CollapsedLookthroughColumnOptionComponent
 */
describe('Collapsed look through column options component test', () => {
    let testBed: ColumnOptionTestBed<CollapsedLookthroughColumnOptionComponent, CollapsedLookthroughColumnOption>;

    beforeEach(() => {
        const collapsedLookthroughColumnOption: CollapsedLookthroughColumnOption = new CollapsedLookthroughColumnOption();
        collapsedLookthroughColumnOption.initialize({});

        testBed = new ColumnOptionTestBed<CollapsedLookthroughColumnOptionComponent, CollapsedLookthroughColumnOption>(CollapsedLookthroughColumnOptionComponent, collapsedLookthroughColumnOption, {});
    });

    it('should create', () => {
        expect(testBed.component).toBeTruthy();
    });

    describe('Test onSecurityTypeGroupChanged', () => {
        it('Test onSecurityTypeGroupChanged with null', () => {
            testBed.component.onSecurityTypeGroupChanged(null);
            // Should still be empty
            expect(isEmpty(testBed.component.optionValue.lookthroughSettings.ltSecurityTypes)).toBeTruthy();
        });

        it('Test onSecurityTypeGroupChanged', () => {
            testBed.component.availableSecurityTypes = [
                new LtSecurityTypes({
                    'description': 'Funds',
                    'name': 'FUND',
                    'selected': false,
                    'varEquivalent': 'FUND.OPEN_END FUND.CLOSED_END FUND.STIF FUND.PRIVATE'
                }),
                new LtSecurityTypes({'description': 'ETFs', 'name': 'ETF', 'selected': false, 'varEquivalent': 'ETF'}),
                new LtSecurityTypes({
                    'description': 'Index Futures',
                    'name': 'FUTURE_INDEX',
                    'selected': false,
                    'varEquivalent': 'FUTURE.INDEX'
                }),
                new LtSecurityTypes({
                    'description': 'Synthetic Instruments',
                    'name': 'SYNTH_CAP',
                    'selected': false,
                    'varEquivalent': 'SYNTH.CAP SYNTH.INDEX'
                }),
                new LtSecurityTypes({
                    'description': 'CDX',
                    'name': 'CDX',
                    'selected': false,
                    'varEquivalent': 'CDSWAP'
                }),
                new LtSecurityTypes({
                    'description': 'Equity Private',
                    'name': 'EQUITY_PRIVATE',
                    'selected': false,
                    'varEquivalent': 'EQUITY.PRIVATE'
                }),
                new LtSecurityTypes({
                    'description': 'Bond Forward',
                    'name': 'BND_FWD',
                    'selected': false,
                    'varEquivalent': 'BNDFWD'
                }),
                new LtSecurityTypes({
                    'description': 'Equity Forward',
                    'name': 'EQ_FWD',
                    'selected': false,
                    'varEquivalent': 'EQFWD'
                }),
                new LtSecurityTypes({
                    'description': 'Equity Option',
                    'name': 'EQ_OPTION',
                    'selected': false,
                    'varEquivalent': 'OPTION'
                })
            ];
            const checkBoxes = [{label: 'Funds', checked: true}, {label: 'ETFs', checked: true}, {
                label: 'CDX',
                checked: false
            }];
            const customEvent = new CustomEvent('build', {detail: {value: checkBoxes, host: null, srcEvent: null}});

            testBed.component.onSecurityTypeGroupChanged(customEvent);

            expect(testBed.component.optionValue.lookthroughSettings.ltSecurityTypes).toEqual(['FUND', 'ETF']);
        });
    });
});
