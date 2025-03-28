import {AbstractColumnOption, SerializeFavoriteType} from '@blk/explore-ui-core';
import {HighlightSettings} from '../highlight/highlight-settings.model';
import {isEmpty, isObject} from 'lodash';

/**
 * Model for highlight column option
 */
export class HighlightColumnOption extends AbstractColumnOption {

    public static CONFIG_TYPE = 'highlight';

    /** All highlight rules */
    highlightSettings: HighlightSettings[];

    /** Flag for highlighting only leaf level cell */
    highlightOnlyLeaf: boolean;

    /** Flag for highlighting only leaf level cell */
    highlightSecondLastLeaf: boolean;

    /**
     * Constructor to create a new empty Highlight rule or initialize an existing one
     * @param data Optional data to construct existing HighlightSetting from
     */
    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Gets the type of the config object.
     */
    get configType(): string {
        return HighlightColumnOption.CONFIG_TYPE;
    }

    /**
     * Initializes the column with the default settings.
     */
    initialize(defaultSettings: any): void {
        super.initialize(defaultSettings);

        // default settings for highlight column option is an empty rule set
        this.highlightSettings = [];
        this.highlightOnlyLeaf = true;
    }

    /**
     * Deserialize saved highlight settings from data to object
     * @param data HighlightSettings in JSON form
     */
    deserialize(data: any): void {
        // no highlight rules to deserialize
        if (!data.highlightSettings || data.highlightSettings.length === 0) {
            return;
        }

        this.highlightSettings = data.highlightSettings.map(settingData => {
            const highlightSetting = new HighlightSettings();
            highlightSetting.deserialize(settingData);
            return highlightSetting;
        });
        this.highlightOnlyLeaf = data.highlightOnlyLeaf;
        this.highlightSecondLastLeaf = data.highlightSecondLastLeaf;
    }

    /**
     * See {@link AbstractColumnOption.doAddRequestParams}
     */
    protected doAddRequestParams(requestParams: any) {
        // nothing is required here as highlight settings are not required on the request to the server for the data fetching
    }

    /**
     * Serialize object into JSON format for saving
     */
    doSerialize(isNested?: boolean | SerializeFavoriteType): any {
        // only serialize if the highlight settings are valid
        if (!this.isValid()) {
            return undefined;
        }

        // serialize each highlight rule if it's valid
        const serializedHighlightSettings = this.highlightSettings
            .filter(setting => setting.isValid())
            .map(validSetting => validSetting.serialize(isNested));

        return {
            highlightSettings: serializedHighlightSettings,
            highlightOnlyLeaf: this.highlightOnlyLeaf,
            highlightSecondLastLeaf: this.highlightSecondLastLeaf
        };
    }

    /**
     * Returns true if the passed in otherColOption is equal to this one
     */
    equals(otherColOption: AbstractColumnOption): boolean {
        if (!(otherColOption instanceof HighlightColumnOption)) {
            return false;
        }
        if (this.highlightOnlyLeaf !== otherColOption.highlightOnlyLeaf) {
            return false;
        }
        if (this.highlightSecondLastLeaf !== otherColOption.highlightSecondLastLeaf) {
            return false;
        }
        if (this.highlightSettings?.length !== otherColOption.highlightSettings?.length) {
            return false;
        }
        const settings = this.highlightSettings || [];
        for (let i = 0; i < settings.length; i++) {
            if (!settings[i].equals(otherColOption.highlightSettings[i])) {
                return false;
            }
        }
        return true;
    }

    /**
     * Checks if the highlight column option is valid (not empty)
     */
    isValid(): boolean {
        return !isEmpty(this.highlightSettings);
    }

    /**
     * Checks to see if any of the highlight rules are aggregate comparisons
     */
    containsAggregateRule(): boolean {
        return this.highlightSettings.findIndex(highlightSetting => highlightSetting.isAggregatedComparisonType()) !== -1;
    }
}
