#!/bin/bash
# $ bash build.sh outdir ga-id

SRCDIR="$( cd "$( dirname "$0" )" && pwd )"
OUTDIR=$1
GAID=$2

rm -rf $OUTDIR
cp -R $SRCDIR $OUTDIR
cd $OUTDIR

mv images/favicon.ico favicon.ico

sed -i '' -e "s/##GAID##/$GAID/" index.html
sed -i '' -e '/\.js"><\/script>/d' -e 's/<script src/<script src="index.js"><\/script>&/' index.html

yuicompressor -o index.css index.css

closure-compiler --language_in ECMASCRIPT5 --js scripts/utils.js --js scripts/defs.js --js scripts/game.js --js scripts/ui.js --js_output_file index.js

rm -rf .git
rm -r scripts
rm build.sh