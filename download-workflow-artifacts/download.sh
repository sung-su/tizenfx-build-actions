#!/bin/bash -e

error() {
  echo $1; exit 1
}

[ -z "$ART_REPO" ] && error "no ART_REPO in env"
[ -z "$ART_RUNID" ] && error "no ART_RUNID in env"
[ -z "$ART_TOKEN" ] && error "no ART_TOKEN in env"
[ -z "$ART_PATH" ] && error "no ART_PATH in env"
[ -z "$ART_UNZIP" ] && error "no ART_UNZIP in env"

ART_JSON=$(curl -s -u x:$ART_TOKEN https://api.github.com/repos/$ART_REPO/actions/runs/$ART_RUNID/artifacts)

ITEMS=$(echo $ART_JSON | jq -r '.artifacts[] | .name + "," + .archive_download_url')

TMP_PATH=$ART_PATH/.tmp_zip_files
mkdir -p $TMP_PATH

for item in $ITEMS; do

  IFS=',' read -r name url <<< $item

  if [ -n "$ART_NAME" ] && [ "$ART_NAME" != "$name" ]; then
    continue
  fi

  curl -L -o $TMP_PATH/$name.zip -u x:$ART_TOKEN $url

  if [ $ART_UNZIP == "true" ]; then
    unzip -d $ART_PATH $TMP_PATH/$name.zip
  else
    mv $TMP_PATH/$name.zip $ART_PATH/$name.zip
  fi

done

rm -fr $TMP_PATH
