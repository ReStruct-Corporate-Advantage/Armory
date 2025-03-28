import {ColumnDefinition} from './column-definition.model';

/**
 * FactorModelColumnDefinition is used for storing factor information fetched from FactorModelService,
 * which comes as factor definition from backend
 */
export class FactorModelColumnDefinition extends ColumnDefinition {
    viewLevels: boolean;

    deserialize(col: any): void {
        super.deserialize(col);
        this.viewLevels = col.viewLevels;
    }
}
