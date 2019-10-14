#!/bin/bash

git add -A .
git commit -m "."

git push origin master
git push gitlab master
git push github master

