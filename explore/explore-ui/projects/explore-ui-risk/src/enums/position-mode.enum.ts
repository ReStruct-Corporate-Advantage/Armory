import {isNumber} from 'lodash';

export enum PositionModeType {
    AS_OF_W,
    AS_IS_W,
    GPX
}

export class PositionModeUtil {

    public static getDisplayName(positionMode: PositionModeType): string {
        switch (positionMode) {
            case PositionModeType.GPX:
                return 'GPX';
            case PositionModeType.AS_IS_W:
                return 'W As-Is';
            case PositionModeType.AS_OF_W:
                return 'W As-Of';
        }
    }

    public static values(): PositionModeType[] {
        const keys = Object.keys(PositionModeType);
        return keys.map(positionMode => PositionModeType[positionMode])
                   .filter(positionMode => isNumber(positionMode));
    }

    public static valueOf(type: string): PositionModeType {
        return PositionModeType[type];
    }

    public static typeName(type: PositionModeType): string {
        return PositionModeType[type];
    }
}
