#!/bin/bash

npm run build

git add -A .
git commit -m "."

git push origin master
git push gitlab master
git push github master

