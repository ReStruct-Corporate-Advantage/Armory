Feature: Visual Comparison tests for breakdown settings

Background:
    Given "Bar Chart" with column option is added to a report for portfolio "SNP100" with date "20230202"

Scenario: Validate bar chart split columns with no breakdown settings
    When I open widget settings modal from "Bar Chart"
    And I click measures tab
    And I add column "ROE (%)"
    Then "ROE (%)" column is present in selected columns
    And I click breakdown tab
    And I select No breakdown radio option in Sector Breakdown
    And I select No breakdown radio option in Stacked Breakdown
    And I apply widget settings
    And I maximize widget
    Then "Bar Chart" should be displayed, aligning with the snapshot "barChart_SNP100_with_no_breakdown"