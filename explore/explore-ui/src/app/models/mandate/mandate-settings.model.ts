import {AbstractConfig, FavoriteType} from '@blk/explore-ui-core';

/**
 * Mandate Settings model
 */
export class MandateSettings extends AbstractConfig {
    // name for the settings
    mandate: string;
    // Map of all mandate related settings
    settings: Map<string, string | string[]> = new Map<string, string|string[]>();

    constructor(data?: any) {
        super();
        if (data) {
            this.deserialize(data);
        }
    }

    /**
     * Serializes the object into a format that can be saved.
     */
    serialize(): any {
        const data: any = {
            MANDATE: this.mandate
        };

        data.settings = {};
        this.settings.forEach((val: string | string[], key: string) => {
            data.settings[key] = val;
        });

        return data;
    }

    /**
     * Deserialize method which takes in the data from favorites and populates the instance
     */
    deserialize(data: any): void {
        this.mandate = data.MANDATE;

        if (data.settings) {
            Object.keys(data.settings).forEach((key: string) => {
                const val = data.settings[key];
                this.settings.set(key, val);
            });
            return;
        }

        if (data.ATTRIBUTION_SETTING) {
            this.settings.set(FavoriteType.ATTRIBUTION_TYPE, data.ATTRIBUTION_SETTING);
        }

        if (data.BREAKDOWN) {
            this.settings.set(FavoriteType.BREAKDOWN, this.convertData(data.BREAKDOWN));
        }

        const reportFavorites = [];
        const reportsData = data.REPORTS ? data.REPORTS : data.LAYOUT;
        if (reportsData) {
            for (const reportData of reportsData) {
                reportFavorites.push(this.convertData(reportData));
            }
        }
        this.settings.set(FavoriteType.CURATED_REPORTS, reportFavorites);

        if (data.REPORT) {
            this.settings.set(FavoriteType.SINGLE_REPORT, this.convertData(data.REPORT));
        }

        if (data.PERF_BKD) {
            this.settings.set(FavoriteType.PERFORMANCE_BREAKDOWN, this.convertData(data.PERF_BKD));
        }

        if (data.FAC_BKD) {
            this.settings.set(FavoriteType.FACTOR_BREAKDOWN, this.convertData(data.FAC_BKD));
        }
    }

    /**
     * Converts data from database to the format needed for mandate mapping backwards compatibility.
     */
    private convertData(data: string): string {
        return data.indexOf(';') < 0 ? 'false;' + data : data;
    }
}
