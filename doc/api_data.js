define({ "api": [
  {
    "type": "get",
    "url": "/admin/:id",
    "title": "Get subregions geojson by Region ID",
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
            "type": "Object",
            "optional": false,
            "field": "subregions",
            "description": "<p>Subregion boundaries GeoJSON</p> "
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "roads",
            "description": "<p>Roads in Subregion GeoJSON</p> "
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
    "title": "Get subregions by region ID",
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
  }
] });