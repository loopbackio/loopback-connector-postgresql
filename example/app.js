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

/*
ds.discoverModelDefinitions({views: true, limit: 20}, show);

ds.discoverModelProperties('PRODUCT', show);

// ds.discoverModelProperties('INVENTORY_VIEW', {owner: 'STRONGLOOP'}, show);

ds.discoverPrimaryKeys('INVENTORY',  show);
ds.discoverForeignKeys('INVENTORY',  show);

ds.discoverExportedForeignKeys('PRODUCT',  show);
*/


var table = (process.argv.length > 2) ? process.argv[2] : 'INVENTORY_VIEW';

ds.discoverSchema(table, {owner: 'STRONGLOOP'}, function(err, schema) {
    console.log(JSON.stringify(schema));
    var model = ds.define(schema.name, schema.properties, schema.options);
    // console.log(model);
    model.all(show);
});

/*
ds.discoverAndBuildModels('INVENTORY', {owner: 'STRONGLOOP', visited: {}, associations: true}, function (err, models) {

    for(var m in models) {
        models[m].all(show);
    };

    models.Inventory.findOne({}, function(err, inv) {
       console.log("\nInventory: ", inv);
       inv.product(function(err, prod) {
           console.log("\nProduct: ", prod);
           console.log("\n ------------- ");
           // ds.disconnect(); // This will crash node-postgresql as the connection is disconnected while other statements are still running
       });
    });
});


*/

