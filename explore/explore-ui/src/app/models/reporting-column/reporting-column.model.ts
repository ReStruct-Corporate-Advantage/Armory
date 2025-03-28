import {isObject} from 'lodash';

/**
 * Model class for Reporting Column
 */
export class ReportingColumn {
    columnTag: string;
    uses: string;

    constructor(data?: any) {
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    deserialize(data: any): void {
        if (!data) {
            return;
        }

        if (data.columnTag) {
            this.columnTag = data.columnTag;
        }

        if (data.uses) {
            this.uses = data.uses;
        }
    }

    serialize(): any {
        return {
            columnTag: this.columnTag,
            uses: this.uses,
        };
    }
}
