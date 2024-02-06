# polstrat-backend
Polstrat back-end repository

# Environment vars
This project uses the following environment variables:

| Name                          | Description                         | Default Value                                  |
| ----------------------------- | ------------------------------------| -----------------------------------------------|
|PORT           | Server port            | 8100
|DATABASE_URL           | Database URL            | mongodb://localhost:27017/polstrat      |


# Pre-requisites
- Install [Node.js](https://nodejs.org/en/) version 18.13.0


# Getting started
- Clone the repository
```
git clone  https://github.com/thesecondwheel-polstrat/polstrat-backend.git
```
- Install dependencies
```
cd polstrat-backend
npm install
```
- Build and run the project
```
npm run dev
```
  Navigate to `http://localhost:8100`

- API Document endpoints

  User Endpoint Start With : http://localhost:8001/api/users 

  Client Endpoint start  Endpoint : http://localhost:8001/api/clients 


## Project Structure
The folder structure of this app is explained below:

| Name | Description |
| ------------------------ | --------------------------------------------------------------------------------------------- |
| **node_modules**         | Contains all  npm dependencies                                                            |
| **src**                  | Contains  source code that will be compiled to the api dir                               |
| **src/config**        |  Application configuration including databse configs
| **src/utils**        | Contains all helpers  functions
| **src/modules**      | modules define separating the functionality of a program into independent. 
| **src/routes**           | Contain all express routes, separated by module/area of application                       
| **src**/index.js         | Entry point to express app                                                               |
| package.json             | Contains npm dependencies as well as [build scripts](#what-if-a-library-isnt-on-definitelytyped)   



### Running the build
All the different build steps are orchestrated via [npm scripts](https://docs.npmjs.com/misc/scripts).
Npm scripts basically allow us to call (and chain) terminal commands via npm.

| Npm Script | Description |
| ------------------------- | ------------------------------------------------------------------------------------------------- |
| `dev`                   | Runs full build and runs node on index.js. Can be invoked with `npm run dev`                  |


