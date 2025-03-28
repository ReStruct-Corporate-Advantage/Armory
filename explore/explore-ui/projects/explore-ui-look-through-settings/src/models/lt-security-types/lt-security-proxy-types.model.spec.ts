/**
 * Lt Security test case file
 */

import {LtSecurityProxyTypes} from './lt-security-proxy-types.model';

describe('LtSecurityProxyTypes test cases', () => {

    /**
     * deserialize test
     */
    it('Deserialize test', () => {
        const data = {
            description: 'Funds',
            name: 'FUND',
            selected: true
        };

        let ltSecurityCtrl = new LtSecurityProxyTypes(data);
        expect(ltSecurityCtrl.description).toBe('Funds');
        expect(ltSecurityCtrl.name).toBe('FUND');
        expect(ltSecurityCtrl.selected).toBeTruthy();
    });
});
