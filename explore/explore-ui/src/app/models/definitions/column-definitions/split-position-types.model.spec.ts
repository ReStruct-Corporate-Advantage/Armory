import {SplitPositionType} from './split-position-types.model';

/**
 * Split position type test case
 */
describe('Split Position test case', () =>{
    it('Deserialize test', () =>{
        const data: any = {
            name: 'XC',
            description: 'FX CSWAP',
            defaultSelected: true,
            splitSubTypeDesc: 'CASH FXCSWAP'
        };

        const splitPositionCtrl = new SplitPositionType(data);
        expect(splitPositionCtrl.name).toBe('XC');
        expect(splitPositionCtrl.description).toBe('FX CSWAP');
        expect(splitPositionCtrl.defaultSelected).toBeTruthy();
        expect(splitPositionCtrl.splitSubTypeDesc).toBe('CASH FXCSWAP');
    });
});
