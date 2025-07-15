#!/usr/bin/env bash
# wait-for-it.sh

TIMEOUT=15
QUIET=0

usage() {
  exit_code="$1"
  cat << USAGE >&2
Usage: wait-for-it.sh host:port [-t timeout] [-- command]

  -t TIMEOUT | --timeout=TIMEOUT    Timeout in seconds, default is 15
  -q | --quiet                      Don't output any status messages
  -- COMMAND ARGS                   Execute command with args after the host is available

Example:
  wait-for-it.sh localhost:80 -- echo "Web server is up"
USAGE
  exit "$exit_code"
}

wait_for() {
  for i in $(seq $TIMEOUT) ; do
    if nc -z "$HOST" "$PORT" > /dev/null 2>&1 ; then
      if [ $QUIET -eq 0 ] ; then
        echo "$HOST:$PORT is available after $i seconds"
      fi
      return 0
    fi
    sleep 1
  done
  if [ $QUIET -eq 0 ] ; then
    echo "Timeout occurred after $TIMEOUT seconds waiting for $HOST:$PORT"
  fi
  return 1
}

while [ $# -gt 0 ] ; do
  case "$1" in
    *:* ) HOST=$(printf "%s\n" "$1"| cut -d : -f 1)
          PORT=$(printf "%s\n" "$1"| cut -d : -f 2)
          shift 1
          ;;
    -t | --timeout) TIMEOUT="$2"
                    if [ "$TIMEOUT" = "" ] ; then
                      echo "Error: timeout value not specified" >&2
                      usage 1
                    fi
                    shift 2
                    ;;
    -q | --quiet) QUIET=1
                  shift 1
                  ;;
    --) shift 1
        break
        ;;
    -h | --help) usage 0
                 ;;
    *) echo "Error: unknown argument $1" >&2
       usage 1
       ;;
  esac
done

if [ "$HOST" = "" ] || [ "$PORT" = "" ] ; then
  echo "Error: host and port not specified" >&2
  usage 1
fi

wait_for
RESULT=$?

if [ $RESULT -ne 0 ] ; then
  exit $RESULT
fi

exec "$@"
