
# this is example content of the config file ====== vvv
#
# for example save it in swappackagejson.sh

#___ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd -P )"
#
#__PO="$___ROOT/package.json" # original file
#__PT="$___ROOT/package.tmp.json" # temp file
#
#__P0MODE="npm" # this one will be always on
#__P1MODE="webpack"
#
#__P0="$___ROOT/package.$__P0MODE.json"
#__P1="$___ROOT/package.$__P1MODE.json" # this file normally should exist all the time

# this is example content of the config file ====== ^^^

# then run  
#  /bin/bash bash/swap-files.sh -c swappackagejson.sh -m webpack -- cat package.json \&\& ls -la

#echo 'start'
#set -x

___MODE=""
___STOP="0"
___CONFIGFILE=""

PARAMS=""
while (( "$#" )); do
  case "$1" in
    -c|--configfile)
      if [ "$2" = "" ]; then
          echo -e "\n\n$0 error: -c|--configfile parameter value is empty\n\n";
          exit 1;
      fi
      ___CONFIGFILE="$2";
      shift 2;
      ;;
    -m|--mode)
      if [ "$2" = "" ]; then
          echo -e "\n\n$0 error: -m|--mode parameter value is empty\n\n";
          exit 1;
      fi
      ___MODE="$2";
      shift 2;
      ;;
    -s|--stop)
      ___STOP="1";
      shift;
      ;;
    --) # end argument parsing
      shift;
      while (( "$#" )); do
        if [ "$1" = "&&" ]; then
          PARAMS="$PARAMS \&\&"
          _EVAL="$_EVAL &&"
        else
          if [ "$PARAMS" = "" ]; then
            PARAMS="\"$1\""
            _EVAL="\"$1\""
          else
            PARAMS="$PARAMS \"$1\""
            _EVAL="$_EVAL \"$1\""
#          PARAMS="$(cat <<EOF
#$PARAMS
#- "$1"
#EOF
#)"
          fi
        fi
        shift;
      done
      break;
      ;;
    -*|--*=) # unsupported flags
      echo "$0 Error: Unsupported flag $1" >&2
      exit 1;
      ;;
    *) # preserve positional argument
      if [ "$1" = "&&" ]; then
          PARAMS="$PARAMS \&\&"
          _EVAL="$_EVAL &&"
      else
        if [ "$PARAMS" = "" ]; then
            PARAMS="\"$1\""
            _EVAL="\"$1\""
        else
          PARAMS="$PARAMS \"$1\""
            _EVAL="$_EVAL \"$1\""
#          PARAMS="$(cat <<EOF
#$PARAMS
#- "$1"
#EOF
#)"
        fi
      fi
      shift;
      ;;
  esac
done

trim() {
    local var="$*"
    # remove leading whitespace characters
    var="${var#"${var%%[![:space:]]*}"}"
    # remove trailing whitespace characters
    var="${var%"${var##*[![:space:]]}"}"
    echo -n "$var"
}

PARAMS="$(trim "$PARAMS")"
_EVAL="$(trim "$_EVAL")"

# set positional arguments in their proper place
eval set -- "$PARAMS"

if [ "$___CONFIGFILE" = "" ]; then

  echo "$0 Error: -c|--configfile is empty string" >&2

  exit 1;
fi
if ! [ -f "$___CONFIGFILE" ]; then

  echo "$0 Error: -c|--configfile file '$___CONFIGFILE' doesn't exist" >&2

  exit 1;
fi

set -e
source "$___CONFIGFILE"
set +e

if [ "$___MODE" = "" ]; then

    echo -e "\n\n$0 error: parameter ___MODE is not defined - spedify it in -m|--mode parameter to one of values '$__P1MODE' or '$__P0MODE' but it is '$___MODE'\n\n";

    exit 1;
fi


if [ "$__P1MODE" = "" ]; then

    echo -e "\n\n$0 error: '__P1MODE' is not defined in file '$___CONFIGFILE'\n\n";

    exit 1;
fi

if [ "$__P0MODE" = "" ]; then

    echo -e "\n\n$0 error: '__P0MODE' is not defined in file '$___CONFIGFILE'\n\n";

    exit 1;
fi


if [ "$__P0" = "" ]; then

    echo -e "\n\n$0 error: '__P0' is not defined in file '$___CONFIGFILE'\n\n";

    exit 1;
fi


if [ "$__P1" = "" ]; then

    echo -e "\n\n$0 error: '__P1' is not defined in file '$___CONFIGFILE'\n\n";

    exit 1;
fi


if [ "$__PO" = "" ]; then

    echo -e "\n\n$0 error: '__PO' is not defined in file '$___CONFIGFILE'\n\n";

    exit 1;
fi


if [ "$__PT" = "" ]; then

    echo -e "\n\n$0 error: '__PT' is not defined in file '$___CONFIGFILE'\n\n";

    exit 1;
fi

if ! [ -f "$__PO" ]; then

    echo -e "\n\n$0 error: something is not right there should always exist file '$__PO'\n\n";

    exit 1;
fi

if [ "$__P1MODE" = "$__P0MODE" ]; then

    echo -e "\n\n$0 error: '__P1MODE'>>$__P1MODE<< and '__P0MODE'>>$__P0MODE<< defined in file '$___CONFIGFILE' should not be equal\n\n";

    exit 1;
fi

if [ "$___MODE" != "$__P0MODE" ] && [ "$___MODE" != "$__P1MODE" ]; then

  echo "$0 Error: -m|--mode should be '$__P0MODE' or '$__P1MODE' but it is '$___MODE'" >&2

  exit 1;
fi

if [ ! -f "$__P1" ] && [ ! -f "$__P0" ]; then

    echo -e "\n\n$0 error: something is not right there should always exist one of file '$__P1' or '$__P0' \n\n";
fi

if [ -f "$__P1" ] && [ -f "$__P0" ]; then

    echo -e "\n\n$0 error: something is not right there shouldn't exist bot files '$__P1' and '$__P0' at the same time\n\n";
fi

if [ -f "$__PT" ]; then

    echo -e "\n\n$0 error: something is not right there should never exist file '$__PT'\n\n";

    exit 1;
fi

if [ "$___MODE" = "$__P0MODE" ] && [ -f "$__P0" ]; then

  mv "$__PO" "$__PT"

  mv "$__P0" "$__PO"

  mv "$__PT" "$__P1"
fi

if [ "$___MODE" = "$__P1MODE" ] && [ -f "$__P1" ]; then

  mv "$__PO" "$__PT"

  mv "$__P1" "$__PO"

  mv "$__PT" "$__P0"
fi

___EXITCODE="0"

if [[ $# -gt 0 ]]; then

  eval $_EVAL

  ___EXITCODE="$?"
fi

if [ "$___STOP" = "0" ] && [ "$___MODE" = "$__P1MODE" ]; then

  /bin/bash "$0" -m "$__P0MODE" -c "$___CONFIGFILE" -s
fi

exit "$___EXITCODE"