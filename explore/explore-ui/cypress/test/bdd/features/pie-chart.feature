Feature: Visual Comparison tests for pie chart

Background:
     Given "Pie Chart" with default settings is added to a report for portfolio "BGO" with date "20190611"

Scenario: Validate pie chart is loading     
    When I maximize widget
    Then "Pie Chart" should be displayed, aligning with the snapshot "piechart_with_baseline"