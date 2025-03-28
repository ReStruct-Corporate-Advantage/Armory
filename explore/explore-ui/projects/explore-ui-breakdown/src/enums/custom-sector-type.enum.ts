/**
 * Enum for Custom Sector Types
 */
export enum CustomSectorType {
    ATTRIBUTES = 'Attributes',
    FUND = 'Fund',
    INDEX = 'Index',
    PORTFOLIO = 'Portfolio',
}

export namespace CustomSectorType {

    export function values(): string[] {
        return Object.keys(CustomSectorType).filter(
            (type) => isNaN(<any>type) && type !== 'values'
        );
    }
}
