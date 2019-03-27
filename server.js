const express = require('express');
const helmet = require('helmet');
const knex = require('knex');
const knexConfig = require('./knexfile');

const db = knex(knexConfig.development);

const server = express();

server.use(express.json());
server.use(helmet());

// [POST] /api/cohorts
// Saves a new cohort to the database.
server.post('/api/cohorts', (req, res) => {
  if (!req.body.name) {
    return res
      .status(400)
      .json({ message: 'Please include a `name` property.' });
  }
  db('cohorts')
    .insert(req.body)
    .then(newCohortId =>
      db('cohorts')
        .select('*')
        .where('id', newCohortId[0])
    )
    .then(newCohort =>
      res
        .status(201)
        .json(newCohort)
        .catch(error => {
          console.error(error);
          res.status(500).json({
            message: 'The request could not be completed.',
            error: error
          });
        })
    );
});

// [GET] /api/cohorts
// Return an array of all cohorts.
server.get('/api/cohorts', (req, res) => {
  db('cohorts')
    .select('*')
    .then(cohorts => res.status(200).json(cohorts))
    .catch(error => {
      console.error(error);
      res
        .status(500)
        .json({ message: 'Error completing the request.', error: error });
    });
});

// [GET] /api/cohorts/:id
// Return the cohort with the matching id.
server.get('/api/cohorts/:id', (req, res) => {
  db('cohorts')
    .select('*')
    .where('id', req.params.id)
    .then(cohort => res.status(200).json(cohort))
    .catch(error => {
      console.error(error);
      res
        .status(500)
        .json({ message: 'Error completing the request.', error: error });
    });
});

// [GET] /api/cohorts/:id/students
// Returns all students for the cohort with the specified id.
server.get('/api/cohorts/:id/students', (req, res) => {
  db('students')
    .select('*')
    .where('cohort_id', req.params.id)
    .then(students => res.status(200).json(students))
    .catch(error => {
      console.error(error);
      res
        .status(500)
        .json({ message: 'Error completing the request.', error: error });
    });
});

// [PUT] /api/cohorts/:id
// Updates the cohort with the matching id using information sent in the body of the request.
server.put('/api/cohorts/:id', (req, res) => {
  if (!req.body.name) {
    return res
      .status(400)
      .json({ message: 'Please include a `name` property.' });
  }
  db('cohorts')
    .where('id', req.params.id)
    .update(req.body)
    .then(updatedRows => {
      if (!updatedRows) {
        return res.status(404).json({ message: 'No cohort found.' });
      } else {
        db('cohorts')
          .select('*')
          .where('id', req.params.id)
          .then(updatedCohort => res.status(201).json(updatedCohort))
          .catch(error => {
            console.error(error);
            res
              .status(500)
              .json({ message: 'Error completing the request.', error: error });
          });
      }
    });
});

// [DELETE] /api/cohorts/:id
// Deletes the specified cohort.
server.delete('/api/cohorts/:id', (req, res) => {
  db('cohorts')
    .where('id', req.params.id)
    .del()
    .then(delStatus => {
      if (!delStatus) {
        return res.status(404).json({ message: 'No cohort found.' });
      } else {
        res.status(204).end();
      }
    })
    .catch(error => {
      console.error(error);
      res
        .status(500)
        .json({ message: 'Error completing the request.', error: error });
    });
});

module.exports = server;