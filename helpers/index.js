//reusable function
const moment = require('moment')

const formatDate = (date) => {
    return moment(date).format("MMM Do YY");
}

const formatStatusStyle = (statusName) => {
    let style;
    if (statusName === 'Pending') {
        style = 'border-bottom: 4px solid #FFC23D;'
    } else if (statusName === 'In-progress') {
        style = 'border-bottom: 4px solid #3dff70;'
    } else if (statusName === 'Assigned') {
        style = 'border-bottom: 4px solid #1f44cc;'
    } else if (statusName === 'Delivered') {
        style = 'border-bottom: 4px solid #4AA746;'
    } else if (statusName === 'Failed') {
        style = 'border-bottom: 4px solid red;'
    }
    return style
}

module.exports = {
    formatDate,
    formatStatusStyle
}
