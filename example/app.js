var DataSource = require('loopback-datasource-juggler').DataSource;

var config = require('rc')('loopback', {dev: {postgresql: {}}}).dev.postgresql;

var ds = new DataSource(require('../'), config);

function show(err, models) {
    if (err) {
        console.error(err);
    } else {
        models.forEach(function(m) {
            console.dir(m);
        });
    }
}


ds.discoverModelDefinitions({views: true, limit: 20}, show);

ds.discoverModelProperties('product', show);

// ds.discoverModelProperties('INVENTORY_VIEW', {owner: 'STRONGLOOP'}, show);

ds.discoverPrimaryKeys('inventory',  show);
ds.discoverForeignKeys('inventory',  show);

ds.discoverExportedForeignKeys('product',  show);

/*

var table = (process.argv.length > 2) ? process.argv[2] : 'INVENTORY_VIEW';

ds.discoverSchema(table, {owner: 'STRONGLOOP'}, function(err, schema) {
    console.log(JSON.stringify(schema));
    var model = ds.define(schema.name, schema.properties, schema.options);
    // console.log(model);
    model.all(show);
});
*/

/*
ds.discoverAndBuildModels('INVENTORY', {owner: 'STRONGLOOP', visited: {}, associations: true}, function (err, models) {

    for(var m in models) {
        models[m].all(show);
    };

    models.Inventory.findOne({}, function(err, inventory) {
       console.log("\nInventory: ", inventory);
       inventory.product(function(err, product) {
           console.log("\nProduct: ", product);
           console.log("\n ------------- ");
           // ds.disconnect(); // This will crash node-postgresql as the connection is disconnected while other statements are still running
       });
    });
});


*/

