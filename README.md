# Deploy a Data App with Snowflake Snowpark Container Services (SPCS)
<!-- ------------------------ -->
## Overview 
Duration: 1

Snowflake is a terrific platform on which to build data applications. The unique characteristics and
cloud-based design allow for building applications that scale with data and workload. This tutorial
will go through how to build and deploy both the Processing Layer and the User Interface Layer paired
with Snowflake as the Persistence Layer.

Our example will be using a fictional food truck franchise website, Tasty Bytes. We will be building
a graphical user interface with charts and graphs for franshisees to be able to examine sales data related
to their franchise of food trucks. After logging in via a login page, each franchisee will have one page 
that will show metrics at the franchise level, and another that will show metrics around the food truck 
brands for that franchise.

The Processing and User Interface Layers will be built using Node.js. The dataset is a orders history
for Tasty Bytes. 

Both the Processing and the User Interface Layers are then hosted on Snowpark Container Services services.


### Prerequisites
- A Snowflake account, and familiarity with the Snowsight interface
- Privileges necessary to create a user, database, and warehouse in Snowflake
- Ability to install and run software on your computer
- Basic experience using git
- Intermediate knowledge of Node.js and React JS

### What You’ll Learn 
- How to configure and build a custom API Powered by Snowflake, written in Node.js
- How to configure and build a custom frontend website to communicate with the API, written in React and Node.js
- How to run and test the frontend and API on your machine

### What You’ll Need 
- [VSCode](https://code.visualstudio.com/download) Installed
- [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) Installed
- [NodeJS](https://nodejs.org/en/download/) Installed
- [NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) Installed

> aside positive
> **Installing Using NVM**
> 
>  Node Version Manager provides the ability to have multiple versions of Node installed on your local environment.  This can be helpful so that you can complete this lab without impacting any existing Node setup that you have on your machine. 
> NVM can be found here: [https://github.com/nvm-sh/nvm](https://github.com/nvm-sh/nvm)
> 
> To run this lab you will want to utilize Node 18.16.0 which can be installed using the following command after NVM has been installed: `nvm install 18.16.0`

### What You’ll Build 
- API Powered by Snowflake built in Node.js
- React JS Web Application that connects to that API
- Services hosted in Snowpark Container Services


## Explore the quickstart

Head over to [Snowflake Quickstarts](https://quickstarts.snowflake.com/guide/build_a_data_app_and_run_it_on_Snowpark_container_services) and run thought the quickstart end-to-end.