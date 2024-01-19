#!/bin/bash

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Install agent dependencies
cd ../agent
go install

# Install docs dependencies
cd ../docs
npm install
cd ..


echo 'Container ready!'