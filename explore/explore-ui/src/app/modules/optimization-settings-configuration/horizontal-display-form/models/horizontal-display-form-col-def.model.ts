// simplified version of ColDef
export interface HorizontalDisplayFormColDef {
    field: string;
    headerName: string;
    /**
     * aux column types
     */
    type?: string;
    /**
     * if populated, will show field value based on whether the value of the other field specified here is true
     */
    dependsOn?: string;
}
