/**
 * Enum for different modelling type
 */
export enum ModellingType {
    SECTOR = 0, // Sector level modelling changes
    POSITION = 1, // Security/Position level modelling changes
    PORTFOLIO = 2, // This option will be used for port groups to perform portfolio modelling
    EXPOSURE = 3 // This option will be used for factor exposure based modelling
}
