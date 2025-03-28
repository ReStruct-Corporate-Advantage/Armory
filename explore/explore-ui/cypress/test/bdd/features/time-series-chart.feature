Feature: Visual Comparison tests for time series chart

Background:
     Given "Time Series Chart" with default settings is added to a report for portfolio "BGO" with date "20190611"

Scenario: Validate time series chart with chart type settings
    When I open widget settings modal from "Time Series Chart"
    And I click format tab
    And I select chart type "Marker" for column "0"
    And I apply widget settings
    And I maximize widget
    Then "Time Series Chart" should be displayed, aligning with the snapshot "timeSeriesChart_with_marker"

Scenario: Validate time series chart is loading     
    When I maximize widget
    Then "Time Series Chart" should be displayed, aligning with the snapshot "timeseries_default_settings"