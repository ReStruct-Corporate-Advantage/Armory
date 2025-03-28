import {LtSecurityProxyTypes} from './lt-security-proxy-types.model';

export class LtSecurityTypes extends LtSecurityProxyTypes {

    varEquivalent: string;

    constructor(data?: any) {
        super(data);
    }

    /**
     * LtSecurityType mapping into appropriate models
     */
    static createLtSecurityTypeMapping(ltSecurityTypes: any) : Array<LtSecurityTypes>{
        const ltSecurityType: Array<LtSecurityTypes> = [];
        for (const ltSecurity of ltSecurityTypes.LtSecurityTypesArray) {
            ltSecurityType.push(new LtSecurityTypes(ltSecurity));
        }

        return ltSecurityType;
    }

    /**
     * doDeserialize
     */
    doDeserialize(data: any): void {
        super.doDeserialize(data);
        this.varEquivalent = data.varEquivalent;
    }


}
