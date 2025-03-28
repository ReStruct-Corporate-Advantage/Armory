import {isNumber} from 'lodash';

/**
 * Consar scenario type
 */
export enum ConsarScenarioType {
    REGULAR,
    STRESS
}

export class ConsarScenarioTypeUtils {

    /**
     * Get display name for given scenario type
     * @param type enum
     */
    public static displayName(type: ConsarScenarioType): string {
        let label: string;
        switch (type) {
            case ConsarScenarioType.REGULAR:
                label = 'Regular';
                break;
            case ConsarScenarioType.STRESS:
                label = 'Stress';
                break;
        }

        return label;
    }

    /**
     * Get scenario types
     */
    public static values(): ConsarScenarioType[] {
        const keys = Object.keys(ConsarScenarioType);
        return keys.map(scenarioType => ConsarScenarioType[scenarioType])
            .filter(scenarioType => isNumber(scenarioType));
    }

    /**
     * Get scenario type
     * @param type enum name
     */
    public static valueOf(type: string): ConsarScenarioType {
        return ConsarScenarioType[type];
    }

    /**
     * Get scenario type name
     * @param type enum
     */
    public static typeName(type: ConsarScenarioType): string {
        return ConsarScenarioType[type];
    }
}
