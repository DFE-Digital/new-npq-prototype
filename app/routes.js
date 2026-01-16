//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()

router.post('/course-start-answer', function (req, res) {

    var startMonth = req.session.data['course-start']
    const data = req.session.data;

    delete data['check-funding'];
    delete data['england'];
    delete data['setting-funding-check'];
    delete data['workplace'];
    delete data['do-you-have-ofsted-number'];
    delete data['ofsted-number'];
    delete data['publicly-funded-nursery'];
    delete data['funding-source-not-funded'];
    delete data['select-provider-funded'];
    delete data['select-provider'];
    delete data['select-npq'];
    delete data['npq-funded'];

    if (startMonth === "April 2026") {
        res.redirect('/select-npq')
    } else {
        res.redirect('/check-funding-start')
    }

})


router.all('/check-funding-answer', function (req, res) {

    const data = req.session.data || {};

    delete data['england'];
    delete data['setting-funding-check'];
    delete data['workplace'];
    delete data['do-you-have-ofsted-number'];
    delete data['ofsted-number'];
    delete data['publicly-funded-nursery'];
    delete data['select-provider-funded'];
    delete data['select-provider'];
    delete data['select-npq'];
    delete data['npq-funded'];

    if (req.query['check-funding'] === 'no') {
        data['check-funding'] = 'no';
    }

    else if (req.body['check-funding'] === 'yes') {
        data['check-funding'] = 'yes';
        delete data['select-provider']
    }

    req.session.data = data;

    res.render('select-npq', {
        data: data,
        serviceName: 'NPQ service'
    })

})


router.post('/england-funding-check-answer', function (req, res) {

    const data = req.session.data;

    // Clear all answers that depend on the "working in England" question
    delete data['setting-funding-check'];
    delete data['workplace'];
    delete data['do-you-have-ofsted-number'];
    delete data['ofsted-number'];
    delete data['publicly-funded-nursery'];
    delete data['select-provider-funded'];
    delete data['select-provider'];
    delete data['select-npq'];
    delete data['npq-funded'];
    delete data['funding-source-not-funded'];
    delete data['funding-source'];

    // Then redirect based on the current answer
    if (data['england'] === "Yes") {
        res.redirect('/funding-check/select-npq');
    } else {
        res.redirect('/funding-messages/not-eligible-for-funding-england');
    }
});

router.post('/setting-funding-check-answer', function (req, res) {

    // Clear downstream answers when setting changes
    delete req.session.data['workplace'];
    delete req.session.data['publicly-funded-nursery'];
    delete req.session.data['publicly-funded-hospital-school'];
    delete req.session.data['do-you-have-ofsted-number'];
    delete req.session.data['ofsted-number'];
    delete req.session.data['funding-source-not-funded'];

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
    'Other - early years',
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
    res.redirect('/funding-check/workplace')
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
    res.redirect('/not-eligible-for-funding-other')
  }

})


router.post('/nursery-funding-check-answer', function (req, res) {

    const data = req.session.data;
    const publiclyFundedNursery = data['publicly-funded-nursery'];

    // Clear downstream fields that depend on this answer
    delete data['workplace'];
    delete data['funding-source-not-funded'];
    delete data['do-you-have-ofsted-number'];
    delete data['ofsted-number'];
    delete data['select-provider-funded']

    if (publiclyFundedNursery === "Yes") {
        res.redirect('/funding-check/workplace');
    } else {
        res.redirect('/ofsted-number-funding-check');
    }

});


router.post('/hospital-school-funding-check-answer', function (req, res) {

    var publiclyFundedHospitalSchool = req.session.data['publicly-funded-hospital-school']

    if (publiclyFundedHospitalSchool === "Yes") {
        res.redirect('/funding-check/workplace')
    } else {
        res.redirect('/employer-funding-check')
    }

})


router.post('/workplace-funding-check-answer', function (req, res) {

    // Clear dependent fields
    req.session.data['funding-source-not-funded'] = null;
    req.session.data['do-you-have-ofsted-number'] = null;
    req.session.data['ofsted-number'] = null;

    var workplaceCategory = req.session.data['workplace']
    var selectedNPQ = req.session.data['npq-funded']

    var disadvantagedMaintainedNurseryIneligible = [
        "Leading behaviour and culture",
        "Leading literacy",
        "Leading teaching",
        "Leading primary mathematics",
        "Senior leadership",
        "Executive leadership"
    ]

    var disadvantagedMaintainedNurseryEligible = [
        "Early years leadership",
        "Leading teacher development",
    ]

    var publiclyFundedNurseryEligible = [
        "Headship",
        "SENCO",
    ]

    if (workplaceCategory === "Workplace on one of the eligibility lists") {
        res.redirect('/funding-messages/eligible-for-funding')

    } else if (workplaceCategory === "A maintained nursery school from the disadvantaged list" &&
        disadvantagedMaintainedNurseryIneligible.includes(selectedNPQ)
    ) {
        res.redirect('/funding-messages/not-eligible-for-funding-early-years-change-npq')

    } else if (workplaceCategory === "A maintained nursery school from the disadvantaged list" &&
        disadvantagedMaintainedNurseryEligible.includes(selectedNPQ)
    ) {
        res.redirect('/funding-messages/eligible-for-funding-disadvantaged-maintained-nursery')

    } else if (workplaceCategory === "A maintained nursery school from the disadvantaged list" &&
        publiclyFundedNurseryEligible.includes(selectedNPQ)
    ) {
        res.redirect('/funding-messages/eligible-for-funding-publicly-funded-nursery')

    } else {
        res.redirect('/funding-messages/not-eligible-for-funding-workplace-not-eligible')
    }

})

router.post('/ofsted-number-funding-check-answer', function (req, res) {

  const doYouHaveOfstedNumber = req.session.data['do-you-have-ofsted-number']
  const ofstedNumber = req.session.data['ofsted-number']
  const selectedNpqs = req.session.data['npq-funded']

    // Clear dependent fields
    req.session.data['funding-source-not-funded'] = null;
    req.session.data['select-provider-funded'] = null;

  if (doYouHaveOfstedNumber === 'Yes' && ofstedNumber === 'An early years setting on the early years list' && selectedNpqs === 'Early years leadership') {
    res.redirect('/funding-messages/eligible-for-funding-early-years')
  } else if (doYouHaveOfstedNumber === 'Yes' && ofstedNumber === 'An early years setting on the early years list' && selectedNpqs !== 'Early years leadership') {
    res.redirect('/funding-messages/not-eligible-for-funding-early-years-change-npq')
  } else {
    res.redirect('/funding-messages/not-eligible-for-funding-workplace-not-eligible')
  }

})