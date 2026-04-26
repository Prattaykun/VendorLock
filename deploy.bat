@echo off
echo ========================================================
echo Deploying VendorLock API to Google Cloud Run...
echo ========================================================

set PROJECT_ID=project-5af0c4b2-88c4-475e-9f1
set REGION=us-central1

echo [1/3] Setting default project to %PROJECT_ID%...
call "%LOCALAPPDATA%\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd" config set project %PROJECT_ID%

echo [2/3] Enabling required Google Cloud APIs...
call "%LOCALAPPDATA%\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd" services enable run.googleapis.com cloudbuild.googleapis.com

echo [3/4] Fixing IAM Permissions for Cloud Build...
call "%LOCALAPPDATA%\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd" projects add-iam-policy-binding %PROJECT_ID% --member="serviceAccount:944168822972-compute@developer.gserviceaccount.com" --role="roles/storage.admin"
call "%LOCALAPPDATA%\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd" projects add-iam-policy-binding %PROJECT_ID% --member="serviceAccount:944168822972-compute@developer.gserviceaccount.com" --role="roles/artifactregistry.admin"

echo [4/4] Building and Deploying to Cloud Run from local code...
call "%LOCALAPPDATA%\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd" run deploy vendorlock-api --source=. --region=%REGION% --allow-unauthenticated --project=%PROJECT_ID%

echo ========================================================
echo Deployment command finished!
echo Reminder: Ensure you set your Environment Variables 
echo (Database, NVIDIA keys) in the Google Cloud Console.
echo ========================================================
pause
