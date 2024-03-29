#!/bin/bash

npm run build

git add -A .

echo "Enter commit message"
read msg
echo "commit message = $msg."

git commit -m "$msg."

git push gitlab --all #master
git push github --all #master
git push origin --all #master


git push gitlab --tags 
git push github --tags 
git push origin --tags 
