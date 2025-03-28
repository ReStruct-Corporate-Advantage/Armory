Feature: Visual Comparison tests for tree Map

    Background:
        Given "Tree Map" with default settings is added to a report for portfolio "BGO" with date "20190611"
    
    Scenario: Validate tree map  is loading     
        When I maximize widget
        Then "Tree Map - Market Value" should be displayed, aligning with the snapshot "treemap_default"