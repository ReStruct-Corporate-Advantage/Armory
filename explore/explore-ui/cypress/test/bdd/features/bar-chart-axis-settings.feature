Feature: Visual Comparison tests for axis settings

Background:
    Given "Bar Chart" with default settings is added to a report for portfolio "BGO" with date "20190611"

Scenario: Validate bar chart with primary Y axis title override settings
    When I open widget settings modal from "Bar Chart"
    And I click axis tab
    And I click hide axis title checkbox on primary axis (CHECK)
    And I apply widget settings
    And I maximize widget
    Then "Bar Chart" should be displayed, aligning with the snapshot "barChart_without_primary_yaxis_title"

    When I open widget settings modal from "Bar Chart"
    And I click axis tab
    And I click hide axis title checkbox on primary axis (UNCHECK)
    And I apply widget settings
    Then "Bar Chart" should be displayed, aligning with the snapshot "barChart_with_primary_yaxis_title"

    When I open widget settings modal from "Bar Chart"
    And I click axis tab
    And I type in "TITLE UPDATED" on Primary axis override text input
    And I apply widget settings
    Then "Bar Chart" should be displayed, aligning with the snapshot "barChart_with_overridden_primary_yaxis_title"

Scenario: Validate bar chart with primary Y axis bound settings
    When I open widget settings modal from "Bar Chart"
    And I click axis tab
    And I type in "60" on Maximum bound input mask
    And I apply widget settings
    And I maximize widget
    Then "Bar Chart" should be displayed, aligning with the snapshot "barChart_with_overridden_max_bound"

    When I open widget settings modal from "Bar Chart"
    And I click axis tab
    And I type in "0" on Minimum bound input mask
    And I apply widget settings
    Then "Bar Chart" should be displayed, aligning with the snapshot "barChart_with_overridden_min_bound"

    When I open widget settings modal from "Bar Chart"
    And I click axis tab
    And I type in "30" on Interval input mask
    And I apply widget settings
    Then "Bar Chart" should be displayed, aligning with the snapshot "barChart_with_overridden_interval"