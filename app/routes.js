//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()

router.post('/course-start-answer', function (req, res) {

    var startMonth = req.session.data['course-start']

    if (startMonth === "April 2026") {
        res.redirect('/select-npq')
    } else {
        res.redirect('/check-funding-start')
    }

})

router.post('/england-funding-check-answer', function (req, res) {

    var workEngland = req.session.data['england']

    if (workEngland === "Yes") {
        res.redirect('/select-npq-funding-check')
    } else {
        res.redirect('/not-eligible-for-funding-england')
    }

})

router.post('/setting-funding-check-answer', function (req, res) {

  var setting = req.session.data['setting-funding-check']

  const schoolsDropdown = [
    'School',
    'Academy trust',
    '16 to 19 setting',
    'Preschool class or nursery - part of a school',
    'Secure children’s home or training centre',
  ]

   const ofsted = [
    'Private nursery',
    'Childminding setting',
    'Other early years',
  ]

    const role = [
        'Virtual school',
        'Working across schools',
    ]

    const employer = [
        'Young offender institution',
    ]

    const hospital = [
        'Hospital school',
    ]

    const nursery = [
        'Nursery',
    ]

    const teacherTrainingProvider = [
        'As a lead mentor for an accredited ITT provider',
    ]

  if (schoolsDropdown.includes(setting)) {
    res.redirect('/workplace-funding-check')
  } else if (ofsted.includes(setting)) {
    res.redirect('/ofsted-number-funding-check')
  } else if (role.includes(setting)) {
    res.redirect('/role-funding-check')
  } else if (employer.includes(setting)) {
    res.redirect('/employer-funding-check')
  } else if (hospital.includes(setting)) {
    res.redirect('/hospital-school-funding-check')
  } else if (nursery.includes(setting)) {
    res.redirect('/nursery-funding-check')
  } else if (teacherTrainingProvider.includes(setting)) {
      res.redirect('/ITT-provider-funding-check')
  } else {
    res.redirect('/not-eligible-for-funding-england')
  }

})