// simplified version of ColDef
export interface OptimizationColDef {
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

    /**
     * AuxGrid filter type. When set would use old aux-grid filtering instead of native ag-grid filters.
     */
    filter?: string;
}
