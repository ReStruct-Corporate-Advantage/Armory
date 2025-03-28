import {isNil} from 'lodash';
import {OverrideDateColumnOption} from './override-date-column-option.model';
/**
 * Override Column Options Model
 */
export class EconomyExposureDateVaryColumnOptionModel extends OverrideDateColumnOption {

    public static CONFIG_TYPE = 'economyExposureSettings';

    /**
     * Gets the type of the config object.
     */
    get configType(): string {
        return EconomyExposureDateVaryColumnOptionModel.CONFIG_TYPE;
    }

    isValid(): boolean {
        return !isNil(this.dateType);
    }
}

