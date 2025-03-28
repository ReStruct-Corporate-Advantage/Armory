import {isNumber} from 'lodash';

export enum FilterScaling {
    PORTFOLIO_NAV,
    SECTOR_NOTIONAL_MARKET_VALUE
}

export class FilterScalingUtil {

    public static getDisplayName(filterScaling: FilterScaling): string {
        switch (filterScaling) {
            case FilterScaling.PORTFOLIO_NAV:
                return 'Scale benchmark NAV to portfolio NAV';
            case FilterScaling.SECTOR_NOTIONAL_MARKET_VALUE:
                return 'Scale benchmark NAV to sector notional market value';
        }
    }

    public static values(): FilterScaling[] {
        const keys = Object.keys(FilterScaling);
        return keys.map(positionMode => FilterScaling[positionMode])
                   .filter(positionMode => isNumber(positionMode));
    }

    public static valueOf(type: string): FilterScaling {
        return FilterScaling[type];
    }

    public static typeName(type: FilterScaling): string {
        return FilterScaling[type];
    }
}
