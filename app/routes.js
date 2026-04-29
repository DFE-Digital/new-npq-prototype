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

    if (startMonth === "No, I already started in Spring") {
        res.redirect('/unfunded-path/select-npq')
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
    } else if (req.body['check-funding'] === 'yes') {
        data['check-funding'] = 'yes';
        delete data['select-provider']
    }

    req.session.data = data;

    res.render('unfunded-path/select-npq', {
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
        res.redirect('/funding-messages/not-eligible/england');
    }
});


router.post('/select-npq-answer', function (req, res) {

    if (req.session.data['npq-funded'] === 'Early headship coaching offer') {
        res.redirect('/funding-check/ehco');
    } else {
        res.redirect('/funding-check/setting');
    }

})

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
        'Preschool class',
        'Secure children’s home or training centre',
    ]

    const ofsted = [
        'Private nursery',
        'Childcare',
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
        'Early years',
    ]

    const teacherTrainingProvider = [
        'As a lead mentor for an accredited ITT provider',
    ]

    if (schoolsDropdown.includes(setting)) {
        res.redirect('/funding-check/workplace')
    } else if (ofsted.includes(setting)) {
        res.redirect('/funding-check/ofsted')
    } else if (role.includes(setting)) {
        res.redirect('/funding-check/role')
    } else if (employer.includes(setting)) {
        res.redirect('/funding-check/employer')
    } else if (hospital.includes(setting)) {
        res.redirect('/funding-check/hospital-school')
    } else if (nursery.includes(setting)) {
        res.redirect('/funding-check/nursery')
    } else if (teacherTrainingProvider.includes(setting)) {
        res.redirect('/funding-check/ITT-provider')
    } else {
        res.redirect('/funding-messages/not-eligible/other')
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

    if (publiclyFundedNursery === "Local authority-maintained nursery" || publiclyFundedNursery === "Pre-school class or nursery that’s part of a school (maintained or independent)") {
        res.redirect('/funding-check/workplace')
    } else if (publiclyFundedNursery === "Private nursery" || publiclyFundedNursery === "Childcare") {
        res.redirect('/funding-check/ofsted');
    } else {
        res.redirect('/funding-check/ofsted');
    }

});


router.post('/hospital-school-funding-check-answer', function (req, res) {

    var publiclyFundedHospitalSchool = req.session.data['publicly-funded-hospital-school']

    if (publiclyFundedHospitalSchool === "Yes") {
        res.redirect('/funding-check/workplace')
    } else {
        res.redirect('/funding-check/employer')
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
        "Leading teacher development",
        "Executive leadership"
    ]

    var disadvantagedMaintainedNurseryEligible = [
        "Early years leadership",
    ]

    var publiclyFundedEligible = [
        "Headship",
        "SENCO",
    ]

    if (workplaceCategory === "A workplace on either the schools, 16-19 or RISE list") {
        res.redirect('/funding-messages/eligible/schools-16-to-19-rise')

    } else if (workplaceCategory === "Maintained nursery school - disadvantaged list" &&
        disadvantagedMaintainedNurseryIneligible.includes(selectedNPQ)
    ) {
        res.redirect('/funding-messages/not-eligible/maintained-nursery-disadvantaged-list')

    } else if (workplaceCategory === "Maintained nursery school - disadvantaged list" &&
        disadvantagedMaintainedNurseryEligible.includes(selectedNPQ)
    ) {
        res.redirect('/funding-messages/eligible/maintained-nursery-disadvantaged-list')

    } else if (workplaceCategory === "Early years organisation - disadvantaged list" &&
        disadvantagedMaintainedNurseryEligible.includes(selectedNPQ)
    ) {
        res.redirect('/funding-messages/eligible/early-years-disadvantage-list')

    } else if (
        workplaceCategory === "Early years organisation - disadvantaged list" &&
        !disadvantagedMaintainedNurseryEligible.includes(selectedNPQ)
    ) {
        res.redirect('/funding-messages/not-eligible/early-years-disadvantage-list')

    } else if (workplaceCategory === "Maintained nursery school - disadvantaged list" &&
        publiclyFundedEligible.includes(selectedNPQ)
    ) {
        res.redirect('/funding-messages/eligible/publicly-funded-nursery')

    } else if (workplaceCategory === "A publicly funded: school, 16-19-setting, nursery, hospital school" &&
        publiclyFundedEligible.includes(selectedNPQ)
    ) {
        res.redirect('/funding-messages/eligible/publicly-funded-setting')

    } else if (workplaceCategory === "A publicly funded: school, 16-19-setting, nursery, hospital school" &&
        !publiclyFundedEligible.includes(selectedNPQ)
    ) {
        res.redirect('/funding-messages/not-eligible/publicly-funded-setting')

    } else if (workplaceCategory === "Early years organisation - disadvantaged list but also one of the settings eligible for SENCO and Headship" &&
        disadvantagedMaintainedNurseryIneligible.includes(selectedNPQ)
    ) {
        res.redirect('/funding-messages/not-eligible/early-years-disadvantage-list-senco-headship')

    } else if (workplaceCategory === "Early years organisation - disadvantaged list but also one of the settings eligible for SENCO and Headship" &&
        publiclyFundedEligible.includes(selectedNPQ)
    ) {
        res.redirect('/funding-messages/eligible/publicly-funded-setting')

    } else if (workplaceCategory === "Early years organisation - disadvantaged list but also one of the settings eligible for SENCO and Headship" &&
        disadvantagedMaintainedNurseryEligible.includes(selectedNPQ)
    ) {
        res.redirect('/funding-messages/eligible/early-years-disadvantage-list')

    } else {
        res.redirect('/funding-messages/not-eligible/workplace-not-eligible')
    }

})

router.post('/ofsted-number-funding-check-answer', function (req, res) {

    const doYouHaveOfstedNumber = req.session.data['do-you-have-ofsted-number'];
    const ofstedNumber = req.session.data['ofsted-number'];
    const selectedNpqs = req.session.data['npq-funded'];

    // Clear dependent fields
    req.session.data['funding-source-not-funded'] = null;
    req.session.data['select-provider-funded'] = null;

    const eligibleNpqs = ['Early years leadership'];
    const publiclyFundedNPQs = ['SENCO', 'Headship'];

    if (
        doYouHaveOfstedNumber === 'Yes' &&
        ofstedNumber === 'A childcare agency or childminder on the disadvantaged list' &&
        eligibleNpqs.includes(selectedNpqs)
    ) {
        res.redirect('/funding-messages/eligible/childcare-agency-childminder');

    } else if (
        doYouHaveOfstedNumber === 'Yes' &&
        ofstedNumber === 'A childcare agency or childminder on the disadvantaged list' &&
        !eligibleNpqs.includes(selectedNpqs)
    ) {
        res.redirect('/funding-messages/not-eligible/childcare-agency-childminder');

    } else if (
        doYouHaveOfstedNumber === 'Yes' &&
        ofstedNumber === 'An early years setting on the disadvantaged list' &&
        eligibleNpqs.includes(selectedNpqs)
    ) {
        res.redirect('/funding-messages/eligible/early-years-disadvantage-list');

    } else if (
        doYouHaveOfstedNumber === 'Yes' &&
        ofstedNumber === 'An early years setting on the disadvantaged list' &&
        !eligibleNpqs.includes(selectedNpqs)
    ) {
        res.redirect('/funding-messages/not-eligible/early-years-disadvantage-list');

    } else if (
      doYouHaveOfstedNumber === 'Yes' &&
      ofstedNumber === 'An early years setting on the disadvantaged list but also one of the settings eligible for SENCO and Headship' &&
      (
        eligibleNpqs.includes(selectedNpqs)
      )
    ) {
      res.redirect('/funding-messages/eligible/early-years-disadvantage-list');

    } else if (
        doYouHaveOfstedNumber === 'Yes' &&
        ofstedNumber === 'An early years setting on the disadvantaged list but also one of the settings eligible for SENCO and Headship' &&
        (
          publiclyFundedNPQs.includes(selectedNpqs)
        )
    ) {
        res.redirect('/funding-messages/eligible/publicly-funded-setting');

    } else if (
      doYouHaveOfstedNumber === 'Yes' &&
      ofstedNumber === 'An early years setting on the disadvantaged list but also one of the settings eligible for SENCO and Headship' &&
      (
        !eligibleNpqs.includes(selectedNpqs) ||
        !publiclyFundedNPQs.includes(selectedNpqs)
      )
    ) {
      res.redirect('/funding-messages/not-eligible/early-years-disadvantage-list-senco-headship');

    } else {
        res.redirect('/funding-messages/not-eligible/workplace-not-eligible');
    }

})


router.post('/maths-suitability-answer', function (req, res) {

    const npq = req.session.data['npq-funded']

    if (npq === 'Leading primary mathematics') {
        res.redirect('/suitability/teaching-for-mastery')
    } else {
        res.redirect('/funded-follow-up/provider')
    }

})

router.post('/maths-suitability-not-funded-answer', function (req, res) {

    const npq = req.session.data['npq-funded']

    if (npq === 'Leading primary mathematics') {
        res.redirect('/suitability/teaching-for-mastery')
    } else {
        res.redirect('/funded-follow-up/funding-source')
    }

})

router.post('/teaching-for-mastery-answer', function (req, res) {

    const teachingForMastery = req.session.data['teaching-for-mastery']

    if (teachingForMastery === 'Yes') {
        res.redirect('/suitability/suitable')
    } else {
        res.redirect('/suitability/understanding-mastery-approaches')
    }

})

router.post('/understanding-mastery-approaches-answer', function (req, res) {

    const understandingMasteryApproaches = req.session.data['understanding-mastery-approaches']

    if (understandingMasteryApproaches === 'Yes') {
        res.redirect('/suitability/suitable')
    } else {
        res.redirect('/suitability/cannot-register')
    }

})

router.post('/suitable-answer', function(req, res) {
    const npq = req.session.data['npq-funded'];
    const workplace = req.session.data['workplace'];

    if (
        npq === 'Leading primary mathematics' &&
        workplace === 'Maintained nursery school - disadvantaged list'
    ) {
        return res.redirect('/funded-follow-up/funding-source');
    }

    res.redirect('/funded-follow-up/provider');
});



/// EC Round 1 UR

//scenario selection
router.post("/ur1-scenario1-answer", function (req, res) {
  const data = req.session.data;
    
    if (data['ur1-start'] === "ur1-scenario1") {
        res.redirect('/ur-round1/start-page');
    } else {
        res.redirect('/ur-round1/start-page');
    }
});

//cohort selection
router.post("/ur1-cohort-answer", function (req, res) {
  const data = req.session.data;
    
    if (data['ur1-cohort'] === "autumn") {
        res.redirect('/ur-round1/check-funding-start');
    } else {
        res.redirect('/ur-round1/not-in-prototype');
    }
});


//work in england
router.post("/ur1-work-in-england-answer", function (req, res) {
  const data = req.session.data;
    
    if (data['ur1-england'] === "Yes") {
        res.redirect('/ur-round1/select-npq');
    } else {
        res.redirect('/ur-round1/england-ineligible');
    }
});


// previous funding
router.post("/ur1-previous-funding-answer", function (req, res) {
  const data = req.session.data;
    
    if (data['ur1-previous-funding'] === "Yes") {
        res.redirect('/ur-round1/previous-funding-ineligible');
    } else {
        res.redirect('/ur-round1/setting');
    }
});

// select npq
router.post("/ur1-select-npq", function (req, res) {
  const data = req.session.data;
  const selectedNpq = data['ur1-npq'];
    
    if (selectedNpq === "Leading teaching" || selectedNpq === "SENCO" || selectedNpq === "Early years leadership") {
        res.redirect('/ur-round1/previous-funding'); } 
     else {
        res.redirect('/ur-round1/not-in-prototype');
    }
});

// select setting
router.post('/ur1-setting', function (req, res) {

    const setting = req.session.data['ur1-setting']

    if (setting === "Early years") {
        res.redirect('/ur-round1/early-years-setting')
    } else if (setting === "School") {
        res.redirect('/ur-round1/workplace')
    } else {
        res.redirect('/ur-round1/not-in-prototype')
    }

})

// select workplace
router.post('/ur1-workplace', function (req, res) {

    const workplaceValue = req.session.data['ur1-workplace']

    if (workplaceValue === "scenario1") {
        res.redirect('/ur-round1/eligible1')
    } else if (workplaceValue === "scenario2") {
        res.redirect('/ur-round1/early-years-ineligible')
    } else {
        res.redirect('/ur-round1/not-in-prototype')
    }
})


// Early years setting
router.post('/ur1-early-years-answer', function (req, res) {

    const eaWorkplaceValue = req.session.data['ur1-early-years']

    if (eaWorkplaceValue === "Local authority-maintained nursery") {
        res.redirect('/ur-round1/workplace')
    } 
    else if (eaWorkplaceValue === "Pre-school class or nursery that's part of a school (maintained or independent)")
    {
        res.redirect('/ur-round1/workplace')
    }
    else {
        res.redirect('/ur-round1/ofsted')
    }
})

// Early years Ofsted
router.post('/ur1-ofsted-answer', function (req, res) {

  const hasOfsted = req.session.data['ur1-ofsted']
  const ofstedNumber = req.session.data['ofsted-number']

  if (hasOfsted === "No") {
    return res.redirect('/ur-round1/early-years-ineligible-no-ofsted')
  }

  if (ofstedNumber === "AB11111111") {
    return res.redirect('/ur-round1/early-years-eligible')
  }

  if (ofstedNumber === "XX88888888") {
    return res.redirect('/ur-round1/early-years-ineligible')
  }

  return res.redirect('/ur-round1/not-in-prototype')
})


/// EC Round 2 UR

router.post('/ur-round2/course-start-answer', function (req, res) {

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

    if (startMonth === "No, I already started in Spring") {
        res.redirect('/ur-round2/unfunded-path/select-npq')
    } else {
        res.redirect('/ur-round2/check-funding-start')
    }

})


router.all('/ur-round2/check-funding-answer', function (req, res) {

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
    } else if (req.body['check-funding'] === 'yes') {
        data['check-funding'] = 'yes';
        delete data['select-provider']
    }

    req.session.data = data;

    res.render('ur-round2/unfunded-path/select-npq', {
        data: data,
        serviceName: 'NPQ service'
    })

})


router.post('/ur-round2/england-funding-check-answer', function (req, res) {

    const data = req.session.data;

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

    if (data['england'] === "Yes") {
        res.redirect('/ur-round2/funding-check/select-npq');
    } else {
        res.redirect('/ur-round2/funding-messages/not-eligible/england');
    }
});


router.post('/ur-round2/select-npq-answer', function (req, res) {

    if (req.session.data['npq-funded'] === 'Early headship coaching offer') {
        res.redirect('/ur-round2/funding-check/ehco');
    } else {
        res.redirect('/ur-round2/funding-check/setting');
    }

})

router.get('/ur-round2/funding-check/setting', function (req, res) {
    const data = req.session.data;

    // Ensure the setting page starts with no preselected options.
    delete data['ur1-setting'];
    delete data['setting-funding-check'];
    delete data['school-setting'];

    res.render('ur-round2/funding-check/setting');
})

router.get('/ur-round2/funding-check/setting-v2', function (req, res) {
    const data = req.session.data;

    // Ensure the setting page starts with no preselected options.
    delete data['ur1-setting'];
    delete data['setting-funding-check'];
    delete data['school-setting'];

    res.render('ur-round2/funding-check/setting-v2');
})

router.post('/ur-round2/setting-funding-check-answer', function (req, res) {

    const data = req.session.data;

    delete data['workplace'];
    delete data['publicly-funded-nursery'];
    delete data['publicly-funded-hospital-school'];
    delete data['do-you-have-ofsted-number'];
    delete data['ofsted-number'];
    delete data['funding-source-not-funded'];

    // Support legacy and v2 setting inputs, then normalize for downstream pages.
    const topLevelSetting = data['ur1-setting'] || data['setting-funding-check'];
    const schoolSetting = data['school-setting'];
    const requiresSchoolDetail = topLevelSetting === 'School' || topLevelSetting === 'Schools';

    if (requiresSchoolDetail && !schoolSetting) {
        return res.render('ur-round2/funding-check/setting-v2', {
            schoolSettingError: { text: 'Select which type of school you work in' }
        });
    }

    // School sub-types should follow the same route as "School".
    const setting = requiresSchoolDetail ? 'School' : topLevelSetting;

    data['setting-funding-check'] = setting;

    if (!requiresSchoolDetail) {
        delete data['school-setting'];
    }

    const schoolsDropdown = [
        'School',
        'Schools',
        'Primary school',
        'Secondary school',
        'Post 16 provider',
        'Post-16 provider',
        'Special school',
        'Alternative provision',
        'Academy trust',
        '16 to 19 setting',
        'Preschool class',
        "Secure children's home or training centre",
        'Secure children’s home or training centre',
    ];

    const ofsted = [
        'Private nursery',
        'Childcare',
        'Other - early years',
    ];

    const role = [
        'Virtual school',
        'Working across schools',
    ];

    const employer = [
        'Young offender institution',
    ];

    const hospital = [
        'Hospital school',
    ];

    const nursery = [
        'Early years',
    ];

    const teacherTrainingProvider = [
        'As a lead mentor for an accredited ITT provider',
    ];

    if (schoolsDropdown.includes(setting)) {
        return res.redirect('/ur-round2/funding-check/workplace');
    }

    if (ofsted.includes(setting)) {
        return res.redirect('/ur-round2/funding-check/ofsted');
    }

    if (role.includes(setting)) {
        return res.redirect('/ur-round2/funding-check/role');
    }

    if (employer.includes(setting)) {
        return res.redirect('/ur-round2/funding-check/employer');
    }

    if (hospital.includes(setting)) {
        return res.redirect('/ur-round2/funding-check/hospital-school');
    }

    if (nursery.includes(setting)) {
        return res.redirect('/ur-round2/funding-check/nursery');
    }

    if (teacherTrainingProvider.includes(setting)) {
        return res.redirect('/ur-round2/funding-check/ITT-provider');
    }

    res.redirect('/ur-round2/funding-messages/not-eligible/other');

})


router.post('/ur-round2/nursery-funding-check-answer', function (req, res) {

    const data = req.session.data;
    const publiclyFundedNursery = data['publicly-funded-nursery'];

    delete data['workplace'];
    delete data['funding-source-not-funded'];
    delete data['do-you-have-ofsted-number'];
    delete data['ofsted-number'];
    delete data['select-provider-funded']

    if (publiclyFundedNursery === "Local authority-maintained nursery" || publiclyFundedNursery === "Pre-school class or nursery that’s part of a school (maintained or independent)") {
        res.redirect('/ur-round2/funding-check/workplace')
    } else if (publiclyFundedNursery === "Private nursery" || publiclyFundedNursery === "Childcare") {
        res.redirect('/ur-round2/funding-check/ofsted');
    } else {
        res.redirect('/ur-round2/funding-check/ofsted');
    }

});


router.post('/ur-round2/hospital-school-funding-check-answer', function (req, res) {

    var publiclyFundedHospitalSchool = req.session.data['publicly-funded-hospital-school']

    if (publiclyFundedHospitalSchool === "Yes") {
        res.redirect('/ur-round2/funding-check/workplace')
    } else {
        res.redirect('/ur-round2/funding-check/employer')
    }

})


router.post('/ur-round2/workplace-funding-check-answer', function (req, res) {

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
        "Leading teacher development",
        "Executive leadership"
    ]

    var disadvantagedMaintainedNurseryEligible = [
        "Early years leadership",
    ]

    var publiclyFundedEligible = [
        "Headship",
        "SENCO",
    ]

    if (workplaceCategory === "A workplace on either the schools, 16-19 or RISE list") {
        res.redirect('/ur-round2/funding-messages/eligible/schools-16-to-19-rise')

    } else if (workplaceCategory === "Maintained nursery school - disadvantaged list" &&
        disadvantagedMaintainedNurseryIneligible.includes(selectedNPQ)
    ) {
        res.redirect('/ur-round2/funding-messages/not-eligible/maintained-nursery-disadvantaged-list')

    } else if (workplaceCategory === "Maintained nursery school - disadvantaged list" &&
        disadvantagedMaintainedNurseryEligible.includes(selectedNPQ)
    ) {
        res.redirect('/ur-round2/funding-messages/eligible/maintained-nursery-disadvantaged-list')

    } else if (workplaceCategory === "Early years organisation - disadvantaged list" &&
        disadvantagedMaintainedNurseryEligible.includes(selectedNPQ)
    ) {
        res.redirect('/ur-round2/funding-messages/eligible/early-years-disadvantage-list')

    } else if (
        workplaceCategory === "Early years organisation - disadvantaged list" &&
        !disadvantagedMaintainedNurseryEligible.includes(selectedNPQ)
    ) {
        res.redirect('/ur-round2/funding-messages/not-eligible/early-years-disadvantage-list')

    } else if (workplaceCategory === "Maintained nursery school - disadvantaged list" &&
        publiclyFundedEligible.includes(selectedNPQ)
    ) {
        res.redirect('/ur-round2/funding-messages/eligible/publicly-funded-nursery')

    } else if (workplaceCategory === "A publicly funded: school, 16-19-setting, nursery, hospital school" &&
        publiclyFundedEligible.includes(selectedNPQ)
    ) {
        res.redirect('/ur-round2/funding-messages/eligible/publicly-funded-setting')

    } else if (workplaceCategory === "A publicly funded: school, 16-19-setting, nursery, hospital school" &&
        !publiclyFundedEligible.includes(selectedNPQ)
    ) {
        res.redirect('/ur-round2/funding-messages/not-eligible/publicly-funded-setting')

    } else if (workplaceCategory === "Early years organisation - disadvantaged list but also one of the settings eligible for SENCO and Headship" &&
        disadvantagedMaintainedNurseryIneligible.includes(selectedNPQ)
    ) {
        res.redirect('/ur-round2/funding-messages/not-eligible/early-years-disadvantage-list-senco-headship')

    } else if (workplaceCategory === "Early years organisation - disadvantaged list but also one of the settings eligible for SENCO and Headship" &&
        publiclyFundedEligible.includes(selectedNPQ)
    ) {
        res.redirect('/ur-round2/funding-messages/eligible/publicly-funded-setting')

    } else if (workplaceCategory === "Early years organisation - disadvantaged list but also one of the settings eligible for SENCO and Headship" &&
        disadvantagedMaintainedNurseryEligible.includes(selectedNPQ)
    ) {
        res.redirect('/ur-round2/funding-messages/eligible/early-years-disadvantage-list')

    } else {
        res.redirect('/ur-round2/funding-messages/not-eligible/workplace-not-eligible')
    }

})

router.post('/ur-round2/ofsted-number-funding-check-answer', function (req, res) {

    const doYouHaveOfstedNumber = req.session.data['do-you-have-ofsted-number'];
    const ofstedNumber = req.session.data['ofsted-number'];
    const selectedNpqs = req.session.data['npq-funded'];

    req.session.data['funding-source-not-funded'] = null;
    req.session.data['select-provider-funded'] = null;

    const eligibleNpqs = ['Early years leadership'];
    const publiclyFundedNPQs = ['SENCO', 'Headship'];

    if (
        doYouHaveOfstedNumber === 'Yes' &&
        ofstedNumber === 'A childcare agency or childminder on the disadvantaged list' &&
        eligibleNpqs.includes(selectedNpqs)
    ) {
        res.redirect('/ur-round2/funding-messages/eligible/childcare-agency-childminder');

    } else if (
        doYouHaveOfstedNumber === 'Yes' &&
        ofstedNumber === 'A childcare agency or childminder on the disadvantaged list' &&
        !eligibleNpqs.includes(selectedNpqs)
    ) {
        res.redirect('/ur-round2/funding-messages/not-eligible/childcare-agency-childminder');

    } else if (
        doYouHaveOfstedNumber === 'Yes' &&
        ofstedNumber === 'An early years setting on the disadvantaged list' &&
        eligibleNpqs.includes(selectedNpqs)
    ) {
        res.redirect('/ur-round2/funding-messages/eligible/early-years-disadvantage-list');

    } else if (
        doYouHaveOfstedNumber === 'Yes' &&
        ofstedNumber === 'An early years setting on the disadvantaged list' &&
        !eligibleNpqs.includes(selectedNpqs)
    ) {
        res.redirect('/ur-round2/funding-messages/not-eligible/early-years-disadvantage-list');

    } else if (
      doYouHaveOfstedNumber === 'Yes' &&
      ofstedNumber === 'An early years setting on the disadvantaged list but also one of the settings eligible for SENCO and Headship' &&
      (
        eligibleNpqs.includes(selectedNpqs)
      )
    ) {
      res.redirect('/ur-round2/funding-messages/eligible/early-years-disadvantage-list');

    } else if (
        doYouHaveOfstedNumber === 'Yes' &&
        ofstedNumber === 'An early years setting on the disadvantaged list but also one of the settings eligible for SENCO and Headship' &&
        (
          publiclyFundedNPQs.includes(selectedNpqs)
        )
    ) {
        res.redirect('/ur-round2/funding-messages/eligible/publicly-funded-setting');

    } else if (
      doYouHaveOfstedNumber === 'Yes' &&
      ofstedNumber === 'An early years setting on the disadvantaged list but also one of the settings eligible for SENCO and Headship' &&
      (
        !eligibleNpqs.includes(selectedNpqs) ||
        !publiclyFundedNPQs.includes(selectedNpqs)
      )
    ) {
      res.redirect('/ur-round2/funding-messages/not-eligible/early-years-disadvantage-list-senco-headship');

    } else {
        res.redirect('/ur-round2/funding-messages/not-eligible/workplace-not-eligible');
    }

})


router.post('/ur-round2/maths-suitability-answer', function (req, res) {

    const npq = req.session.data['npq-funded']

    if (npq === 'Leading primary mathematics') {
        res.redirect('/ur-round2/suitability/teaching-for-mastery')
    } else {
        res.redirect('/ur-round2/funded-follow-up/provider')
    }

})

router.post('/ur-round2/maths-suitability-not-funded-answer', function (req, res) {

    const npq = req.session.data['npq-funded']

    if (npq === 'Leading primary mathematics') {
        res.redirect('/ur-round2/suitability/teaching-for-mastery')
    } else {
        res.redirect('/ur-round2/funded-follow-up/funding-source')
    }

})

router.post('/ur-round2/teaching-for-mastery-answer', function (req, res) {

    const teachingForMastery = req.session.data['teaching-for-mastery']

    if (teachingForMastery === 'Yes') {
        res.redirect('/ur-round2/suitability/suitable')
    } else {
        res.redirect('/ur-round2/suitability/understanding-mastery-approaches')
    }

})

router.post('/ur-round2/understanding-mastery-approaches-answer', function (req, res) {

    const understandingMasteryApproaches = req.session.data['understanding-mastery-approaches']

    if (understandingMasteryApproaches === 'Yes') {
        res.redirect('/ur-round2/suitability/suitable')
    } else {
        res.redirect('/ur-round2/suitability/cannot-register')
    }

})

router.post('/ur-round2/suitable-answer', function(req, res) {
    const npq = req.session.data['npq-funded'];
    const workplace = req.session.data['workplace'];

    if (
        npq === 'Leading primary mathematics' &&
        workplace === 'Maintained nursery school - disadvantaged list'
    ) {
        return res.redirect('/ur-round2/funded-follow-up/funding-source');
    }

    res.redirect('/ur-round2/funded-follow-up/provider');
});

router.post('/ur-round2/echo-answer', function (req, res) {
    if (req.session.data['ehco'] === 'Yes') {
        res.redirect('/ur-round2/funded-follow-up/provider')
    } else {
        res.redirect('/ur-round2/funded-follow-up/funding-source')
    }
})

router.post('/ur-round2/path/of/next/page', function (req, res) {
    res.redirect('/ur-round2/not-in-prototype')
})

router.post('/ur-round2/national-insurance-answer', function (req, res) {
    const data = req.session.data;
    const hasNationalInsurance = data['has-national-insurance']
    const nationalInsuranceNumber = (data['national-insurance-number'] || '').trim()

    if (hasNationalInsurance === 'Yes') {
        data['national-insurance-number'] = nationalInsuranceNumber
    } else {
        delete data['national-insurance-number']
    }

    return res.redirect('/ur-round2/teacher-auth/trn')
})

router.post('/ur-round2/trn-answer', function (req, res) {
    const data = req.session.data;
    const hasTrn = data['has-trn'];
    const trnNumber = (data['trn-number'] || '').trim();

    if (hasTrn === 'Yes') {
        data['trn-number'] = trnNumber;
        return res.redirect('/ur-round2/teacher-auth/matched-success');
    }

    delete data['trn-number'];
    return res.redirect('/ur-round2/teacher-auth/continue-registration');
})

router.post('/ur-round2/teacher-auth/find-your-record', function (req, res) {
    res.redirect('/ur-round2/teacher-auth/find-your-record')
})

router.post('/ur-round2/teacher-auth/matched-success', function (req, res) {
    res.redirect('/ur-round2/teacher-auth/matched-success')
})


/// EC Round 2 UR Iterations

router.post('/ur-round2-iterations/course-start-answer', function (req, res) {

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

    if (startMonth === "No, I already started in Spring") {
        res.redirect('/ur-round2-iterations/unfunded-path/select-npq')
    } else {
        res.redirect('/ur-round2-iterations/check-funding-start')
    }

})


router.all('/ur-round2-iterations/check-funding-answer', function (req, res) {

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
    } else if (req.body['check-funding'] === 'yes') {
        data['check-funding'] = 'yes';
        delete data['select-provider']
    }

    req.session.data = data;

    res.render('ur-round2-iterations/unfunded-path/select-npq', {
        data: data,
        serviceName: 'NPQ service'
    })

})


router.post('/ur-round2-iterations/england-funding-check-answer', function (req, res) {

    const data = req.session.data;

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

    if (data['england'] === "Yes") {
        res.redirect('/ur-round2-iterations/funding-check/select-npq');
    } else {
        res.redirect('/ur-round2-iterations/funding-messages/not-eligible/england');
    }
});


router.post('/ur-round2-iterations/select-npq-answer', function (req, res) {

    if (req.session.data['npq-funded'] === 'Early headship coaching offer') {
        res.redirect('/ur-round2-iterations/funding-check/ehco');
    } else {
        res.redirect('/ur-round2-iterations/funding-check/setting-v2');
    }

})

router.get('/ur-round2-iterations/funding-check/setting', function (req, res) {
    res.redirect('/ur-round2-iterations/funding-check/setting-v2');
})

router.get('/ur-round2-iterations/funding-check/setting-v2', function (req, res) {
    const data = req.session.data;

    // Ensure the setting page starts with no preselected options.
    delete data['ur1-setting'];
    delete data['setting-funding-check'];
    delete data['school-setting'];

    res.render('ur-round2-iterations/funding-check/setting-v2');
})

router.post('/ur-round2-iterations/setting-funding-check-answer', function (req, res) {

    const data = req.session.data;

    delete data['workplace'];
    delete data['publicly-funded-nursery'];
    delete data['publicly-funded-hospital-school'];
    delete data['do-you-have-ofsted-number'];
    delete data['ofsted-number'];
    delete data['funding-source-not-funded'];

    // Support legacy and v2 setting inputs, then normalize for downstream pages.
    const topLevelSetting = data['ur1-setting'] || data['setting-funding-check'];
    const schoolSetting = data['school-setting'];
    const requiresSchoolDetail = topLevelSetting === 'School' || topLevelSetting === 'Schools';

    if (requiresSchoolDetail && !schoolSetting) {
        return res.render('ur-round2-iterations/funding-check/setting-v2', {
            schoolSettingError: { text: 'Select which type of school you work in' }
        });
    }

    // School sub-types should follow the same route as "School".
    const setting = requiresSchoolDetail ? 'School' : topLevelSetting;

    data['setting-funding-check'] = setting;

    if (!requiresSchoolDetail) {
        delete data['school-setting'];
    }

    const schoolsDropdown = [
        'School',
        'Schools',
        'Primary school',
        'Secondary school',
        'Post 16 provider',
        'Post-16 provider',
        'Special school',
        'Alternative provision',
        'Academy trust',
        '16 to 19 setting',
        'Preschool class',
        "Secure children's home or training centre",
        'Secure children’s home or training centre',
    ];

    const ofsted = [
        'Private nursery',
        'Childcare',
        'Other - early years',
    ];

    const role = [
        'Virtual school',
        'Working across schools',
    ];

    const employer = [
        'Young offender institution',
    ];

    const hospital = [
        'Hospital school',
    ];

    const nursery = [
        'Early years',
    ];

    const teacherTrainingProvider = [
        'As a lead mentor for an accredited ITT provider',
    ];

    if (schoolsDropdown.includes(setting)) {
        return res.redirect('/ur-round2-iterations/funding-check/workplace');
    }

    if (ofsted.includes(setting)) {
        return res.redirect('/ur-round2-iterations/funding-check/ofsted');
    }

    if (role.includes(setting)) {
        return res.redirect('/ur-round2-iterations/funding-check/role');
    }

    if (employer.includes(setting)) {
        return res.redirect('/ur-round2-iterations/funding-check/employer');
    }

    if (hospital.includes(setting)) {
        return res.redirect('/ur-round2-iterations/funding-check/hospital-school');
    }

    if (nursery.includes(setting)) {
        return res.redirect('/ur-round2-iterations/funding-check/nursery');
    }

    if (teacherTrainingProvider.includes(setting)) {
        return res.redirect('/ur-round2-iterations/funding-check/ITT-provider');
    }

    res.redirect('/ur-round2-iterations/funding-messages/not-eligible/other');

})


router.post('/ur-round2-iterations/nursery-funding-check-answer', function (req, res) {

    const data = req.session.data;
    const publiclyFundedNursery = data['publicly-funded-nursery'];

    delete data['workplace'];
    delete data['funding-source-not-funded'];
    delete data['do-you-have-ofsted-number'];
    delete data['ofsted-number'];
    delete data['select-provider-funded']

    if (publiclyFundedNursery === "Local authority-maintained nursery" || publiclyFundedNursery === "Pre-school class or nursery that’s part of a school (maintained or independent)") {
        res.redirect('/ur-round2-iterations/funding-check/workplace')
    } else if (publiclyFundedNursery === "Private nursery" || publiclyFundedNursery === "Childcare") {
        res.redirect('/ur-round2-iterations/funding-check/ofsted');
    } else {
        res.redirect('/ur-round2-iterations/funding-check/ofsted');
    }

});


router.post('/ur-round2-iterations/hospital-school-funding-check-answer', function (req, res) {

    var publiclyFundedHospitalSchool = req.session.data['publicly-funded-hospital-school']

    if (publiclyFundedHospitalSchool === "Yes") {
        res.redirect('/ur-round2-iterations/funding-check/workplace')
    } else {
        res.redirect('/ur-round2-iterations/funding-check/employer')
    }

})


router.post('/ur-round2-iterations/workplace-funding-check-answer', function (req, res) {

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
        "Leading teacher development",
        "Executive leadership"
    ]

    var disadvantagedMaintainedNurseryEligible = [
        "Early years leadership",
    ]

    var publiclyFundedEligible = [
        "Headship",
        "SENCO",
    ]

    if (workplaceCategory === "A workplace on either the schools, 16-19 or RISE list") {
        res.redirect('/ur-round2-iterations/funding-messages/eligible/schools-16-to-19-rise')

    } else if (workplaceCategory === "Maintained nursery school - disadvantaged list" &&
        disadvantagedMaintainedNurseryIneligible.includes(selectedNPQ)
    ) {
        res.redirect('/ur-round2-iterations/funding-messages/not-eligible/maintained-nursery-disadvantaged-list')

    } else if (workplaceCategory === "Maintained nursery school - disadvantaged list" &&
        disadvantagedMaintainedNurseryEligible.includes(selectedNPQ)
    ) {
        res.redirect('/ur-round2-iterations/funding-messages/eligible/maintained-nursery-disadvantaged-list')

    } else if (workplaceCategory === "Early years organisation - disadvantaged list" &&
        disadvantagedMaintainedNurseryEligible.includes(selectedNPQ)
    ) {
        res.redirect('/ur-round2-iterations/funding-messages/eligible/early-years-disadvantage-list')

    } else if (
        workplaceCategory === "Early years organisation - disadvantaged list" &&
        !disadvantagedMaintainedNurseryEligible.includes(selectedNPQ)
    ) {
        res.redirect('/ur-round2-iterations/funding-messages/not-eligible/early-years-disadvantage-list')

    } else if (workplaceCategory === "Maintained nursery school - disadvantaged list" &&
        publiclyFundedEligible.includes(selectedNPQ)
    ) {
        res.redirect('/ur-round2-iterations/funding-messages/eligible/publicly-funded-nursery')

    } else if (workplaceCategory === "A publicly funded: school, 16-19-setting, nursery, hospital school" &&
        publiclyFundedEligible.includes(selectedNPQ)
    ) {
        res.redirect('/ur-round2-iterations/funding-messages/eligible/publicly-funded-setting')

    } else if (workplaceCategory === "A publicly funded: school, 16-19-setting, nursery, hospital school" &&
        !publiclyFundedEligible.includes(selectedNPQ)
    ) {
        res.redirect('/ur-round2-iterations/funding-messages/not-eligible/publicly-funded-setting')

    } else if (workplaceCategory === "Early years organisation - disadvantaged list but also one of the settings eligible for SENCO and Headship" &&
        disadvantagedMaintainedNurseryIneligible.includes(selectedNPQ)
    ) {
        res.redirect('/ur-round2-iterations/funding-messages/not-eligible/early-years-disadvantage-list-senco-headship')

    } else if (workplaceCategory === "Early years organisation - disadvantaged list but also one of the settings eligible for SENCO and Headship" &&
        publiclyFundedEligible.includes(selectedNPQ)
    ) {
        res.redirect('/ur-round2-iterations/funding-messages/eligible/publicly-funded-setting')

    } else if (workplaceCategory === "Early years organisation - disadvantaged list but also one of the settings eligible for SENCO and Headship" &&
        disadvantagedMaintainedNurseryEligible.includes(selectedNPQ)
    ) {
        res.redirect('/ur-round2-iterations/funding-messages/eligible/early-years-disadvantage-list')

    } else {
        res.redirect('/ur-round2-iterations/funding-messages/not-eligible/workplace-not-eligible')
    }

})

router.post('/ur-round2-iterations/ofsted-number-funding-check-answer', function (req, res) {

    const doYouHaveOfstedNumber = req.session.data['do-you-have-ofsted-number'];
    const ofstedNumber = req.session.data['ofsted-number'];
    const selectedNpqs = req.session.data['npq-funded'];

    req.session.data['funding-source-not-funded'] = null;
    req.session.data['select-provider-funded'] = null;

    const eligibleNpqs = ['Early years leadership'];
    const publiclyFundedNPQs = ['SENCO', 'Headship'];

    if (
        doYouHaveOfstedNumber === 'Yes' &&
        ofstedNumber === 'A childcare agency or childminder on the disadvantaged list' &&
        eligibleNpqs.includes(selectedNpqs)
    ) {
        res.redirect('/ur-round2-iterations/funding-messages/eligible/childcare-agency-childminder');

    } else if (
        doYouHaveOfstedNumber === 'Yes' &&
        ofstedNumber === 'A childcare agency or childminder on the disadvantaged list' &&
        !eligibleNpqs.includes(selectedNpqs)
    ) {
        res.redirect('/ur-round2-iterations/funding-messages/not-eligible/childcare-agency-childminder');

    } else if (
        doYouHaveOfstedNumber === 'Yes' &&
        ofstedNumber === 'An early years setting on the disadvantaged list' &&
        eligibleNpqs.includes(selectedNpqs)
    ) {
        res.redirect('/ur-round2-iterations/funding-messages/eligible/early-years-disadvantage-list');

    } else if (
        doYouHaveOfstedNumber === 'Yes' &&
        ofstedNumber === 'An early years setting on the disadvantaged list' &&
        !eligibleNpqs.includes(selectedNpqs)
    ) {
        res.redirect('/ur-round2-iterations/funding-messages/not-eligible/early-years-disadvantage-list');

    } else if (
      doYouHaveOfstedNumber === 'Yes' &&
      ofstedNumber === 'An early years setting on the disadvantaged list but also one of the settings eligible for SENCO and Headship' &&
      (
        eligibleNpqs.includes(selectedNpqs)
      )
    ) {
      res.redirect('/ur-round2-iterations/funding-messages/eligible/early-years-disadvantage-list');

    } else if (
        doYouHaveOfstedNumber === 'Yes' &&
        ofstedNumber === 'An early years setting on the disadvantaged list but also one of the settings eligible for SENCO and Headship' &&
        (
          publiclyFundedNPQs.includes(selectedNpqs)
        )
    ) {
        res.redirect('/ur-round2-iterations/funding-messages/eligible/publicly-funded-setting');

    } else if (
      doYouHaveOfstedNumber === 'Yes' &&
      ofstedNumber === 'An early years setting on the disadvantaged list but also one of the settings eligible for SENCO and Headship' &&
      (
        !eligibleNpqs.includes(selectedNpqs) ||
        !publiclyFundedNPQs.includes(selectedNpqs)
      )
    ) {
      res.redirect('/ur-round2-iterations/funding-messages/not-eligible/early-years-disadvantage-list-senco-headship');

    } else {
        res.redirect('/ur-round2-iterations/funding-messages/not-eligible/workplace-not-eligible');
    }

})


router.post('/ur-round2-iterations/maths-suitability-answer', function (req, res) {

    const npq = req.session.data['npq-funded']

    if (npq === 'Leading primary mathematics') {
        res.redirect('/ur-round2-iterations/suitability/teaching-for-mastery')
    } else {
        res.redirect('/ur-round2-iterations/funded-follow-up/provider')
    }

})

router.post('/ur-round2-iterations/maths-suitability-not-funded-answer', function (req, res) {

    const npq = req.session.data['npq-funded']

    if (npq === 'Leading primary mathematics') {
        res.redirect('/ur-round2-iterations/suitability/teaching-for-mastery')
    } else {
        res.redirect('/ur-round2-iterations/funded-follow-up/funding-source')
    }

})

router.post('/ur-round2-iterations/teaching-for-mastery-answer', function (req, res) {

    const teachingForMastery = req.session.data['teaching-for-mastery']

    if (teachingForMastery === 'Yes') {
        res.redirect('/ur-round2-iterations/suitability/suitable')
    } else {
        res.redirect('/ur-round2-iterations/suitability/understanding-mastery-approaches')
    }

})

router.post('/ur-round2-iterations/understanding-mastery-approaches-answer', function (req, res) {

    const understandingMasteryApproaches = req.session.data['understanding-mastery-approaches']

    if (understandingMasteryApproaches === 'Yes') {
        res.redirect('/ur-round2-iterations/suitability/suitable')
    } else {
        res.redirect('/ur-round2-iterations/suitability/cannot-register')
    }

})

router.post('/ur-round2-iterations/suitable-answer', function(req, res) {
    const npq = req.session.data['npq-funded'];
    const workplace = req.session.data['workplace'];

    if (
        npq === 'Leading primary mathematics' &&
        workplace === 'Maintained nursery school - disadvantaged list'
    ) {
        return res.redirect('/ur-round2-iterations/funded-follow-up/funding-source');
    }

    res.redirect('/ur-round2-iterations/funded-follow-up/provider');
});

router.post('/ur-round2-iterations/echo-answer', function (req, res) {
    if (req.session.data['ehco'] === 'Yes') {
        res.redirect('/ur-round2-iterations/funded-follow-up/provider')
    } else {
        res.redirect('/ur-round2-iterations/funded-follow-up/funding-source')
    }
})

router.post('/ur-round2-iterations/path/of/next/page', function (req, res) {
    res.redirect('/ur-round2-iterations/not-in-prototype')
})

router.post('/ur-round2-iterations/national-insurance-answer', function (req, res) {
    const data = req.session.data;
    const hasNationalInsurance = data['has-national-insurance']
    const nationalInsuranceNumber = (data['national-insurance-number'] || '').trim()

    if (hasNationalInsurance === 'Yes') {
        data['national-insurance-number'] = nationalInsuranceNumber
    } else {
        delete data['national-insurance-number']
    }

    return res.redirect('/ur-round2-iterations/teacher-auth/trn')
})

router.post('/ur-round2-iterations/trn-answer', function (req, res) {
    const data = req.session.data;
    const hasTrn = data['has-trn'];
    const trnNumber = (data['trn-number'] || '').trim();

    if (hasTrn === 'Yes') {
        data['trn-number'] = trnNumber;
        return res.redirect('/ur-round2-iterations/teacher-auth/matched-success');
    }

    delete data['trn-number'];
    return res.redirect('/ur-round2-iterations/teacher-auth/continue-registration');
})

router.post('/ur-round2-iterations/teacher-auth/find-your-record', function (req, res) {
    res.redirect('/ur-round2-iterations/teacher-auth/find-your-record')
})

router.post('/ur-round2-iterations/teacher-auth/matched-success', function (req, res) {
    res.redirect('/ur-round2-iterations/teacher-auth/matched-success')
})

/// Finalised journeys (based on EC Round 2 UR iterations)

router.post('/finalised-journeys/course-start-answer', function (req, res) {

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

    if (startMonth === "No, I already started in Spring") {
        res.redirect('/finalised-journeys/unfunded-path/select-npq')
    } else {
        res.redirect('/finalised-journeys/check-funding-start')
    }

})


router.all('/finalised-journeys/check-funding-answer', function (req, res) {

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
    } else if (req.body['check-funding'] === 'yes') {
        data['check-funding'] = 'yes';
        delete data['select-provider']
    }

    req.session.data = data;

    res.render('finalised-journeys/unfunded-path/select-npq', {
        data: data,
        serviceName: 'NPQ service'
    })

})


router.post('/finalised-journeys/england-funding-check-answer', function (req, res) {

    const data = req.session.data;

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

    if (data['england'] === "Yes") {
        res.redirect('/finalised-journeys/funding-check/select-npq');
    } else {
        res.redirect('/finalised-journeys/funding-messages/not-eligible/england');
    }
});


router.post('/finalised-journeys/select-npq-answer', function (req, res) {

    if (req.session.data['npq-funded'] === 'Early headship coaching offer') {
        res.redirect('/finalised-journeys/funding-check/ehco');
    } else {
        res.redirect('/finalised-journeys/funding-check/previous-funding');
    }

})

router.post('/finalised-journeys/previous-funding-answer', function (req, res) {

    const previousFunding = req.session.data['previous-funding'];

    if (previousFunding === "Yes") {
        return res.redirect('/finalised-journeys/funding-messages/other-outcome');
    }

    res.redirect('/finalised-journeys/funding-check/setting-v2');
})

router.get('/finalised-journeys/funding-check/setting', function (req, res) {
    res.redirect('/finalised-journeys/funding-check/setting-v2');
})

router.get('/finalised-journeys/funding-check/setting-v2', function (req, res) {
    const data = req.session.data;

    delete data['ur1-setting'];
    delete data['setting-funding-check'];
    delete data['school-setting'];

    res.render('finalised-journeys/funding-check/setting-v2');
})

router.post('/finalised-journeys/setting-funding-check-answer', function (req, res) {

    const data = req.session.data;

    delete data['workplace'];
    delete data['publicly-funded-nursery'];
    delete data['publicly-funded-hospital-school'];
    delete data['do-you-have-ofsted-number'];
    delete data['ofsted-number'];
    delete data['funding-source-not-funded'];

    const topLevelSetting = data['ur1-setting'] || data['setting-funding-check'];
    const schoolSetting = data['school-setting'];
    const requiresSchoolDetail = topLevelSetting === 'School' || topLevelSetting === 'Schools';

    if (requiresSchoolDetail && !schoolSetting) {
        return res.render('finalised-journeys/funding-check/setting-v2', {
            schoolSettingError: { text: 'Select which type of school you work in' }
        });
    }

    const setting = requiresSchoolDetail ? 'School' : topLevelSetting;

    data['setting-funding-check'] = setting;

    if (!requiresSchoolDetail) {
        delete data['school-setting'];
    }

    const schoolsDropdown = [
        'School',
        'Schools',
        'Primary school',
        'Secondary school',
        'Post 16 provider',
        'Post-16 provider',
        'Special school',
        'Alternative provision',
        'Academy trust',
        '16 to 19 setting',
        'Preschool class',
        "Secure children's home or training centre",
        'Secure children’s home or training centre',
    ];

    const ofsted = [
        'Private nursery',
        'Childcare',
        'Other - early years',
    ];

    const role = [
        'Virtual school',
        'Working across schools',
    ];

    const employer = [
        'Young offender institution',
    ];

    const hospital = [
        'Hospital school',
    ];

    const nursery = [
        'Early years',
    ];

    const teacherTrainingProvider = [
        'As a lead mentor for an accredited ITT provider',
    ];

    if (schoolsDropdown.includes(setting)) {
        return res.redirect('/finalised-journeys/funding-check/workplace')
    } else if (ofsted.includes(setting)) {
        return res.redirect('/finalised-journeys/funding-check/ofsted')
    } else if (role.includes(setting)) {
        return res.redirect('/finalised-journeys/funding-check/role')
    } else if (employer.includes(setting)) {
        return res.redirect('/finalised-journeys/funding-check/employer')
    } else if (hospital.includes(setting)) {
        return res.redirect('/finalised-journeys/funding-check/hospital-school')
    } else if (nursery.includes(setting)) {
        return res.redirect('/finalised-journeys/funding-check/nursery')
    } else if (teacherTrainingProvider.includes(setting)) {
        return res.redirect('/finalised-journeys/funding-check/ITT-provider')
    }

    res.redirect('/finalised-journeys/funding-messages/not-eligible/other');
})

router.post('/finalised-journeys/nursery-funding-check-answer', function (req, res) {

    const data = req.session.data;
    const publiclyFundedNursery = data['publicly-funded-nursery'];

    delete data['workplace'];
    delete data['funding-source-not-funded'];
    delete data['do-you-have-ofsted-number'];
    delete data['ofsted-number'];
    delete data['select-provider-funded']

    if (publiclyFundedNursery === "Local authority-maintained nursery" || publiclyFundedNursery === "Pre-school class or nursery that’s part of a school (maintained or independent)") {
        res.redirect('/finalised-journeys/funding-check/workplace')
    } else if (publiclyFundedNursery === "Private nursery" || publiclyFundedNursery === "Childcare") {
        res.redirect('/finalised-journeys/funding-check/ofsted');
    } else {
        res.redirect('/finalised-journeys/funding-check/ofsted');
    }

});


router.post('/finalised-journeys/hospital-school-funding-check-answer', function (req, res) {

    var publiclyFundedHospitalSchool = req.session.data['publicly-funded-hospital-school']

    if (publiclyFundedHospitalSchool === "Yes") {
        res.redirect('/finalised-journeys/funding-check/workplace')
    } else {
        res.redirect('/finalised-journeys/funding-check/employer')
    }

})


router.post('/finalised-journeys/workplace-funding-check-answer', function (req, res) {

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
        "Leading teacher development",
        "Executive leadership"
    ]

    var disadvantagedMaintainedNurseryEligible = [
        "Early years leadership",
    ]

    var publiclyFundedEligible = [
        "Headship",
        "SENCO",
    ]

    if (workplaceCategory === "A workplace on either the schools, 16-19 or RISE list") {
        res.redirect('/finalised-journeys/funding-messages/eligible/schools-16-to-19-rise')

    } else if (workplaceCategory === "Maintained nursery school - disadvantaged list" &&
        disadvantagedMaintainedNurseryIneligible.includes(selectedNPQ)
    ) {
        res.redirect('/finalised-journeys/funding-messages/not-eligible/maintained-nursery-disadvantaged-list')

    } else if (workplaceCategory === "Maintained nursery school - disadvantaged list" &&
        disadvantagedMaintainedNurseryEligible.includes(selectedNPQ)
    ) {
        res.redirect('/finalised-journeys/funding-messages/eligible/maintained-nursery-disadvantaged-list')

    } else if (workplaceCategory === "Early years organisation - disadvantaged list" &&
        disadvantagedMaintainedNurseryEligible.includes(selectedNPQ)
    ) {
        res.redirect('/finalised-journeys/funding-messages/eligible/early-years-disadvantage-list')

    } else if (
        workplaceCategory === "Early years organisation - disadvantaged list" &&
        !disadvantagedMaintainedNurseryEligible.includes(selectedNPQ)
    ) {
        res.redirect('/finalised-journeys/funding-messages/not-eligible/early-years-disadvantage-list')

    } else if (workplaceCategory === "Maintained nursery school - disadvantaged list" &&
        publiclyFundedEligible.includes(selectedNPQ)
    ) {
        res.redirect('/finalised-journeys/funding-messages/eligible/publicly-funded-nursery')

    } else if (workplaceCategory === "A publicly funded: school, 16-19-setting, nursery, hospital school" &&
        publiclyFundedEligible.includes(selectedNPQ)
    ) {
        res.redirect('/finalised-journeys/funding-messages/eligible/publicly-funded-setting')

    } else if (workplaceCategory === "A publicly funded: school, 16-19-setting, nursery, hospital school" &&
        !publiclyFundedEligible.includes(selectedNPQ)
    ) {
        res.redirect('/finalised-journeys/funding-messages/not-eligible/publicly-funded-setting')

    } else if (workplaceCategory === "Early years organisation - disadvantaged list but also one of the settings eligible for SENCO and Headship" &&
        disadvantagedMaintainedNurseryIneligible.includes(selectedNPQ)
    ) {
        res.redirect('/finalised-journeys/funding-messages/not-eligible/early-years-disadvantage-list-senco-headship')

    } else if (workplaceCategory === "Early years organisation - disadvantaged list but also one of the settings eligible for SENCO and Headship" &&
        publiclyFundedEligible.includes(selectedNPQ)
    ) {
        res.redirect('/finalised-journeys/funding-messages/eligible/publicly-funded-setting')

    } else if (workplaceCategory === "Early years organisation - disadvantaged list but also one of the settings eligible for SENCO and Headship" &&
        disadvantagedMaintainedNurseryEligible.includes(selectedNPQ)
    ) {
        res.redirect('/finalised-journeys/funding-messages/eligible/early-years-disadvantage-list')

    } else {
        res.redirect('/finalised-journeys/funding-messages/not-eligible/workplace-not-eligible')
    }

})

router.post('/finalised-journeys/ofsted-answer', function (req, res) {
    const urn = req.session.data['urn']

    if (urn === 'yes') {
        return res.redirect('/finalised-journeys/funding-check/ofsted-follow-up')
    }

    res.redirect('/finalised-journeys/funding-messages/not-eligible/early-years-disadvantage-list-senco-headship')
})


router.post('/finalised-journeys/ofsted-number-funding-check-answer', function (req, res) {

    const ofstedNumber = req.session.data['ofsted-number']
    const doYouHaveOfstedNumber = req.session.data['do-you-have-ofsted-number']
    const selectedNpqs = req.session.data['npq-funded']

    const eligibleNpqs = [
        'Leading teacher development',
        'Leading teaching',
        'Leading primary mathematics',
        'Senior leadership',
        'Leading behaviour and culture',
        'Early years leadership',
        'SENCO',
        'Headship',
    ]

    const publiclyFundedNPQs = [
        'NPQ for teachers',
        'NPQ for headteachers',
        'NPQ for senior leaders',
        'NPQ for school leaders',
        'NPQ for early years leaders',
        'NPQ for leading teacher development',
        'NPQ for leading teaching',
        'NPQ for leading primary mathematics',
        'NPQ for leading behaviour and culture',
        'NPQ for executive leaders',
        'NPQ for special educational needs coordinators (SENCOs)',
        'NPQ for headship',
        'NPQ for senior leadership',
        'NPQ for early years leadership',
        'NPQ for leading literacy',
        'NPQ for leading teaching development',
    ]

    if (doYouHaveOfstedNumber === 'No' || ofstedNumber === 'Not sure') {
        res.redirect('/finalised-journeys/funding-messages/not-eligible/childcare-agency-childminder');

    } else if (
      doYouHaveOfstedNumber === 'Yes' &&
      ofstedNumber === 'An early years setting on the disadvantaged list but not one of the settings eligible for SENCO and Headship' &&
      eligibleNpqs.includes(selectedNpqs)
    ) {
      res.redirect('/finalised-journeys/funding-messages/eligible/early-years-disadvantage-list');

    } else if (
      doYouHaveOfstedNumber === 'Yes' &&
      ofstedNumber === 'An early years setting on the disadvantaged list but not one of the settings eligible for SENCO and Headship' &&
      !eligibleNpqs.includes(selectedNpqs)
    ) {
      res.redirect('/finalised-journeys/funding-messages/not-eligible/early-years-disadvantage-list');

    } else if (
      doYouHaveOfstedNumber === 'Yes' &&
      ofstedNumber === 'An early years setting that is publicly funded but not on the disadvantaged list' &&
      publiclyFundedNPQs.includes(selectedNpqs)
    ) {
      res.redirect('/finalised-journeys/funding-messages/eligible/publicly-funded-setting');

    } else if (
      doYouHaveOfstedNumber === 'Yes' &&
      ofstedNumber === 'An early years setting that is publicly funded but not on the disadvantaged list' &&
      !publiclyFundedNPQs.includes(selectedNpqs)
    ) {
      res.redirect('/finalised-journeys/funding-messages/not-eligible/publicly-funded-setting');

    } else if (
      doYouHaveOfstedNumber === 'Yes' &&
      ofstedNumber === 'An early years setting on the disadvantaged list but also one of the settings eligible for SENCO and Headship' &&
      eligibleNpqs.includes(selectedNpqs)
    ) {
      res.redirect('/finalised-journeys/funding-messages/eligible/early-years-disadvantage-list');

    } else if (
        doYouHaveOfstedNumber === 'Yes' &&
        ofstedNumber === 'An early years setting on the disadvantaged list but also one of the settings eligible for SENCO and Headship' &&
        publiclyFundedNPQs.includes(selectedNpqs)
    ) {
        res.redirect('/finalised-journeys/funding-messages/eligible/publicly-funded-setting');

    } else if (
      doYouHaveOfstedNumber === 'Yes' &&
      ofstedNumber === 'An early years setting on the disadvantaged list but also one of the settings eligible for SENCO and Headship' &&
      (
        !eligibleNpqs.includes(selectedNpqs) ||
        !publiclyFundedNPQs.includes(selectedNpqs)
      )
    ) {
      res.redirect('/finalised-journeys/funding-messages/not-eligible/early-years-disadvantage-list-senco-headship');

    } else {
        res.redirect('/finalised-journeys/funding-messages/not-eligible/workplace-not-eligible');
    }

})


router.post('/finalised-journeys/maths-suitability-answer', function (req, res) {

    const npq = req.session.data['npq-funded']

    if (npq === 'Leading primary mathematics') {
        res.redirect('/finalised-journeys/suitability/teaching-for-mastery')
    } else {
        res.redirect('/finalised-journeys/funded-follow-up/provider')
    }

})

router.post('/finalised-journeys/maths-suitability-not-funded-answer', function (req, res) {

    const npq = req.session.data['npq-funded']

    if (npq === 'Leading primary mathematics') {
        res.redirect('/finalised-journeys/suitability/teaching-for-mastery')
    } else {
        res.redirect('/finalised-journeys/funded-follow-up/funding-source')
    }

})

router.post('/finalised-journeys/teaching-for-mastery-answer', function (req, res) {

    const teachingForMastery = req.session.data['teaching-for-mastery']

    if (teachingForMastery === 'Yes') {
        res.redirect('/finalised-journeys/suitability/suitable')
    } else {
        res.redirect('/finalised-journeys/suitability/understanding-mastery-approaches')
    }

})

router.post('/finalised-journeys/understanding-mastery-approaches-answer', function (req, res) {

    const understandingMasteryApproaches = req.session.data['understanding-mastery-approaches']

    if (understandingMasteryApproaches === 'Yes') {
        res.redirect('/finalised-journeys/suitability/suitable')
    } else {
        res.redirect('/finalised-journeys/suitability/cannot-register')
    }

})

router.post('/finalised-journeys/suitable-answer', function(req, res) {
    const npq = req.session.data['npq-funded'];
    const workplace = req.session.data['workplace'];

    if (
        npq === 'Leading primary mathematics' &&
        workplace === 'Maintained nursery school - disadvantaged list'
    ) {
        return res.redirect('/finalised-journeys/funded-follow-up/funding-source');
    }

    res.redirect('/finalised-journeys/funded-follow-up/provider');
});

router.post('/finalised-journeys/echo-answer', function (req, res) {
    if (req.session.data['ehco'] === 'Yes') {
        res.redirect('/finalised-journeys/funded-follow-up/provider')
    } else {
        res.redirect('/finalised-journeys/funded-follow-up/funding-source')
    }
})

router.post('/finalised-journeys/path/of/next/page', function (req, res) {
    res.redirect('/finalised-journeys/not-in-prototype')
})

router.post('/finalised-journeys/national-insurance-answer', function (req, res) {
    const data = req.session.data;
    const hasNationalInsurance = data['has-national-insurance']
    const nationalInsuranceNumber = (data['national-insurance-number'] || '').trim()

    if (hasNationalInsurance === 'Yes') {
        data['national-insurance-number'] = nationalInsuranceNumber
    } else {
        delete data['national-insurance-number']
    }

    return res.redirect('/finalised-journeys/teacher-auth/trn')
})

router.post('/finalised-journeys/trn-answer', function (req, res) {
    const data = req.session.data;
    const hasTrn = data['has-trn'];
    const trnNumber = (data['trn-number'] || '').trim();

    if (hasTrn === 'Yes') {
        data['trn-number'] = trnNumber;
        return res.redirect('/finalised-journeys/teacher-auth/matched-success');
    }

    delete data['trn-number'];
    return res.redirect('/finalised-journeys/teacher-auth/continue-registration');
})

router.post('/finalised-journeys/teacher-auth/find-your-record', function (req, res) {
    res.redirect('/finalised-journeys/teacher-auth/find-your-record')
})

router.post('/finalised-journeys/teacher-auth/matched-success', function (req, res) {
    res.redirect('/finalised-journeys/teacher-auth/matched-success')
})


/// EC Round 3 UR

router.post('/ur-round3/course-start-answer', function (req, res) {

    var startMonth = req.session.data['course-start']
    const data = req.session.data;

    delete data['check-funding'];
    delete data['england'];
    delete data['previous-funding'];
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

    if (startMonth === "No, I already started in Spring") {
        res.redirect('/ur-round3/not-in-prototype')
    } else {
        res.redirect('/ur-round3/funding-check/england')
    }

})


router.all('/ur-round3/check-funding-answer', function (req, res) {

    const data = req.session.data || {};

    delete data['england'];
    delete data['previous-funding'];
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
        return res.redirect('/ur-round3/not-in-prototype');
    }

    if (req.body['check-funding'] === 'yes') {
        data['check-funding'] = 'yes';
        delete data['select-provider']
        return res.redirect('/ur-round3/funding-check/england');
    }

    res.redirect('/ur-round3/check-funding-start')

})


router.post('/ur-round3/funding-check/england', function (req, res) {
    res.redirect('/ur-round3/funding-check/england')
})


router.post('/ur-round3/england-funding-check-answer', function (req, res) {

    const data = req.session.data;

    delete data['previous-funding'];
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

    if (data['england'] === "Yes") {
        res.redirect('/ur-round3/funding-check/select-npq');
    } else {
        res.redirect('/ur-round3/funding-messages/other-outcome');
    }
});


router.post('/ur-round3/select-npq-answer', function (req, res) {

    if (req.session.data['npq-funded'] === 'Early headship coaching offer') {
        res.redirect('/ur-round3/funding-check/ehco');
    } else {
        res.redirect('/ur-round3/funding-check/previous-funding');
    }

})


router.post('/ur-round3/previous-funding-answer', function (req, res) {

    const previousFunding = req.session.data['previous-funding'];

    if (previousFunding === "Yes") {
        return res.redirect('/ur-round3/funding-messages/other-outcome');
    }

    res.redirect('/ur-round3/funding-check/workplace');
})


// Removed ur-round3 setting routes (setting and setting-v2 no longer used).


router.post('/ur-round3/nursery-funding-check-answer', function (req, res) {

    const data = req.session.data;
    const publiclyFundedNursery = data['publicly-funded-nursery'];

    delete data['workplace'];
    delete data['funding-source-not-funded'];
    delete data['do-you-have-ofsted-number'];
    delete data['ofsted-number'];
    delete data['select-provider-funded']

    if (publiclyFundedNursery === "Local authority-maintained nursery" || publiclyFundedNursery === "Pre-school class or nursery that’s part of a school (maintained or independent)") {
        res.redirect('/ur-round3/funding-check/workplace')
    } else if (publiclyFundedNursery === "Private nursery" || publiclyFundedNursery === "Childminding") {
        res.redirect('/ur-round3/funding-check/ofsted');
    } else {
        res.redirect('/ur-round3/funding-check/ofsted');
    }

});


router.post('/ur-round3/hospital-school-funding-check-answer', function (req, res) {

    var publiclyFundedHospitalSchool = req.session.data['publicly-funded-hospital-school']

    if (publiclyFundedHospitalSchool === "Yes") {
        res.redirect('/ur-round3/funding-check/workplace')
    } else {
        res.redirect('/ur-round3/funding-check/employer')
    }

})


router.post('/ur-round3/workplace-funding-check-answer', function (req, res) {
    const workplace = req.session.data['workplace'];

    if (workplace === 'Riverside School') {
        return res.redirect('/ur-round3/confirm-workplace');
    }

    if (workplace === 'Little Acorns Nursery') {
        return res.redirect('/ur-round3/select-workplace');
    }

    res.redirect('/ur-round3/not-in-prototype');
})


router.post('/ur-round3/ofsted-number-funding-check-answer', function (req, res) {
    res.redirect('/ur-round3/funding-messages/other-outcome')
})


router.post('/ur-round3/echo-answer', function (req, res) {
    res.redirect('/ur-round3/funding-messages/other-outcome')
})


router.post('/ur-round3/path/of/next/page', function (req, res) {
    res.redirect('/ur-round3/not-in-prototype')
})


router.post('/ur-round3/select-workplace', function (req, res) {
    const workplace = req.session.data['workplace'];

    if (workplace === 'Riverside School') {
        return res.redirect('/ur-round3/confirm-workplace');
    }

    if (workplace === 'Little Acorns Nursery') {
        return res.redirect('/ur-round3/select-workplace');
    }

    res.redirect('/ur-round3/not-in-prototype');
})


router.post('/ur-round3/select-workplace-answer', function (req, res) {
    const workplace = req.session.data['workplace'];

    if (workplace === 'none' || workplace === 'Other') {
        return res.redirect('/ur-round3/ineligible-workplace-other');
    }

    res.redirect('/ur-round3/enter-manually');
})


router.post('/ur-round3/confirm-workplace-answer', function (req, res) {
    const workplaceConfirmation = req.session.data['workplace'];

    if (workplaceConfirmation === 'Yes') {
        return res.redirect('/ur-round3/funding-messages/other-outcome');
    }

    if (workplaceConfirmation === 'No, change my answer') {
        return res.redirect('/ur-round3/select-workplace');
    }

    if (workplaceConfirmation === 'Let me enter my details manually') {
        return res.redirect('/ur-round3/funding-check/workplace');
    }

    res.redirect('/ur-round3/confirm-workplace');
})


router.post('/ur-round3/enter-manually-answer', function (req, res) {
    res.redirect('/ur-round3/not-in-prototype')
})


router.post('/ur-round3/route-workplace-answer', function (req, res) {
    const routeWorkplace = req.session.data['workplace'];

    if (routeWorkplace === 'Let me enter my details manually') {
        return res.redirect('/ur-round3/funding-check/workplace');
    }

    res.redirect('/ur-round3/confirm-workplace');
})


router.post('/ur-round3/not-in-prototype', function (req, res) {
    res.redirect('/ur-round3/not-in-prototype')
})
