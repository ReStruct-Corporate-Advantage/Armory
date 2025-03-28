/**
 * This interface will be implemented by column option model for which we want to modify the column title.
 */

export interface ColumnTitleModifiable {
    /**
     * Modify the column title with the column option.
     */
    getModifiedColumnTitle(title: string, widgetType: string): any;
}
