import {isNil} from 'lodash';
import {Security} from '@interfaces/security.interface';

export class SecurityUtils {
    static calculateNav(selectedSecurities: Map<string, Security>, designatedValuesForCusips: Map<string, number>): string {
        if (isNil(selectedSecurities) || isNil(designatedValuesForCusips)) {
            return '0';
        }
        let designateValue = 0;
        for (const key of selectedSecurities.keys()) {
            designateValue += isNil(designatedValuesForCusips[key]) ? 0 : designatedValuesForCusips[key];
        }
        return designateValue.toString();
    }
}
