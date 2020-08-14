#!/bin/bash -e

if [ -z "$ARTIFACTS" -o -z "$GITHUB_PAT" -o -z "TARGET_PATH" -o -z "$DO_UNZIP" ]; then
  echo "no required environment variables."
  exit 1
fi

type=$(echo $ARTIFACTS | jq -r '. | type')

if [ $type == "object" ]; then
  tsv=$(echo $ARTIFACTS | jq -r '.name + "," + .archive_download_url')
elif [ $type == "array" ]; then
  tsv=$(echo $ARTIFACTS | jq -r '.[] | .name + "," + .archive_download_url')
fi

TMP_PATH=$TARGET_PATH/.tmp_zip_files
mkdir -p $TMP_PATH

for item in $tsv; do
  IFS=',' read -r name url <<< $item
  curl -L -o $TMP_PATH/$name.zip -u x:$GITHUB_PAT $url
  if [ $DO_UNZIP == "true" ]; then
    unzip -d $TARGET_PATH $TMP_PATH/$name.zip
  else
    mv $TMP_PATH/$name.zip $TARGET_PATH/$name.zip
  fi
done

rm -fr $TMP_PATH
