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
    'Nursery or preschool class',
  ]

   const ofsted = [
    'Private nursery',
    'Childminding setting',
    'Other early years',
  ]

  if (schoolsDropdown.includes(setting)) {
    res.redirect('/workplace')
  } else if (ofsted.includes(setting)) {
    res.redirect('/ofsted-number')
  } else {
    res.redirect('/not-eligible-for-funding-england')
  }

})