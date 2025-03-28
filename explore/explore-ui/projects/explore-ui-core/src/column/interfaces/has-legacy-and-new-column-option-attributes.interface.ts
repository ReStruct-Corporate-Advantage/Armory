/**
 * This interface is implemented by those column options where the favorites can contain a mix of new and legacy attributes
 * For example for performance column options the favorite has this-
 * optionValues : {
 *     performanceSettings : {
 *         timePeriod : {},
 *         attributionSettings: {},
 *         configType: 'performanceSettings'
 *     }
 *     customPivotPoint: '3_YEAR',
 *     AS-REPORTED: true
 * }
 *
 * Here the time Period and attribution settings are as per the new structure but custom pivot point and as reported are as legacy options
 */
export interface HasLegacyAndNewColumnOptionAttributes {
    deserializeLegacyColumnOptionAttributes(data: any): void;
}
