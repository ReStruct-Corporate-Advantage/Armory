Feature: Validate Look-through Settings

Background:
    Given Portfolio is loaded for historical bussiness day
    When Navigate to portfolio settings

Scenario: Validate look-through is disabled
    When look-through is disabled
    Then components should be disabled

Scenario: Validate look-through is enabled
    When look-through is enabled
    Then components in look-through settings should be enabled

Scenario: Validate security proxies
    When portfolio look-through is enabled
    Then desired proxies are enabled

Scenario: Validate sources
    When Available sources are changed
    Then changed source settings are respected
