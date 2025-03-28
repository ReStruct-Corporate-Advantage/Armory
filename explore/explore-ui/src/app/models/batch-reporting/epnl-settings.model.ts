import {AbstractConfig, CalendarDateUtils, DateValue} from '@blk/explore-ui-core';
import {isNil, isObject} from 'lodash';

/**
 * Modal class to hold EPNL settings defined at BatchSettings level.
 */
export class EpnlSettings extends AbstractConfig {
    /**
     * Associated from date
     */
    fromDate: DateValue;

    /**
     * Associated to date
     */
    toDate: DateValue;

    /**
     * Enable birt summary
     */
    enableBirtSummary: boolean;

    /**
     * Enable hide links
     */
    enableHideLinks: boolean;

    /**
     * Associated from
     */
    calCode: string;

    /**
     * Constructor to initialize Settings.
     */
    constructor(data?: any) {
        super();
        this.initialize();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Initialized the EpnlSettings
     */
    public initialize(): void {
        const today = CalendarDateUtils.checkOverrideAndGetToday();
        this.fromDate = DateValue.newRelativeDate('T-2');
        this.toDate = DateValue.newRelativeDate('T-1');
        this.enableHideLinks = false;
        this.enableBirtSummary = true;
    }

    /**
     * Return false if the passed in EpnlSettings is not equal to this
     * @param otherEpnlSettings
     */
    public equals(otherEpnlSettings: EpnlSettings): boolean {
        if (isNil(otherEpnlSettings)) {
            return false;
        }
        if (this.enableBirtSummary !== otherEpnlSettings.enableBirtSummary) {
            return false;
        }
        if (this.enableHideLinks !== otherEpnlSettings.enableHideLinks) {
            return false;
        }
        if (this.calCode !== otherEpnlSettings.calCode) {
            return false;
        }
        if (!this.fromDate.equals(otherEpnlSettings.fromDate)) {
            return false;
        }
        return this.toDate.equals(otherEpnlSettings.toDate);
    }

    /**
     * Serialize the config to json.
     */
    public serialize(): any {
        const data: any = {};

        if (this.fromDate) {
            data.fromDateValue = this.fromDate.serialize();
        }
        if (this.toDate) {
            data.toDateValue = this.toDate.serialize();
        }
        if (this.enableBirtSummary) {
            data.enableBirtSummary = this.enableBirtSummary;
        }
        if (this.enableHideLinks) {
            data.enableHideLinks = this.enableHideLinks;
        }
        if (this.calCode) {
            data.calCode = this.calCode;
        }
        return data;
    }

    /**
     * Deserialize the json data into this object.
     * @param data
     */
    public deserialize(data: any): void {
        if (!data) {
            return;
        }
        if (!isNil(data.fromDateValue)) {
            this.fromDate = new DateValue(data.fromDateValue);
        }
        if (!isNil(data.toDateValue)) {
            this.toDate = new DateValue(data.toDateValue);
        }
        if (!isNil(data.enableBirtSummary)) {
            this.enableBirtSummary = data.enableBirtSummary;
        }
        if (!isNil(data.enableHideLinks)) {
            this.enableHideLinks = data.enableHideLinks;
        }
        this.calCode = data.calCode;
    }
}
