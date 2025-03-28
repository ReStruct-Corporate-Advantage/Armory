import {GenericColumnDefinition} from './generic-column-definition.model';

describe('Generic Column Definition attribute test case file', () =>{
    it('Check deserialize method', () =>{
        const data: any = {
            value: 'VALUE',
            displayName: 'Dummy Display Name'
        };

        const columnDefinitionCtrl = new GenericColumnDefinition(data);
        expect(columnDefinitionCtrl.value).toBe('VALUE');
        expect(columnDefinitionCtrl.label).toBe('Dummy Display Name');
    });
});
