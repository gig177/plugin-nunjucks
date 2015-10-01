#!/bin/bash

cd view
for page in `ls ./pages`; do
    jspm bundle-sfx pages/$page build/$page
done
