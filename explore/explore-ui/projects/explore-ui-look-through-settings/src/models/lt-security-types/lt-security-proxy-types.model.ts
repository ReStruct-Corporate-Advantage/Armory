import {Setting} from '@blk/explore-ui-core';

export class LtSecurityProxyTypes extends Setting {

    /**
     * Lt Security class variable
     */
    description: string;
    name: string;
    selected: boolean;

    constructor(data?: any) {
        super(data);
    }

    /**
     * LtSecurityProxyType mapping into appropriate models
     */
    static createLtSecurityProxyTypeMapping(ltSecurityTypes: any): Array<LtSecurityProxyTypes> {
        const ltSecurityProxyType: Array<LtSecurityProxyTypes> = [];
        for (const ltSecurityProxy of ltSecurityTypes.ltSecurityProxyTypesArray) {
            ltSecurityProxyType.push(new LtSecurityProxyTypes(ltSecurityProxy));
        }
        return ltSecurityProxyType;
    }

    /**
     * doDeserialize
     */
    doDeserialize(data: any): void {
        this.description = data.description;
        this.name = data.name;
        this.selected = data.selected;
    }


}
