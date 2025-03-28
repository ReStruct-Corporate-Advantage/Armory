/**
 * Constants for the Curated Views
 */
export class CuratedViewConstants {

    static readonly FOLDER = 'FOLDER';

    static readonly CURATED_VIEWS = {
        MULTI_ASSET_SUMMARY_FOLDER: 'folder_CURATED_MA_Summary',
        FIXED_INCOME_SUMMARY_FOLDER: 'folder_CURATED_FI_Summary',
        EQUITY_SUMMARY_FOLDER: 'folder_CURATED_EQ_Summary',
        CURATED_ROOT_FOLDER: 'folder_CURATED',
        MULTI_ASSET_ROOT_FOLDER: 'folder_CURATED_MA',
        EQUITY_ROOT_FOLDER: 'folder_CURATED_EQ',
        FIXED_INCOME_ROOT_FOLDER: 'folder_CURATED_FI'
    };

    // Map which maintains the mapping of asset type and analysis type to the folder containing curated view
    static readonly ASSET_TYPE_MAP = {
        BAL_MANDATE: {
            FOLDER: CuratedViewConstants.CURATED_VIEWS.MULTI_ASSET_ROOT_FOLDER,
            SUMMARY: CuratedViewConstants.CURATED_VIEWS.MULTI_ASSET_SUMMARY_FOLDER
        },
        FI_MANDATE: {
            FOLDER: CuratedViewConstants.CURATED_VIEWS.FIXED_INCOME_ROOT_FOLDER,
            SUMMARY: CuratedViewConstants.CURATED_VIEWS.FIXED_INCOME_SUMMARY_FOLDER
        },
        EQ_MANDATE: {
            FOLDER: CuratedViewConstants.CURATED_VIEWS.EQUITY_ROOT_FOLDER,
            SUMMARY: CuratedViewConstants.CURATED_VIEWS.EQUITY_SUMMARY_FOLDER
        }
    };
}
