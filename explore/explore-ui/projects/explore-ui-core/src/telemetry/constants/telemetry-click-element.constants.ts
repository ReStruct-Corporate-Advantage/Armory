/**
 * Constants for Telemetry clickable elements
 */
export class ClickElemConstants {
    // All source types
    static readonly SOURCE = {
        WIDGET: 'WIDGET',
        SIDE_BAR: 'SIDE BAR',
        ADD_PORTFOLIO_MODAL: 'ADD PORTFOLIO MODAL',
        REPORT_TAB: 'REPORT TAB'
    };

    // All context paths
    static readonly CONTEXT_PATH = {
        WIDGET_RIGHT_CLICK: 'WIDGET RIGHT CLICK',
        ADD_REPORT_GRP_BTN_CLICK: 'ADD REPORT GROUP BUTTON CLICK',
        REPORT_GRP_MENU_CLICK: 'REPORT GROUP MENU CLICK',
        PORTFOLIOS_MENU_BAR: 'PORTFOLIOS MENU BAR CLICK',
        PLUS_WIDGET : {
            PLUS_ICON_CLICK: 'PLUS WIDGET PLUS ICON CLICK',
            MORE_LINK_CLICK: 'PLUS WIDGET MORE LINK CLICK',
            ADD_WIDGET_BUTTON_CLICK: 'PLUS WIDGET ADD WIDGET BUTTON CLICK'
        }
    };
}
