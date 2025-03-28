export interface FavoriteVersionLogDetails {
    version: number;
    id: string; // Favorite versions will always be UUID since they are stored in ADL
    owner: string;
    saveSummaryOnChanges: SaveFavoriteVersionDetailsAndSummary;
    modifiedOn: string;
    modifiedBy: string;
    versionId: string;
}

export interface SaveFavoriteVersionDetailsAndSummary  {
    // High-level summary of the changes made for the favorite.  Limited to 150 characters
    // Example: Updated source of the emissions indicators and updated aggregation.
    changeSummary: string;
    // Detailed summary of the changes made for the favorite.
    // Example: Changed the sources of the emissions indicators from MSCI to Clarity AI. Updated the aggregation option for these columns from Wt Avg to Sum
    changeSummaryDetails: string;
}




