exports.up = function(knex, Promise) {
  return knex.schema.createTable('students', function(table) {
    table.increments('id');
    table.string('name', 128).notNullable();
    table
      .integer('cohort_id') // name of this column
      .unsigned() // shifts possible values from negative and positive to ALL positive
      .references('id') // name of column being used as foreign key
      .inTable('cohorts') // location of foreign key
      .onDelete('CASCADE') // something, something
      .onUpdate('CASCADE'); // something, something
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('students');
};
