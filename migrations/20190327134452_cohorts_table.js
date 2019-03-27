exports.up = function(knex, Promise) {
  return knex.schema.createTable('cohorts', function(table) {
    // column: primary key, named 'id'
    table.increments('id');
    // column: named 'name', type is string, required, unique
    table
      .string('name')
      .notNullable()
      .unique();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('cohorts');
};
