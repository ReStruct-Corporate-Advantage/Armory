/**
 * Enum class for batch row download status
 */
export enum BatchRowDownloadStatus {
    NONE = '', // This reflects a state when the batch row has no download status
    IN_PROGRESS = 'In progress', // BatchRow download is in progress
    COMPLETED = 'Completed', // BatchRow download completed
    PARTIAL = 'Partial', // BatchRow partially downloaded (some widgets skipped)
    FAILED = 'Failed', // BatchRow download failed
    CANCELED = 'Canceled' // BatchRow canceled
}
