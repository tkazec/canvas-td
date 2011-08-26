#!/bin/bash
# $ bash build.sh containerdir googleanalyticsacc

TIME=`date +%s`
SRCDIR="$( cd "$( dirname "$0" )" && pwd )"
OUTDIR="$1/canvas-td"
GA=$2

rm -rf $OUTDIR
cp -R $SRCDIR $OUTDIR
cd $OUTDIR

rm build.sh
rm -rf .git

#sed -i '' -e 's/<html/& manifest="manifest.appcache"/' index.html # disabled for now due to complications
sed -i '' -e "s/##GA##/$GA/" index.html
sed -i '' -e '/\.js"><\/script>/d' -e 's/<script src/<script src="index.js"><\/script>&/' index.html
echo "#$TIME" >> manifest.appcache

yuicompressor -o index.css index.css

closure --language_in ECMASCRIPT5 --js helpers.js --js game.js --js maps/data.js --js turrets/data.js --js ui.js --js_output_file index.js