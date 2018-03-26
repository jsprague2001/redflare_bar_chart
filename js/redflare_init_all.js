// Initalize variables
// Show global information
// Future: Iterate through all classes and display IDs.

dataFilePath = './data/';
console.log('D3 version: ' + d3.version);

function formatDate(dateIn, dateFmt) {
    /*  dateFmt = Y (2018) MY (March 2018) MDY (March 22, 2018) */
    var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", 
    "September", "October", "November", "December"];
    var dateIn = new Date(dateIn);
    var dateFmt = dateFmt.trim();
    //barYear.getMonth();
    if (dateFmt == '') {
      var dateString = dateIn.getFullYear();
    }
    else {
      if (dateFmt == 'Y') {
        var dateString = dateIn.getFullYear();
        //var dateString = 'Year';
      }
      if (dateFmt == 'MY') {
        var dateString = monthNames[dateIn.getMonth()] + ' ' + dateIn.getFullYear();
        //var dateString = 'Month & Year';
      }
      if (dateFmt == 'MDY') {
        var dateString = monthNames[dateIn.getMonth()] + ' ' + dateIn.getDate()  + ', ' + dateIn.getFullYear();
        //var dateString = 'Month Day Year';
      }
    }
    return dateString;
}
