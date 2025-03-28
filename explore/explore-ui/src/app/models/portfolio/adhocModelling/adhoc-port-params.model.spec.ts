/**
 * Test Case for AdhocPortParams
 */
import {AdhocPortParams} from './adhoc-port-params.model';
import {DateValue} from '@blk/explore-ui-core';

describe('AdhocPortParams', () => {
    const adhocParamsJson = {
        name: 'a',
        date: DateValue.newRelativeDate('T-1'),
        fullName: 'b',
        currency: 'c',
        portMktNotional: 1
    };

    it('tests component creation', () => {
        expect(new AdhocPortParams()).toBeTruthy();
    });

    it('tests serialize/deserialize', () => {
        expect(new AdhocPortParams(adhocParamsJson).serialize()).toEqual(adhocParamsJson);
    });

    it('tests equals', () => {
        const adhocPortParams: AdhocPortParams = new AdhocPortParams(adhocParamsJson);

        expect(new AdhocPortParams(adhocParamsJson).equals(adhocPortParams)).toBeTruthy();

        adhocPortParams.name = 'b';
        expect(new AdhocPortParams(adhocParamsJson).equals(adhocPortParams)).toBeFalsy();

        adhocPortParams.name = 'a';
        adhocPortParams.portMktNotional = 2;
        expect(new AdhocPortParams(adhocParamsJson).equals(adhocPortParams)).toBeFalsy();
    });
});
