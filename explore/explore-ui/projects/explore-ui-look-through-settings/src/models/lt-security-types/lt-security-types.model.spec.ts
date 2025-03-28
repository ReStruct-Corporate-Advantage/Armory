import {LtSecurityTypes} from './lt-security-types.model';

/**
 * LtSecurity Types test case file
 */
describe('LtSecurity type test case', () => {
    const data = {
        description: 'Funds',
        name: 'FUND',
        selected: true,
        varEquivalent: 'FUND.OPEN_END FUND.CLOSED_END FUND.STIF FUND.PRIVATE'
    };

    it('Deserialize test case', () => {
        let ltSecurityCtrl = new LtSecurityTypes(data);
        expect(ltSecurityCtrl.description).toBe('Funds');
        expect(ltSecurityCtrl.name).toBe('FUND');
        expect(ltSecurityCtrl.selected).toBeTruthy();
        expect(ltSecurityCtrl.selected).toBeTruthy();
    });
});
