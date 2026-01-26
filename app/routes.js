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

    if (publiclyFundedNursery === "Yes") {
        res.redirect('/funding-check/workplace');
    } else {
        res.redirect('/funding-check/ofsted');
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

    const eligibleNpqs = ['Early years leadership', 'Leading teacher development'];

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

    } else {
        res.redirect('/funding-messages/not-eligible-for-funding-workplace-not-eligible');
    }

})


router.post('/funded-answer', function (req, res) {

    const npq = req.session.data['npq-funded']

    if (npq === 'Leading primary mathematics') {
        res.redirect('/suitability/teaching-for-mastery')
    } else {
        res.redirect('/funded-follow-up/provider')
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



;
