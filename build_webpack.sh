#!/bin/sh

MODE="${1:=development}"
echo "run build with mode $MODE"

echo 'clear old build'
rm -rf dist

echo "------------------------------"
echo "install package"
yarn

echo '------------------------------'
echo 'testing...'
yarn test

echo "------------------------------"
echo 'building...'

npx webpack build --config ./webpack.config.js --mode=$MODE

echo 'build completed'
