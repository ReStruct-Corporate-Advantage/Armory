import {Security} from '@interfaces/security.interface';
import {SecurityUtils} from '@utils/security.utils';

describe('SecurityUtils', () => {
   describe('test calculateNav', () => {
       it( 'should calculateNav', () => {
            const selectedSecurities: Map<string, Security> = new Map<string, Security>();
            selectedSecurities.set('CUSIP1', {cusip: 'CUSIP1', currentValue: 0.0, 'newValue': 5.0});
           selectedSecurities.set('CUSIP2',  {cusip: 'CUSIP2', currentValue: 0.0, 'newValue': 5.0});
           const designatedValuesForCusips: Map<string, number> = new Map<string, number>();
           designatedValuesForCusips['CUSIP1'] =  5.0;
           designatedValuesForCusips['CUSIP2'] =  5.0;
           expect(SecurityUtils.calculateNav(selectedSecurities, designatedValuesForCusips)).toEqual('10');
       });
   });
});
