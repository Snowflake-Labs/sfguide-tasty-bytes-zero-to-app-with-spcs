# Create the backend service

## Set up the code
Ensure that you have `node` and `npm` installed. Verify that you have node version 18 installed. If you have `nvm` you can enable this version of node:
````bash
npm use node 18
node --version
# v18.15.0
````

Update `package.json`, add `scripts` with:
````json
{
  "scripts": {
    "serve": "node app.js",
    "dev": "nodemon app.js"
  }
}
````
You can do this by copying the `package.json.template` to `package.json`
````bash
cp packages.json.template packages.json
````

Install packages for the project:
````bash
npm i express dotenv cors bcryptjs body-parser cors jsonwebtoken snowflake-sdk --save
npm i nodemon --save-dev
````


Add a `.env` file for local testing, with the following content (replace everything in `{ ... }` with actual values for your account):
````bash
SNOWFLAKE_ACCOUNT={INSERT ACCOUNT LOCATOR}
SNOWFLAKE_USERNAME={INSERT USER NAME}
SNOWFLAKE_PASSWORD={INSERT PASSWORD}
SNOWFLAKE_ROLE=TASTY_APP_ADMIN_ROLE
SNOWFLAKE_WAREHOUSE=TASTY_APP_WAREHOUSE
SNOWFLAKE_DATABASE=FROSTBYTE_TASTY_BYTES
SNOWFLAKE_SCHEMA=APP

ACCESS_TOKEN_SECRET={INSERT SOME RANDOM STRING HERE}
REFRESH_TOKEN_SECRET={INSERT ANOTHER RANDOM STRING HERE}

PORT=3000
CORS_ADDRESS=http://localhost:3001
````

## Test the service

Spin up the docker container locally and test it. Ensure you have [`Docker` installed:](https://www.docker.com/products/docker-desktop/)
````bash
docker --version
# Docker version 24.0.6, build ed223bc
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

You can also test that the `/Authorize` route gives an accesstoken when supplying the `Sf-Context-Current-User` header:
```bash
curl --header "Sf-Context-Current-User: user1" http://localhost:3000/authorize
# {"accessToken":"eyJhbGci....p942S4zk","refreshToken":"eyJhbGci....d9WjPyiTsVu6-VA"} 
```

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
./build-backend.sh

# Hint: you may need to run chmod + build-backend.sh to be able to execute the script
````
You should see the image being build and then pushed to the remote repository. 


## Spin up the service on Snowflake

Now go to Snowflake and set up the service. You need to have set up all other Snowflake pre-requisites before this (COMPUTE POOL, SECURITY INTEGRATION)
```sql
USE DATABASE frostbyte_tasty_bytes;
USE WAREHOUSE tasty_app_warehouse;

CREATE SERVICE backend_service
  IN COMPUTE POOL tasty_app_compute_pool
  FROM SPECIFICATION $$
spec:
  container:
  - name: backend
    image: /frostbyte_tasty_bytes/app/tasty_app_repository/backend_service_image:tutorial
    env:
        ACCESS_TOKEN_SECRET: {INSERT SOME RANDOM STRING HERE}
        REFRESH_TOKEN_SECRET: {INSERT ANOTHER RANDOM STRING HERE}
        PORT: 3000
  endpoint:
  - name: apiendpoint
    port: 3000
    public: true
$$
  MIN_INSTANCES=1
  MAX_INSTANCES=1
;
GRANT USAGE ON SERVICE backend_service TO ROLE spcs_ext_role;
```

