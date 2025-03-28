Feature: Visual Comparison tests for chart formats (bar chart)

Background:
    Given "Bar Chart" with default settings is added to a report for portfolio "BGO" with date "20190611"

Scenario: Validate bar chart with chart type settings
    When I open widget settings modal from "Bar Chart"
    And I click format tab
    And I select chart type "Marker" for column "0"
    And I apply widget settings
    And I maximize widget
    Then "Bar Chart" should be displayed, aligning with the snapshot "barChart_with_marker"
    
Scenario: Validate bar chart with baseline settings (baseline checkbox is checked OFF by default)
    When I open widget settings modal from "Bar Chart"
    And I click format tab
    And I click baseline checkbox (CHECK)
    And I apply widget settings
    And I maximize widget
    Then "Bar Chart" should be displayed, aligning with the snapshot "barChart_with_baseline"

    When I open widget settings modal from "Bar Chart"
    And I click format tab
    And I click baseline checkbox (UNCHECK)
    And I apply widget settings
    Then "Bar Chart" should be displayed, aligning with the snapshot "barChart_without_baseline"

Scenario: Validate bar chart with grid lines settings (grid lines checkbox is checked ON by default)
    When I open widget settings modal from "Bar Chart"
    And I click format tab
    And I click grid lines checkbox (UNCHECK)
    And I apply widget settings
    And I maximize widget
    Then "Bar Chart" should be displayed, aligning with the snapshot "barChart_without_gridlines"

    When I open widget settings modal from "Bar Chart"
    And I click format tab
    And I click grid lines checkbox (CHECK)
    And I apply widget settings
    Then "Bar Chart" should be displayed, aligning with the snapshot "barChart_with_gridlines"

Scenario: Validate bar chart with orientation settings (set to vertical by default)
    When I open widget settings modal from "Bar Chart"
    And I click format tab
    And I select Horizontal radio option
    And I apply widget settings
    And I maximize widget
    Then "Bar Chart" should be displayed, aligning with the snapshot "barChart_with_horizontal_orientation"

    When I open widget settings modal from "Bar Chart"
    And I click format tab
    And I select Vertical radio option
    And I apply widget settings
    Then "Bar Chart" should be displayed, aligning with the snapshot "barChart_with_vertical_orientation"