#!/bin/bash

makesed () {
    sed -i '' -e "s|%PLATFORM_ADDRESS%|${PLATFORM_ADDRESS}|g" $1
    sed -i '' -e "s|%APPNAME%|${APPNAME}|g" $1
    sed -i '' -e "s|%APPDESCRIPTION%|${APPDESCRIPTION}|g" $1
    sed -i '' -e "s|%ENT_ICON%|${ENT_ICON}|g" $1
    sed -i '' -e "s|%ENT_BANNER%|${ENT_BANNER}|g" $1
    sed -i '' -e "s|%RESOURCE_ROOT%|${RESOURCE_ROOT}|g" $1

    sed -i '' -e "s|%CONNECTOR_ID%|${CONNECTOR_ID}|g" $1
    sed -i '' -e "s|%CONNECTOR_SECRET%|${CONNECTOR_SECRET}|g" $1
    sed -i '' -e "s|%CONNECTOR_SCOPE%|${CONNECTOR_SCOPE}|g" $1

    sed -i '' -e "s|%ANDROID_APPNAME%|${ANDROID_APPNAME}|g" $1
    sed -i '' -e "s|%ANDROID_PROJECT_ID%|${ANDROID_PROJECT_ID}|g" $1
    sed -i '' -e "s|%ANDROID_MOBILESDK_APP_ID%|${ANDROID_MOBILESDK_APP_ID}|g" $1
    sed -i '' -e "s|%ANDROID_CLIENT_ID%|${ANDROID_CLIENT_ID}|g" $1
    sed -i '' -e "s|%ANDROID_API_KEY%|${ANDROID_API_KEY}|g" $1

    sed -i '' -e "s|%IOS_APPNAME%|${IOS_APPNAME}|g" $1
    sed -i '' -e "s|%IOS_CLIENT_ID%|${IOS_CLIENT_ID}|g" $1
    sed -i '' -e "s|%IOS_REVERSED_CLIENT_ID%|${IOS_REVERSED_CLIENT_ID}|g" $1
    sed -i '' -e "s|%IOS_API_KEY%|${IOS_API_KEY}|g" $1
    sed -i '' -e "s|%IOS_PROJET_ID%|${IOS_PROJET_ID}|g" $1
    sed -i '' -e "s|%IOS_GOOGLE_APP_ID%|${IOS_GOOGLE_APP_ID}|g" $1
}

export -f makesed
grep --include=*\.{json,html,css,xml,js,plist} --exclude-dir={node_modules,lib,platforms} -rl . -e "%[A-Z_]*%" | xargs -0 bash -c 'makesed "$@"' _