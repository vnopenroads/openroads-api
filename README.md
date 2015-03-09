# OpenRoads
The main repo for the Philippines OpenRoads project.

## Installing locally

```
git clone git@github.com:developmentseed/openroads.git
cd openroads
npm install
```

Before running the server, you will need to modify `config/local.js` to include directions to the postgresql database. You'll want to include the following:


```
module.exports.connections = {
  osmPostgreSQL: {
    adapter: 'sails-postgresql',
    host: 'YOUR_HOST',
    port: 5434,
    user: 'USER_NAME',
    password: 'PASSWORD',
    database: 'DB_NAME',
    ssl: false,
    pool: false,
  }
}
```

To run the server, run the following command:

```
sails lift
```

To test the bounding box query:

```
http://localhost:1337/map?bbox=123.81042480468751,9.584500864717155,123.81591796875,9.58991730708743
```
