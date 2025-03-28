import {SecuritySearchItem} from '@interfaces/security-search-item.interface';

export interface DesignateValueList {
    securitySearchItems: SecuritySearchItem[];
    designateValue: Map<string, number>;
}
