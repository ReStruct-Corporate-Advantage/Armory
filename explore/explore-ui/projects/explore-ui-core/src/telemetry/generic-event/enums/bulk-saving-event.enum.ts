/**
 * Enum used for bulk saving event details key
 */
export enum BulkSavingEventDetailsKey {
    BULK_SAVING_LEVEL = 'bulkSavingLevel',
    BULK_SAVING_ACTION = 'bulkSavingAction'
}

/**
 * Enum used for BulkSavingLevel
 */
export enum BulkSavingLevel {
    // workspace level saving
    WORKSPACE = 'WORKSPACE',
    // report level saving
    REPORT = 'REPORT'
}

/**
 * Enum used for BulkSavingAction
 */
export enum BulkSavingAction {
    // All saving details are saved.
    SAVE_ALL = 'SAVE_ALL',
    // Only the root level is saved.
    SAVE_ROOT_ONLY = 'SAVE_ROOT_ONLY',
    // Only the root level is saved while other changes are opted out.
    SAVE_ROOT_ONLY_MODIFIED = 'SAVE_ROOT_ONLY_MODIFIED',
    // Some changes are saved and other changes are opted out.
    SAVE_MODIFIED = 'SAVE_MODIFIED',
    // Saving is canceled.
    NO_SAVE = 'NO_SAVE'
}
