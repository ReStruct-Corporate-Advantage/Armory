import {ClosedPositionAggregation} from './closed-position-aggregation.model';

describe('Closed Position Aggregation tets case', () =>{
    it('Deserialize method', () =>{
        const data: any = {
            value: 'SINGLE_ROW',
            displayName: 'Single Row'
        };

        let closedPositionAggregationCtrl = new ClosedPositionAggregation(data);
        expect(closedPositionAggregationCtrl.value).toBe('SINGLE_ROW');
        expect(closedPositionAggregationCtrl.label).toBe('Single Row');
    });
});
