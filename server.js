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
        .select()
        .where('id', newCohortId[0])
        .first()
        .then(newCohort => res.status(201).json(newCohort))
    )
    .catch(error => {
      console.error(error);
      res.status(500).json({
        message: 'The request could not be completed.',
        error: error
      });
    });
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
    .select()
    .where('id', req.params.id)
    .first()
    .then(cohort => {
      if (!cohort) {
        return res.status(404).json({ message: 'No cohort found.' });
      }
      res.status(200).json(cohort);
    })
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
          .then(updatedCohort => res.status(201).json(updatedCohort[0]));
      }
    })
    .catch(error => {
      console.error(error);
      res
        .status(500)
        .json({ message: 'Error completing the request.', error: error });
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

/**
 * ––– STUDENTS –––
 */
// [POST] /students
// Saves a new student to the database.
server.post('/students', (req, res) => {
  if (!req.body.name || !req.body.cohort_id) {
    return res
      .status(400)
      .json({ message: 'Please send `name` and `cohort_id` properties.' });
  }
  db('students')
    .insert(req.body)
    .then(newId =>
      db('students')
        .select()
        .where('id', newId[0])
        .first()
        .then(newStudent => res.status(201).json(newStudent))
    )
    .catch(error => {
      console.error(error);
      res
        .status(500)
        .json({ message: 'The request could not completed.', error: error });
    });
});

// [GET] /students
// Returns an array of all students.
server.get('/students', (req, res) => {
  db('students')
    .select()
    .then(students => res.status(200).json(students))
    .catch(error => {
      console.error(error);
      res
        .status(500)
        .json({ message: 'The request could not completed.', error: error });
    });
});

// [GET] /students/:id
// Returns student with the matching id.
// {
//   id: 1,
//   name: 'Lambda Student',
//   cohort: 'Full Stack Web Infinity'
// }
server.get('/students/:id', (req, res) => {
  db('students')
    .join('cohorts', 'students.cohort_id', '=', 'cohorts.id')
    .select({
      id: 'students.id',
      name: 'students.name',
      cohort: 'cohorts.name'
    })
    .where('students.id', req.params.id)
    .first()
    .then(student => {
      if (!student) {
        return res.status(404).json({ message: 'No student found.' });
      }
      res.status(200).json(student);
    })
    .catch(error => {
      console.error(error);
      res.status(500).json({
        message: 'The request could not be completed.',
        error: error
      });
    });
});

// [PUT] /students/:id
// Updates the student with the matching id using information sent in the body of the request.
server.put('/students/:id', async (req, res) => {
  if (!req.body.name && !req.body.cohort_id) {
    return res.status(400).json({
      message: 'Please include one or both `cohort_id` and `name` properties.'
    });
  }
  try {
    function updateStudent() {
      return db('students')
        .select()
        .where('id', req.params.id)
        .update(req.body)
        .then(updatedRows => {
          if (!updatedRows) {
            return res.status(404).json({ message: 'No student found.' });
          }
          db('students')
            .select()
            .where('id', req.params.id)
            .then(updatedStudent => res.status(201).json(updatedStudent[0]));
        });
    }
    if (req.body.cohort_id) {
      const cohortCheck = await db('cohorts')
        .select()
        .where('id', req.body.cohort_id)
        .first()
        .then(cohort => {
          if (!cohort) {
            return res.status(404).json({ message: 'No cohort found.' });
          }
          updateStudent();
        });
    } else {
      updateStudent();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'The request could not be completed.',
      error: error
    });
  }
});

// [DELETE] /students/:id
// Deletes the specified student.
server.delete('/students/:id', (req, res) => {
  db('students')
    .where('id', req.params.id)
    .del()
    .then(delStatus => {
      if (!delStatus) {
        return res.status(404).json({ message: 'No student found.' });
      }
      res.status(204).end();
    })
    .catch(error => {
      console.error(error);
      res.status(500).json({
        message: 'The request could not be completed.',
        error: error
      });
    });
});

module.exports = server;
