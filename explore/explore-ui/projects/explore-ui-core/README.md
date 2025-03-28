# Explore UI - Core Library

#### This library contains following modules -
    Scenario
    Ex-post
    Performance
    Column
    WidgetConfig
    Date
    Definition
    UserMetaData
    Favorite
    Ui
    Core

## Module Hierarchy
#### ** The components/services/models/utils/etc on the lower level module should not import things from the higher level to prevent circular dependencies.
#### Eg> The files from Scenario modules imports things from Date, Ui, Definition, and Core modules - but not vice versa.
    Scenario > Date, Ui, Definition, Core
    Expost > Core, Date, WidgetConfig
    Performance > Definition, Core, WidgetConfig, Column, Date, Ui
        Column > Ui, Core, WidgetConfig
        WidgetConfig > Date, Core, Risk, Favorite
            Date > Definition, Ui, Core
                Definition > Favorite, UserMetaData, Core
                    UserMetaData
                    Favorite > Ui, Core
                        Ui > Core
                            Core
### Core Library Styles
#### Consumers of @blk/explore-ui-core library must import library global styling into their application's styles.scss
    @use '@blk/explore-ui-core/styles/core-styles';
