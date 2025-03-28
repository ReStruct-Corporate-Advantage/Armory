import {PositionAggregationType} from './position-aggregation-type.model';

describe('Position Aggregation tets case file', () =>{
    it('Deserialize method test', () =>{
        const data: any = {
            value: 'SINGLE_ROW',
            displayName: 'Single Row'
        };

        let positionAggregationCtrl = new PositionAggregationType(data);
        expect(positionAggregationCtrl.value).toBe('SINGLE_ROW');
        expect(positionAggregationCtrl.label).toBe('Single Row');
    });
});
