const usePageComponents = CONFIG => {
    let DrawerConfig = [], SidePanelConfig = [], WidgetConfig = [];
    CONFIG && Object.keys(CONFIG).forEach(key => {
        const component = CONFIG[key]
        component.type === "Drawer" && DrawerConfig.push(component);
        component.type === "SidePanel" && SidePanelConfig.push(component);
        component.type === "Widget" && WidgetConfig.push(component);
    });
    if (DrawerConfig.length > 0) {
        DrawerConfig.length > 1 && console.log("You may face unexpected UI results, found multiple Drawer's configs")
        DrawerConfig = DrawerConfig[0];
    } else {
        DrawerConfig = false;
    }
    if (SidePanelConfig.length > 0) {
        SidePanelConfig.length > 1 && console.log("You may face unexpected UI results, found multiple SidePanel's configs")
        SidePanelConfig = SidePanelConfig[0];
    } else {
        DrawerConfig = false;
    }
    WidgetConfig = WidgetConfig.length > 0 ? WidgetConfig : false;
    return {
       DrawerConfig, SidePanelConfig, WidgetConfig
    }
};

export default usePageComponents;