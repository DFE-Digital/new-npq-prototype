//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()



// Run this code when a form is submitted to 'select-npq'
router.post('/select-npq', function (req, res) {

    // Get the value from the radio buttons
    var startMonth = req.session.data['course-start']

    // Check which option the user selected
    if (startMonth === "April 2026") {
        // Send user to the November-specific page
        res.redirect('/select-npq')
    } else {
        // Send user to the default April page
        res.redirect('/check-funding-start')
    }

})