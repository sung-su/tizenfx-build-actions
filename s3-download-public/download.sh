#!/bin/bash -e

error() {
  echo $1; exit 1
}

[ -z "$S3_REGION" ] && error "no S3_REGION in env"
[ -z "$S3_BUCKET" ] && error "no S3_BUCKET in env"
[ -z "$S3_OBJKEY" ] && error "no S3_OBJKEY in env"
[ -z "$S3_PATH" ] && S3_PATH=$S3_OBJKEY

TARGET_DIR=$(dirname $S3_PATH)
if [ ! -d $TARGET_DIR ]; then
    mkdir -p $TARGET_DIR
fi

CODE=$(curl -s -w "%{http_code}" -o $S3_PATH "https://$S3_BUCKET.s3.$S3_REGION.amazonaws.com/$S3_OBJKEY")

if [ "$CODE" != "200" ]; then
    rm -f $S3_PATH
fi

echo "::set-output name=code::$CODE"