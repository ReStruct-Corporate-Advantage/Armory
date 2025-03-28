import {ExploreInputValidationInfo} from '../../ui/models/explore-input-validation-info.model';

/**
 * This interface's method will be override by column option model for which we want to validate column options.
 */
export interface ColumnOptionValidatorInterface {

    /**
     * Valid column Options input parameters.
     */
    isValidColumnOption(): ExploreInputValidationInfo;
}
