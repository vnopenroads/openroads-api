# OpenRoads API
[![Build Status](https://magnum.travis-ci.com/opengovt/openroads-api.svg?token=tqZJSdEbKcpsuN9Fxqua&branch=master)](https://magnum.travis-ci.com/opengovt/openroads-api)

The OpenRoads API is part of the [OpenRoads project](https://github.com/developmentseed/openroads).

## Local development using Docker
This repo comes with Docker configuration to spin up the API and a database. This same setup is also used by Travis to run tests against.

To set up your environment, make sure `docker` and `docker-compose` are installed on your machine. For Mac OS X and Windows download the [Docker Toolbox](https://www.docker.com/docker-toolbox). For Linux follow [these](https://docs.docker.com/compose/install/) instructions.

### Useful commands
This will launch the API and database in the background at `http://YOUR_DOCKER_HOST:4000`.

```sh
npm run docker-start # starts the API and DB
npm run docker-stop # stops the API and DB
npm run docker-logs # gets the API logs
```

If you make local changes while the docker container is running, you have to stop and start it again to rebuild your changes.

### Running tests
The following command creates an empty postgres db, populates it with test data, and runs the tests against it. 

```sh
npm run docker-test
```

Linux users may need to use `sudo`

To run a db on its own you can run docker-compose up [-d] postgres which will start the database on its own at $DOCKER_HOST:5433

## Non-docker configuration
It is also possible to run the API without Docker. This is for example useful if you want to connect to a different database.

Before running the server, you will need to add `local.js` in your root directory to include directions to the postgresql database. Add your own values to the url where you're hosting your OSM database. The `docker-start.sh` in the `db-server` repo is a starting point for creating your own OSM DB.

```javascript
module.exports.connection = {
    production: 'postgres://USER:PASSWORD@HOST:POST/DATABASE',
}
```

To make it easier to point at different databases (e.g., a staging or test db), you may additional urls in addition to `production`, and then target them using the `OR_ENV` environment variable.  E.g.:

```js
module.exports.connection = {
    production: 'postgres://USER:PASSWORD@HOST:POST/DATABASE',
    staging: 'postgres://user2:otherpass@staging.host.com:port/db'
}
```

And then run `OR_ENV=staging npm start`

### Troubleshooting
If you have trouble connecting to a hosted database from your local machine, the service may require you to connect over SSL. Add `?ssl=true` after the database name, for example: `postgres://user2:otherpass@staging.host.com:port/db?ssl=true`.


## Building the documentation locally

```sh
npm run gendoc
```

When deploying, Heroku builds the documentation. The .js and .json files that are built by `npm run gendoc`, should not be committed to Github.
