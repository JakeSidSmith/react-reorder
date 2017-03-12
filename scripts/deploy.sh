#!/usr/bin/env bash

BRANCH=gh-pages # Branch to deploy to, probably gh-pages
DIST_DIR=examples  # Location of build static files to deploy
DEPLOY_DIR=site_deploy  # Temp directory to clone to during deployment
USERNAME=JakeSidSmith  # Repo account username
REPO=react-reorder  # repo name


if [[ -z "$GH_TOKEN" ]]; then
  echo "> No Github token found!"
  exit 1
fi

if [ ! -d "$DIST_DIR" ]; then
  echo "> Can't find dist directory, aborting..."
  exit
fi

set -e

echo "> Starting deployment to Github Pages"

# Setup Details for deploy commit

# Clone existing deployment branch into temp directory
mkdir $DEPLOY_DIR
git clone --depth=1 --quiet --branch=$BRANCH --single-branch https://${GH_TOKEN}@github.com/${USERNAME}/${REPO}.git $DEPLOY_DIR

# Copy new static build into temp directory
rsync -rv $DIST_DIR/* circle.yml --exclude=src/* $DEPLOY_DIR

# Commit changes
cd $DEPLOY_DIR
git config user.email "jake@dabapps.com"
git config user.name "Automated Example Deployer"
git add -f .
git commit -m "Deployment - build $CIRCLE_BUILD_NUM"

# Deploy to branch
git push -fq origin $BRANCH

echo "> Deployment completed."

# Cleanup
rm -rf $DEPLOY_DIR
