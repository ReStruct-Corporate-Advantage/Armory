import {Injectable, Type} from '@angular/core';

/**
 * This Class acts as factory for generating the component for a column option.
 */
@Injectable()
export class ColumnOptionComponentFactory {

    // Contains the list of column option types that this factory class knows how to create.
    private optionTypes: Map<string, Type<any>> = new Map<string, Type<any>>();

    /**
     * Construct the factory and register the components.
     */
    public constructor (private components: Array<Type<any>>) {
        this.components.forEach((type: Type<any>) => {
            const optionKey: string = type['OPTION_KEY'];
            if (optionKey) {
                this.optionTypes.set(optionKey, type);
            }
        });
    }

    /**
     * Get the component type from the factory.
     */
    public getComponent(type: string): Type<any> {
        return this.optionTypes.get(type);
    }
}
