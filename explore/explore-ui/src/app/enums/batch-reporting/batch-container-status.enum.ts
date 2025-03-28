/**
 * Enum class for the batch container status
 */
export enum BatchContainerStatus {
    IDLE = 'IDLE', // This if the default state of the batch container. The container is waiting to load a report in
    PRELOAD = 'PRELOAD', // The batch container has something that it needs to load
    LOADING = 'LOADING', // The batch container's widget(s) are still in a loading data state
    DATA_LOADED_PRE_RENDER = 'DATA_LOADED_PRE_RENDER', // Widget(s) data has loaded and we are waiting to check if the widgets have rendered (ag-grid and highcharts)
    READY = 'READY' // The batch container is finally ready for an export
}
