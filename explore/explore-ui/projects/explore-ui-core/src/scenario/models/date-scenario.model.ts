import {isNil} from 'lodash';
import {CommonUtils} from '../../core/utils';
import {DateFormatConstants} from '../../date/constants';
import {DateValue} from '../../date/models/date-value/date-value.model';
import {AbstractScenario} from '../../definition/models/scenario/abstract-scenario.model';
import {SerializeFavoriteType} from '../../favorite/enums';
import moment from 'moment';

/**
 * Class to represent the date scenario information.
 */
export class DateScenario extends AbstractScenario {

    /**
     * Unique id to identify this scenario.
     */
    id: string;

    /**
     * The from date of the scenario.
     */
    fromDate: DateValue;

    /**
     * The to date of the scenario.
     */
    toDate: DateValue;

    holdingPeriodOverride: number;

    dxsShockUnit: string;

    /**
     * Constructor.
     */
    constructor(data?: any) {
        super();
        if (!isNil(data)) {
            this.deserialize(data);
        }

        // If there is no id then generate one.
        // NOTE:  This is done after the deserialize above so that if there was an existing one in the serialized version it is kept.
        if (isNil(this.id)) {
            this.id = 'date' + CommonUtils.generateUniqueIdAsNumber();
        }
    }

    /**
     * Gets the generated code for this date scenario.
     */
    get code(): string {
        return 'HIST_' + this.toDate.format(DateFormatConstants.YYYYMMDD) + '_' + this.fromDate.format(DateFormatConstants.YYYYMMDD);
    }

    /**
     * Gets the generated name for this date scenario.
     */
    get name(): string {
        return this.fromDate.format(DateFormatConstants.YYYYMMDD) + '-' + this.toDate.format(DateFormatConstants.YYYYMMDD);
    }

    /**
     * Gets the generated code for this date scenario.
     */
    get description(): string {
        // This always seems to be blank, so need to figure out if it is needed.
        return '';
    }

    /**
     * Serialize the config to json.
     */
    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        const data: any = {
            type: 'DateRange',  // Not sure if we actually need this but seems to be stored int he favorite.
            id: this.id,

            // TODO:  See if this additional data can be removed.
            data: {
                fromDate: this.fromDate.serialize(),
                toDate: this.toDate.serialize()
            },
            scenCode: this.code,
            scenDescription: this.description,
            scenName: this.name,
            enableDateRange: this.enabled
        };
        if (this.dxsShockUnit) {
            data.dxsShockUnit = this.dxsShockUnit;
        }
        if (this.holdingPeriodOverride) {
            data.holdingPeriodOverride = this.holdingPeriodOverride;
        }
        return data;
    }

    /**
     * Deserialize the json data into this object.
     */
    deserialize(data: any): void {
        this.id = data.id;
        this.fromDate = new DateValue(data.data.fromDate);
        this.toDate = new DateValue(data.data.toDate);
        this.enabled = data.enableDateRange;
        if (data.dxsShockUnit) {
            this.dxsShockUnit = data.dxsShockUnit;
        }
        if (data.holdingPeriodOverride) {
            this.holdingPeriodOverride = data.holdingPeriodOverride;
        }
    }

    setDateRangeStressScenarioParams(data: any): void {
        if (isNil(data)) {
            return;
        }
        if (data.startDate) {
            const startDate = moment(data.startDate).format(DateFormatConstants.MMDDYYYY_SLASH);
            this.fromDate = DateValue.newDate(startDate);
        }
        if (data.forDate) {
            const forDate = moment(data.forDate).format(DateFormatConstants.MMDDYYYY_SLASH);
            this.toDate = DateValue.newDate(forDate);
        }
        if (data.holdingPeriodOverride) {
            this.holdingPeriodOverride = data.holdingPeriodOverride;
        }
        if (data.dxsShockUnit) {
            this.dxsShockUnit = data.dxsShockUnit;
        }
    }
}
