# Create the frontend service

## Set up the code

First set up the code for the React frontend service.

Ensure that you have `node` and `npm` installed. Verify that you have node version 18 installed. If you have `nvm` you can enable this version of node:
````bash
cd frontend
nvm use node 18
# Now using node v18.15.0 (npm v9.5.0)
node --version
# v18.15.0
````

Install packages for the project:
````bash
npm install
````

Add a `.env` file for local testing:
````bash
PORT=3001
REACT_APP_BACKEND_SERVICE_URL=http://localhost:3000
````

Now we update the code for the NGINX router service.
````bash
cd ../router
````

Add a `.env` file for local testing:
````bash
FRONTEND_SERVICE=localhost:3001
BACKEND_SERVICE=localhost:3000
````

## Test the service

Spin up the docker container locally and test it. Ensure you have `Docker` installed:
````bash
docker --version
# Docker version 24.0.6, build ed223bc
````

Ensure that you are in the working directory with both `/frontend` and `/router` folders:
````bash
ls
# docker-compose.yaml     frontend                readme.md               router
# .
# |-frontend
# |-router
# |-docker-compose.yaml
# |-readme.md
````

Call docker compose to create the service:
````bash
docker compose up

# [+] Building 0.0s (0/0)
# docker:desktop-linux
# [+] Running 1/0
#  ✔ Container backend-backend_service-1
# Created     0.0s 
# Attaching to backend-backend_service-1
# backend-backend_service-1  | 
# backend-backend_service-1  | > serve
# backend-backend_service-1  | > node app.js
# backend-backend_service-1  | 
# backend-backend_service-1  | Starting up Node Express, build version 00013
# backend-backend_service-1  | Server running on port 3000
# backend-backend_service-1  | Environment: development
# backend-backend_service-1  | CORS origin allowed: http://localhost:3001
# backend-backend_service-1  | Connected to Snowflake account
````

In a new terminal window, use `curl` to access the `/test` route:
````bash
curl http://localhost:3000/test
# {"Snowflake OAuth token":false}
````

## Build and push the docker image to Snowflake image repository

Ensure that the Snowflake image repository is set up, then run:
```sql
SHOW IMAGE REPOSITORIES;
```
| created_on | name | database_name | schema_name | repository_url | owner | owner_role_type | comment |
|---|---|---|---|---|---|---|---|
| ... | TASTY_APP_REPOSITORY | FROSTBYTE_TASTY_BYTES | APP | _account_name_.registry.snowflakecomputing.com/frostbyte_tasty_bytes/app/tasty_app_repository | TASTY_APP_ADMIN_ROLE | ROLE	

````bash
export repo_url={INSERT REPOSITORY URL FROM 'SHOW IMAGE REPOSITORIES' HERE}

docker login ${repo_url} -u {INSERT SNOWFLAKE USER NAME}
password? {ENTER SNOWFLAKE USER PASSWORD}
````

Now we can build, tag and push the image to the Snowflake Image Repository:
````bash
./build-frontend.sh

# Hint: you may need to run chmod + build-backend.sh to be able to execute the script
````
You should see the image being build and then pushed to the remote repository. 


## Spin up the serivice on Snowflake

Now go to Snowflake and set up the service. You need to have set  up all other Snowflake pre-requisites before this (COMPUTE POOL, SECURITY INTEGRATION)
```sql
USE DATABASE frostbyte_tasty_bytes;
USE WAREHOUSE tasty_app_warehouse;

CREATE SERVICE frontend_service
  IN COMPUTE POOL tasty_app_compute_pool
  FROM SPECIFICATION $$
spec:
  container:
  - name: frontend
    image: /frostbyte_tasty_bytes/app/tasty_app_repository/frontend_service_image:tutorial
    env:
      FRONTEND_SERVICE_PORT: 4000
      REACT_APP_BACKEND_SERVICE_URL: /api
  - name: router
    image: /frostbyte_tasty_bytes/app/tasty_app_repository/router_service_image:tutorial
    env:
      ROUTER_PORT: 8888
      FRONTEND_SERVICE: localhost:4000
      BACKEND_SERVICE: backend-service:3000
      REACT_APP_CLIENT_VALIDATION: Snowflake
  endpoint:
  - name: routerendpoint
    port: 8000
    public: true
$$
  MIN_INSTANCES=1
  MAX_INSTANCES=1
;
GRANT USAGE ON SERVICE frontend_service TO ROLE spcs_ext_role;
```