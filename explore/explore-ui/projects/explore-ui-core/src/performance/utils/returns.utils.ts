import {PraadaFactor} from '../../definition/models/praada-meta-data/praada-factor.model';
import {isEmpty} from 'lodash';

export class ReturnsUtils {

    /**
     * From the passed in selected factors identify which are present in factor list and return them
     */
    static getFactorsPresentInFactorList(selectedFactors: string[], factorList: PraadaFactor[]): string[] {
        const factorsPresentInFactorList: string[] = [];
        if (isEmpty(selectedFactors)) {
            return factorsPresentInFactorList;
        }

        factorList.forEach(factor => {
            if (selectedFactors.indexOf(factor.value) !== -1) {
                factorsPresentInFactorList.push(factor.value);
            }
        });
        return factorsPresentInFactorList;
    }
}
