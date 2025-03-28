/**
 * Constants for Publish State
 */
export class PublishStateConstants {
    static readonly MINUTE_TO_MILLISECOND = 60000;
    static readonly HOUR_TO_MILLISECOND = 3600000;
    static readonly DAY_TO_MILLISECOND = 86400000;
    static readonly PRELIM_RISK = 'Prelim Risk';
    static readonly RISK_RELEASED = 'Risk Released';
    static readonly UNKNOWN = 'Unknown';
    static readonly RED_STATE = 'publish-state-indicator-red';
    static readonly ASSISTIVE_LABEL_RED_STATE = 'Quality Control Publish Indicator - Red';
    static readonly GREEN_STATE = 'publish-state-indicator-green';
    static readonly ASSISTIVE_LABEL_GREEN_STATE = 'Quality Control Publish Indicator - Green';
    static readonly CLEAR_STATE = 'publish-state-indicator-clear';
    static readonly NOT_APPLICABLE = 'N/A';
    static readonly FORMAT_WITHOUT_SECONDS = 'MMM DD YYYY, LT';
    static readonly FORMAT_WITH_SECONDS = 'MMM DD YYYY, LTS';
}
