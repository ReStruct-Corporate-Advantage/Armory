export interface FundSectoringTableRecord {
    // Portfolio Name or fund cusip
    nodeName: string;

    // Portfolio cusip
    cusip?: string;

    // Portfolio or fund description
    description?: string;

    // Custom sectors to which record is assigned
    assignedCustomSectors?: string;

    // field to specify if this record can be selected
    isSelectable?: boolean;

    // field to specify if this record is selected
    isSelected?: boolean;

    // Specify the node hierarchy of record.
    nodePath?: string[];

    childRecords?: FundSectoringTableRecord[];
}
