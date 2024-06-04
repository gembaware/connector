#!/bin/zsh

git commit -a -m $1
sudo git push
echo "[sources update pushed]\n BUILD ---------------------------------------------------"
npm run-script build -- --env.DOMAIN=gembaware.github.io/connector/
echo "[build ended]\n COPY FILES BUILDED --------------------------------------"
find ../../gh-pages-connector -maxdepth 1 -type f -exec rm -fv {} \;
cp -rf dist/. ../../gh-pages-connector
echo "[copy ended]\n DEPLOYMENT ----------------------------------------------"
cd ../../gh-pages-connector
git commit -a -m $2
sudo git push
echo "[deployment done] ----------------------------------------"
cd ../connector/extension

