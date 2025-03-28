import {DefinitionInitializer} from '../definition/definition.initializer';
import * as definitions from './data/definitions.json';

export class CoreTestUtils {
    /**
     * Create an array of colTags from the passed in columns
     */
    static getColTags(columns) {
        const colTags = [];
        for (const column of columns) {
            colTags.push(column.columnTag);
        }
        return colTags;
    }

    /**
     * Compares that the two list of values passed in are equal
     */
    static validate(actualValues, expectedValues) {
        if (actualValues.length !== expectedValues.length) {
            return false;
        }
        for (let i = 0; i < actualValues.length; i++) {
            if (JSON.stringify(actualValues[i]) !== JSON.stringify(expectedValues[i])) {
                return false;
            }
        }
        return true;
    }

    static initDefinitions(): void {
        DefinitionInitializer.initDefinitions(definitions);
    }
}
