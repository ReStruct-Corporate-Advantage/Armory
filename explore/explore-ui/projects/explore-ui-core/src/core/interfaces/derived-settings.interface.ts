/**
 * Interface implemented by all the settings which derive their values from their parent settings
 */
export interface DerivedSettings<T> {
    /**
     * Return widget setting key
     */
    getParentWidgetSettingKey(): string;

    /**
     * Return portfolio setting key
     */
    getParentPortfolioSettingKey(): string;

    /**
     * Update the derived settings using the settings passed in
     * @param updateColumnOnlySettings - there are some exceptions that we want to avoid updating with derived settings
     */
    updateDerivedSettings(settings: T, updateColumnOnlySettings?: boolean);
}


/**
 * Utility method to check if the object is an instance of this.
 */
export function isDerivedSetting(object: any): object is DerivedSettings<any> {
    return object && 'updateDerivedSettings' in object;
}
