Feature: Visual Comparison tests for Slope Graph

    Background:
        Given "Slope Graph" with default settings is added to a report for portfolio "BGO" with date "20190611"

    Scenario: Validate slope Graph  is loading     
        When I maximize widget
        Then "Slope Graph" should be displayed, aligning with the snapshot "slopegraph_default"