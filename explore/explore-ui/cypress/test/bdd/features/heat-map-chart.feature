Feature: Visual Comparison tests for heat Map

Background:
     Given "Heat Map" with default settings is added to a report for portfolio "BGO" with date "20190611"

Scenario: Validate heat map  is loading     
    When I maximize widget
    Then "Heat Map - Notional Market Value %" should be displayed, aligning with the snapshot "heatmap_default"