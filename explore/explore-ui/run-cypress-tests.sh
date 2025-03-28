#!/bin/sh

# Run the tests and capture the exit code
cypress run --project .
exit_code=$?

# Change the permissions
chmod -R 777 ./cypress

# Exit with the captured exit code
exit $exit_code
