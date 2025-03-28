Feature: Validate Side Bar functionality

Background:
    Given Explore home page is launched

Scenario: Validate Portfolio can be added from side bar
    When Add Portfolio Modal is opened from side bar
    And portfolio is added from modal
    Then portfolio should get added to side bar

Scenario: Validate Report group can be added to side bar
    When create new group option is selected from side bar
    Then new report group should get added to side bar
