import {ActiveCalculationColumnOptionComponent} from './active-calculation/active-calculation-column-option.component';
import {columnOptionComponentList} from './column-option-component-list';
import {ColumnOptionComponentFactory} from './column-option-component.factory';

describe('Column option component factor test', () => {
    let componentFactory: ColumnOptionComponentFactory;
    beforeAll(() => {
        componentFactory = new ColumnOptionComponentFactory(columnOptionComponentList);
    });

    it('Validate getting an item', () => {
        const compType = componentFactory.getComponent(ActiveCalculationColumnOptionComponent.OPTION_KEY);
        expect(compType).toBeDefined();

        // Now validate that we got a component type that when created results in an object of the correct type.
        const comp = new compType();
        expect(comp instanceof ActiveCalculationColumnOptionComponent).toBeTruthy();
    });

    it('Validate getting an invalid item', () => {
        const compType = componentFactory.getComponent('abc');
        expect(compType).not.toBeDefined();
    });
});
