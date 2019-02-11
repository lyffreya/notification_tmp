
var attempt = 3; // Variable to count number of attempts.
// Below function Executes on click of login button.
function validate(){
    var phone_num = document.getElementById("number").value;
    //var password = document.getElementById("password").value;

    //var phoneno = /^\+?([0-9]{2})\)?[-. ]?([0-9]{4})[-. ]?([0-9]{4})$/;
    //&& phone_num.value.match(phoneno)
    var carrier_type = document.getElementsByName("carrier").value;


    if ( phone_num != "" && carrier_type=="1"){
        alert ("Login successfully");
        //window.location = "success.html"; // Redirecting to other page.
        return false;
    }
    else{
        attempt --;// Decrementing by one.
        alert("You have left "+attempt+" attempt;");
        // Disabling fields after 3 attempts.
        if( attempt == 0){
            alert("No attempts left.");
            return false;
        }
    }
}

var user = {
    number: 1234567890,
    carrier: "AT&T",
    route: "East",
    stop= "",
    submit: false,
    get_usernumber : function(){
        return this.number
    },
    get_carriertype: function(){
        return this.carrier
    },
    get_route: function(){
        return this.route
    },
    get_stop: function(){
        return this.stop
    },
    get_submitstate: function(){
        return this.submit
    }
};




