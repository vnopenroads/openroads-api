define({ "api": [
  {
    "type": "get",
    "url": "/admin/:id",
    "title": "Get subregions geojson by region ID",
    "name": "GetAdmin",
    "group": "Admin",
    "description": "<p>This endpoint returns the boundaries of the subregions in the given region,  as well as the roads clipped to the region. Used for analytics.</p> ",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "id",
            "description": "<p>Municipality or Barangay ID.</p> "
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "GeoJSON",
            "optional": false,
            "field": "subregions",
            "description": "<p>List of subregion boundaries</p> "
          },
          {
            "group": "Success 200",
            "type": "GeoJSON",
            "optional": false,
            "field": "roads",
            "description": "<p>List of roads clipped to subregion</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n\"subregions\": {\n  \"type\": \"FeatureCollection\",\n  \"properties\": {\n    \"ID_0\": 177,\n    \"ISO\": \"PHL\",\n    \"NAME_0\": \"Philippines\",\n    \"ID_2_OR\": 2110000000,\n    \"NAME_2\": \"Batanes\",\n    \"ID_3_OR\": 2110147000,\n    ...\n    }\n  },\n  \"features\": [{\n    \"type\": \"Feature\",\n    \"properties\": {\n      \"ISO\": \"PHL\",\n      \"NAME_0\": \"Philippines\",\n      \"NAME_2\": \"Batanes\",\n      \"NAME_3\": \"Basco\",\n      \"NAME_4\": \"Chanarian\",\n        ...\n      \"ID_4_OR\": 2110147001\n    },\n    \"geometry\": {\n    \"type\": \"Polygon\",\n    \"coordinates\": [[[121.95786285400389, 20.432300567627006],\n            ...]]\n    },\n    \"id\": \"2110147001\",\n    \"name\": \"Chanarian\", \n    },\n  ...]\n  },\n  \"roads\": {\n    \"type\":\"FeatureCollection\",\n    \"properties\": {...},\n    \"features\": [...]\n  }\n}",
          "type": "json"
        }
      ]
    },
    "examples": [
      {
        "title": "Example Usage: ",
        "content": "curl http://localhost:4000/admin/2110147000",
        "type": "curl"
      }
    ],
    "version": "0.0.0",
    "filename": "routes/admin.js",
    "groupTitle": "Admin"
  },
  {
    "type": "get",
    "url": "/subregions/:id",
    "title": "Get list of subregions by region ID",
    "name": "GetSubregion",
    "group": "Admin",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "id",
            "description": "<p>Region ID.</p> "
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "meta",
            "description": "<p>Region metadata</p> "
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "meta.id",
            "description": "<p>Region ID.</p> "
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "meta.name",
            "description": "<p>Region name.</p> "
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "meta.type",
            "description": "<p>Region type.</p> "
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "meta.NAME_0",
            "description": "<p>Country name.</p> "
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "meta.NAME_1",
            "description": "<p>Region name.</p> "
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "meta.ID_1_OR",
            "description": "<p>Region ID.</p> "
          },
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "adminAreas",
            "description": "<p>List of Subregions.</p> "
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "adminAreas.name",
            "description": "<p>Subregion name.</p> "
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "adminAreas.id",
            "description": "<p>Subregion ID.</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n\"meta\": {\n  \"id\": 2000000000,\n  \"name\": \"Region II (Cagayan Valley)\",\n  \"type\": 1,\n  \"NAME_0\": \"Philippines\",\n  \"NAME_1\": \"Region II (Cagayan Valley)\",\n  \"ID_1_OR\": 2000000000\n},\n\"adminAreas\": [\n  {\n    \"name\": \"Batanes\",\n    \"id\": \"2110000000\"\n  },\n  ...\n]}",
          "type": "json"
        }
      ]
    },
    "examples": [
      {
        "title": "Example Usage: ",
        "content": "curl http://localhost:4000/subregions/2000000000",
        "type": "curl"
      }
    ],
    "version": "0.0.0",
    "filename": "routes/admin.js",
    "groupTitle": "Admin"
  },
  {
    "type": "get",
    "url": "/subregions/",
    "title": "Get list of regions",
    "name": "GetSubregions",
    "group": "Admin",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "adminAreas",
            "description": "<p>List of regions</p> "
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "adminAreas.name",
            "description": "<p>Region name.</p> "
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "adminAreas.id",
            "description": "<p>Region ID.</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n  \"adminAreas\": [\n  {\n    \"name\": \"Region I (Ilocos region)\",\n    \"id\": \"1000000000\"\n  },\n  {\n    \"name\": \"Region II (Cagayan Valley)\",\n    \"id\": \"2000000000\"\n  },\n  ...\n  ]\n}",
          "type": "json"
        }
      ]
    },
    "examples": [
      {
        "title": "Example Usage: ",
        "content": "curl http://localhost:4000/subregions",
        "type": "curl"
      }
    ],
    "version": "0.0.0",
    "filename": "routes/admin.js",
    "groupTitle": "Admin"
  },
  {
    "type": "get",
    "url": "/admin/search/:name",
    "title": "Search for administrative boundary by name",
    "name": "SearchAdmin",
    "group": "Admin",
    "description": "<p>Given a search string, return 10 matching administrative boundaries. Search is case insensitive.</p> ",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Search parameter</p> "
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "boundaries",
            "description": "<p>List of matching boundaries</p> "
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "boundaries.id",
            "description": "<p>ID of boundary</p> "
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "boundaries.name",
            "description": "<p>Name of boundary</p> "
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "boundaries.type",
            "description": "<p>type of boundary</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "[\n  {\n    \"id\": \"6360688002\",\n    \"name\": \"Atabayan\",\n     \"type\": 4\n  },\n  {\n    \"id\": \"10160264001\",\n    \"name\": \"Bagongbayan\",\n    \"type\": 4\n  },\n  ...\n]",
          "type": "json"
        }
      ]
    },
    "examples": [
      {
        "title": "Example Usage: ",
        "content": "curl http://localhost:4000/admin/search/Bayan",
        "type": "curl"
      }
    ],
    "version": "0.0.0",
    "filename": "routes/admin.js",
    "groupTitle": "Admin"
  },
  {
    "type": "put",
    "url": "/changeset/create",
    "title": "Create a changeset",
    "name": "CreateChangeset",
    "group": "iD",
    "description": "<p>Given a user and and a user ID, create a new changeset and return the newly created changeset ID.</p> ",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "uid",
            "description": "<p>User ID</p> "
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "user",
            "description": "<p>User name</p> "
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "id",
            "description": "<p>Created changeset ID</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\"id\":\"1194\"}",
          "type": "json"
        }
      ]
    },
    "examples": [
      {
        "title": "Example Usage: ",
        "content": "curl -X PUT --data \"uid=1&user=openroads\" http://localhost:4000/changeset/create",
        "type": "curl"
      }
    ],
    "version": "0.0.0",
    "filename": "routes/changeset-create.js",
    "groupTitle": "iD"
  },
  {
    "type": "get",
    "url": "/map",
    "title": "GeoJSON - Get entities in bounding box",
    "name": "Map",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number[4]",
            "optional": false,
            "field": "bbox",
            "description": "<p>[min_lon, min_lat, max_lon, max_lat]</p> "
          }
        ]
      }
    },
    "group": "iD",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "GeoJSON",
            "optional": false,
            "field": "FeatureCollection",
            "description": "<p>List of OSM Roads</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n  \"type\": \"FeatureCollection\",\n  \"properties\": {},\n  \"features\": [\n    {\n      \"type\": \"Feature\",\n      \"properties\": {\n        \"highway\": \"secondary\",\n        \"or_rdclass\": \"provincial\",\n        \"or_brgy\": \"Dao\",\n        \"name\": \"TINAGO_DAO ROAD\",\n        \"or_mun\": \"Dauis\",\n        \"rd_cond\": \"poor\",\n        \"source\": \"OpenRoads\"\n       },\n      \"geometry\": {\n        \"type\": \"LineString\",\n        \"coordinates\": [[123.8149137,9.5920337],\n          ...\n        ]}\n    }, \n  ...]\n}",
          "type": "json"
        }
      ]
    },
    "examples": [
      {
        "title": "Example Usage: ",
        "content": "curl http://localhost:4000/map?bbox=123.81042480468751,9.584500864717155,123.81591796875,9.58991730708743",
        "type": "curl"
      }
    ],
    "version": "0.0.0",
    "filename": "routes/map-json.js",
    "groupTitle": "iD"
  },
  {
    "type": "POST",
    "url": "/changeset/:id/upload",
    "title": "Upload changeset Data",
    "name": "UploadChangeset",
    "group": "iD",
    "description": "<p>Upload JSON Changeset Data to given changeset return the changeset and a bounding box that covers the location of its  edits.</p> <p>The OSM Change JSON Format is the of the form</p> <pre><code> {  <br>   \"version\": 0.1, <br>   \"generator\": \"iD\", <br>   \"create\": {},  <br>   \"modify\": {},  <br>   \"delete\": {}, <br> } </code></pre>  <p>Each of the create, modify and delete blocks can contain entities such as Node, Way or Relation. Check the API Usage Example for more detail.</p> ",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "id",
            "description": "<p>Changeset ID</p> "
          },
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "osmChange",
            "description": "<p>OSM Changeset Data in JSON</p> "
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "changeset",
            "description": "<p>Changeset object</p> "
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "changeset.id",
            "description": "<p>Changeset ID.</p> "
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "changeset.user_id",
            "description": "<p>Changeset User ID.</p> "
          },
          {
            "group": "Success 200",
            "type": "Date",
            "optional": false,
            "field": "changeset.created_at",
            "description": "<p>Changeset Date of creation.</p> "
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "changeset.min_lat",
            "description": "<p>Min Latitude of bounding box.</p> "
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "changeset.max_lat",
            "description": "<p>Max Latitude of bounding box.</p> "
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "changeset.min_lon",
            "description": "<p>Min Longitude of bounding box.</p> "
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "changeset.max_lon",
            "description": "<p>Max Longitude of bounding box.</p> "
          },
          {
            "group": "Success 200",
            "type": "Date",
            "optional": false,
            "field": "changeset.closed_at",
            "description": "<p>Changeset Date of creation.</p> "
          },
          {
            "group": "Success 200",
            "type": "number",
            "optional": false,
            "field": "changeset.num_changes",
            "description": "<p>Number of edits in this changeset.</p> "
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\"changeset\":\n  {\n   \"id\":\"1\",\n   \"user_id\":\"2254600\",\n   \"created_at\":\"2015-03-13T03:51:39.000Z\",\n   \"min_lat\":97923478,\n   \"max_lat\":97923478,\n   \"min_lon\":1239780018,\n   \"max_lon\":1239780018,\n   \"closed_at\":\"2015-04-21T18:44:51.858Z\",\n   \"num_changes\":31076\n   }\n}",
          "type": "json"
        }
      ]
    },
    "examples": [
      {
        "title": "Example Usage: ",
        "content": "curl -d '{\n \"osmChange\": {\n   \"version\":0.1, \n   \"generator\":\"openroads-iD\", \n   \"create\":{ },\n   \"modify\":{\n     \"node\":[\n       {\"id\":\"21851\", \n        \"lon\":123.9780018,\n        \"lat\":9.7923478,\"version\":\"1\", \"tag\":[], \n        \"changeset\":1 }]\n   },\n   \"delete\": {}\n }\n}' -H 'Content-Type: application/json' http://localhost:4000/changeset/1/upload",
        "type": "curl"
      }
    ],
    "version": "0.0.0",
    "filename": "routes/changeset-upload.js",
    "groupTitle": "iD"
  },
  {
    "type": "get",
    "url": "/xml/map",
    "title": "OSM XML - Get entities in bounding box",
    "name": "XmlMap",
    "description": "<p>Returns an OSM XML list of entities within the  provided bounding box</p> ",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number[4]",
            "optional": false,
            "field": "bbox",
            "description": "<p>[min_lon, min_lat, max_lon, max_lat]</p> "
          }
        ]
      }
    },
    "group": "iD",
    "examples": [
      {
        "title": "Example Usage: ",
        "content": "curl http://localhost:4000/xml/map?bbox=123.81042480468751,9.584500864717155,123.81591796875,9.58991730708743",
        "type": "curl"
      }
    ],
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "<osm version=\"6\" generator=\"OpenRoads\">\n<bounds minlat=\"9.584500864717155\" minlon=\"123.81042480468\" maxlat=\"9.58991730708\" maxlon=\"123.81591796875\"/>\n  <node id=\"74038\" changeset=\"1\" timestamp=\"Wed Mar 11 2015 09:38:41 GMT+0000\" lat=\"9.5820416\" lon=\"123.81629\"/>\n  <node id=\"77930\" changeset=\"1\" timestamp=\"Wed Mar 11 2015 09:38:41 GMT+0000\" lat=\"9.5920337\" lon=\"123.81491\"/>\n  ...\n  <way id=\"77931\" visible=\"true\" version=\"1\" changeset=\"0\" timestamp=\"Wed Mar 11 2015 09:38:41 GMT+0000\">\n    <nd ref=\"77930\"/>\n    <nd ref=\"77932\"/>\n    ...\n    <tag k=\"highway\" v=\"secondary\"/>\n    <tag k=\"or_rdclass\" v=\"provincial\"/>\n    <tag k=\"or_brgy\" v=\"Dao\"/>\n  </way>\n</osm>",
          "type": "xml"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/map.js",
    "groupTitle": "iD"
  }
] });