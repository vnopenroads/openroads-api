# OpenRoads API
[![Build Status](https://magnum.travis-ci.com/opengovt/openroads-api.svg?token=tqZJSdEbKcpsuN9Fxqua&branch=master)](https://magnum.travis-ci.com/opengovt/openroads-api)

The OpenRoads API is part of the [OpenRoads project](https://github.com/developmentseed/openroads).

## Contributing

### Installing dependencies
The local development depends on `docker` and `docker-compose`. For Mac OS X and Windows download the [Docker Toolbox](https://www.docker.com/docker-toolbox).
For Linux follow [these](https://docs.docker.com/compose/install/) instructions. Optionally, you can run your own database

### Starting the server
This will launch the API and database in the background at `http://YOUR_DOCKER_HOST:4000`.
```sh
npm run docker-start # starts the API and DB
npm run docker-stop # stops the API and DB
npm run docker-logs # gets the API logs
```

### Running docker tests
For linux users, you might need to run using `sudo`
```sh
npm run docker-test
```

### Non-docker configuration
Before running the server, you will need to add `local.js` in your root directory to include directions to the postgresql database. Add your own values to the url where you're hosting the OSM database. The `docker-start.sh` in the `db-server` repo is a starting point for creating your own OSM DB.

```javascript
module.exports.connection = {
    production: 'postgres://USER:PASSWORD@HOST:POST/DATABASE',
}
```

To make it easier to point at different databases (e.g., a staging or test db),
you may additional urls in addition to `production`, and then target them using
the `OR_ENV` environment variable.  E.g.:
```js
module.exports.connection = {
    production: 'postgres://USER:PASSWORD@HOST:POST/DATABASE',
    staging: 'postgres://user2:otherpass@staging.host.com:port/db'
}
```

And then run `OR_ENV=staging npm start`

To run the server, use the following command:

```sh
npm start
```

To test the bounding box query:

```sh
curl http://localhost:1337/xml/map?bbox=123.81042480468751,9.584500864717155,123.81591796875,9.58991730708743
```

### Building the documentation locally

```sh
npm run gendoc
```

When deploying, Heroku builds the documentation. The .js and .json files that are built by `npm run gendoc`, should not be committed to Github.
