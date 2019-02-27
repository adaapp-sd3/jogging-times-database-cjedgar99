const express = require('express');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const JogTime = require('./models/JogTime');

const routes = new express.Router();
const saltRounds = 10;


routes.get('/', (req, res) => {
  if (req.cookies.userId) {
    // if we've got a user id, assume we're logged in and redirect to the app:
    res.redirect('/times')
  } else {
    // otherwise, redirect to login
    res.redirect('/sign-in')
  }
})

// show the create account page
routes.get('/create-account', (req, res) => {
  res.render('create-account.html')
})

// handle create account forms:
routes.post('/create-account', (req, res) => {
  let form = req.body;


  if (form.password !== form.passwordConfirm) {
    res.redirect('/create-account');
    return;
  }
  // hash the password - we dont want to store it directly
  let passwordHash = bcrypt.hashSync(form.password, saltRounds)
  
  // create the user
  let userId = User.insert(form.name, form.email, passwordHash)

  // set the userId as a cookie
  res.cookie('userId', userId)

  // redirect to the logged in page
  res.redirect('/times')
})

// show the sign-in page
routes.get('/sign-in', (req, res) => {
  res.render('sign-in.html')
})

routes.post('/sign-in', (req, res) => {
  let form = req.body

  // find the user that's trying to log in
  let user = User.findByEmail(form.email)

  // if the user exists...
  if (user) {
    console.log({ form, user })
    if (bcrypt.compareSync(form.password, user.passwordHash)) {
      // the hashes match! set the log in cookie
      res.cookie('userId', user.id)
      // redirect to main app:
      res.redirect('/times')
    } else {
      // if the username and password don't match, say so
      res.render('sign-in.html', {
        errorMessage: 'Email address and password do not match'
      })
    }
  } else {
    // if the user doesnt exist, say so
    res.render('sign-in.html', {
      errorMessage: 'No user with that email exists'
    })
  }
})

// handle signing out
routes.get('/sign-out', (req, res) => {
  // clear the user id cookie
  res.clearCookie('userId')

  // redirect to the login screen
  res.redirect('/sign-in')
})

// list all jog times
routes.get('/times', (req, res) => {
  let loggedInUser = User.findUserById(req.cookies.userId);
  if (loggedInUser === null) {
		res.redirect('/sign-in')
		return
	}

  // List the totals of data
  let jogTimes = JogTime.findJogByUserId(req.cookies.userId);
  let totalDistance = jogTimes.reduce((acc, cur) => acc + cur.distance, 0);
  let totalTime = jogTimes.reduce((acc, cur) => acc + cur.duration, 0);
  let avgSpeed = totalDistance / totalTime;

  if(isNaN(avgSpeed)) {
    avgSpeed = 0;
  }

  let formattedJogTimes = jogTimes.map(jog => {
    let avgSpeed = jog.distance / jog.duration;
    return formattedTime = {...jog, avgSpeed} 
  });


  res.render('list-times.html', {
    user: loggedInUser,
    stats: {
      totalDistance: totalDistance.toFixed(2),
      totalTime: totalTime.toFixed(2),
      avgSpeed: avgSpeed.toFixed(2)
    },
    times: formattedJogTimes
  })
})

// show the create time form
routes.get('/times/new', (req, res) => {
  let loggedInUser = User.findUserById(req.cookies.userId);
  if (loggedInUser === null) {
		res.redirect('/sign-in')
		return
	}

  res.render('create-time.html', {
    user: loggedInUser
  })
})

// handle the create time form
routes.post('/times/new', (req, res) => {
  const { startTime, distance, duration } = req.body;

  let JogTimeId = JogTime.insert(req.cookies.userId, startTime, distance, duration);

  res.cookie('timeId', JogTimeId);

  res.redirect('/times');
})

// show a specific time
routes.get('/times/:id', (req, res) => {
  let JogTimeId = req.params.id;
  let loggedInUser = User.findUserById(req.cookies.userId); 
  if (loggedInUser === null) {
		res.redirect('/sign-in')
		return
	}

  let JogTime = JogTime.findJogById(JogTimeId, loggedInUser.id);

  if (JogTime === null) {
		res.redirect('/times')
	} else {
		res.render('edit-time.html', {
      user: loggedInUser,
      time: JogTime
		})
	}
})

// handle the edit of a time
routes.post('/times/:id', (req, res) => {
  const JogTimeId = req.params.id;
  const { startTime, distance, duration } = req.body

  JogTime.updateTime(startTime, distance, duration, JogTimeId);

  res.redirect('/times');
})

// handle the delete of a time 
routes.get('/times/:id/delete', (req, res) => {
  let JogTimeId = req.params.id;

  JogTime.deleteJog(JogTimeId);

  res.redirect('/times');
})

// handle the delete of an account
routes.get('/delete-account', (req, res) => {
  let userId = req.cookies.userId;

  //delete the user
  User.deleteUser(userId);

  //clear the cookie
  res.clearCookie('userId')

  //sign out
  res.redirect('/sign-in')
});

module.exports = routes
