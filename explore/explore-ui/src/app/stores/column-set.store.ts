import {cloneDeep} from 'lodash';

/**
 * stores and fetches report columns object received from the server in cache.
 */
export class ColumnSetStore {
    static cache: Map<string, any> = new Map<string, any>();

    /**
     * Function to get report Columns from the cache as per the key
     */
    static getReportColumnsFromCache(reportName: string): any {
        return ColumnSetStore.cache[reportName];
    }

    /**
     * Function to save copy of report columns received from server
     */
    static addReportColumnsToCache(reportName, reportColumns: any): void {
        ColumnSetStore.cache[reportName] = cloneDeep(reportColumns);
    }
}
