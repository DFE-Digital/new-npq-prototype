//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()

router.post('/select-npq', function (req, res) {

    var startMonth = req.session.data['course-start']

    if (startMonth === "April 2026") {
        res.redirect('/select-npq')
    } else {
        res.redirect('/check-funding-start')
    }

})

router.post('/select-npq-funding-check', function (req, res) {

    var workEngland = req.session.data['england']

    if (workEngland === "Yes") {
        res.redirect('/select-npq-funding-check')
    } else {
        res.redirect('/not-eligible-for-funding-england')
    }

})