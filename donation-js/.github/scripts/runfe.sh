#!/usr/bin/env

# run yarn start with timeout 30, catch the error code
echo "Running yarn start with timeout 30"
timeout 30 yarn start
EXIT_CODE=$?
# if error code is 124, it means timeout, we exit with 0
if [ $EXIT_CODE -eq 124 ]; then
  echo "Timeout reached"
  exit 0
fi
# throw error code
exit $EXIT_CODE
