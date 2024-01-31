#!/bin/bash

# Install server dependencies
cd server
npm install

# Install web dependencies
cd ../web
npm install

# Install agent dependencies
cd ../agent
go install

# Install docs dependencies
cd ../docs
npm install
cd ..


echo 'Container ready!'