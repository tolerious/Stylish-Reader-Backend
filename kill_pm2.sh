#!/bin/bash

RUNNING_PROCESSES=$(pm2 jlist | jq '[.[] | select(.pm2_env.status == "online")] | length')

if [ "$RUNNING_PROCESSES" -gt 0 ]; then
  pm2 stop all
  pnpm i
  pm2 start --env=production
  echo "Stopped all running PM2 processes."
else
  echo "No running PM2 processes to stop."
fi
