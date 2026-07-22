/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1211123646")

  // add field
  collection.fields.addAt(34, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text3494172116",
    "max": 50,
    "min": 0,
    "name": "session",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(35, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text3915217470",
    "max": 100,
    "min": 0,
    "name": "voter_name",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1211123646")

  // remove field
  collection.fields.removeById("text3494172116")

  // remove field
  collection.fields.removeById("text3915217470")

  return app.save(collection)
})
