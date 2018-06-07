var number = 10;
var intervalId;   
var index1;
var index2;
var allRest = [];



var config = {
    apiKey: "AIzaSyCx0d_tuVtN1E_BIl2tnZpJdP7Kve7bqLs",
    authDomain: "restaurantpicker-eb33d.firebaseapp.com",
    databaseURL: "https://restaurantpicker-eb33d.firebaseio.com",
    projectId: "restaurantpicker-eb33d",
    storageBucket: "restaurantpicker-eb33d.appspot.com",
    messagingSenderId: "639194920272"
 };

firebase.initializeApp(config);
var database = firebase.database();

var restArray = [];

// print restaurant's info
function appendRest(id,rest){
    $("#"+id).empty()
    if (rest.Img === "") {
        $("#"+id).append("<img src='assets/images/noimage.jpg'>") 
    } else {
    $("#"+id).append("<img src='"+rest.Img+ "'>")
    }
    $("#"+id).append("<h1 class='rest-name'>"+rest.Name+ "</h1>")
    $("#"+id).append("<p class='rest-location'>"+"<span class='title'>Address: </span>"+rest.Location+ "</p>")
    $("#"+id).append("<p class='rest-cousines'>"+"<span class='title'>Cousines: </span>"+rest.Cousines+ "</p>")
    $("#"+id).append("<p class='rest-cost'>"+"<span class='title'>Average cost for two: </span>"+rest.Cost+ "</p>")
    $("#"+id).append("<p class='rest-rating'>"+"<span class='title'>Rating: </span>"+rest.Rating+ "</p>")
    $("#"+id).attr("data-restID", rest.RestID)
 }

// create our own restaurant object from API returned data
function createRestObject(rest_obj){
    var result = {
        Name: rest_obj.name,
        Img: rest_obj.featured_image,
        Location: rest_obj.location.address,
        Cost : rest_obj.average_cost_for_two,
        Cousines : rest_obj.cuisines,
        Rating : rest_obj.user_rating.aggregate_rating,
        RestID : rest_obj.R.res_id,
        URL: rest_obj.url,
        latitude: rest_obj.location.latitude,
        longitude: rest_obj.location.longitude
    }
    return result;
}

// print two restaurants with random indexes
function writeRest(){
    // Need to handle the situation if no restaurant is found or less than two    
    do{
        index1 = Math.floor(Math.random()* restArray.length)
        index2 = Math.floor(Math.random()* restArray.length)
    }while(restArray.length > 1 && index1 === index2)

    appendRest("rest1",allRest[index1]);
    appendRest("rest2",allRest[index2]);
    if(index1>index2){
        restArray.splice(index1,1)
        restArray.splice(index2,1)
    }else{
        index2--;
        restArray.splice(index1,1);
        restArray.splice(index2,1);
    }
}

// print restaurant with random index
function printNewRestaurant(divID,restID,index){
    // remove restaurant from restArray
    // restArray.splice(index,1);

    var random_index;
    var stop = true;
    do{
        var random_index = Math.floor(Math.random()* restArray.length);
        var random_rest_id = restArray[random_index].restaurant.R.res_id;
        if(random_rest_id != restID){ //if we find a restaurant different from the one we pick, print it and stop the while loop
            var restObject = createRestObject(restArray[random_index].restaurant);
            appendRest(divID,restObject);
            restArray.splice(random_index,1);
            stop = false;

            console.log(restID+" is picked")
            console.log("restArray.length="+restArray.length);
            console.log("restObject.RestID="+restObject.RestID);
            console.log("restID="+restID);
            console.log("----------------");
        }

    }while(stop && restArray.length > 1)
    return random_index;
} 

// Save/update restaurant's Upvotes property
function saveVote(restID){
    database.ref(restID).once("value",function(snapshot){
        if(snapshot.val() === null){  // if this restaurant hasn't been saved in database, set it
            database.ref(restID).set({RestaurantID: restID,Upvotes: 1});
        }else{ // else, just update the Upvotes value by one
            var v = snapshot.val().Upvotes + 1;
            database.ref(restID).update({Upvotes: v});
            console.log(restID+"="+v)
        }
    })
}

// create our own restaurant objects from resturned API data and save all to allRest
function saveRestObj(restArray){
    for(var i=0; i<restArray.length; i++){
        var restInfo =  createRestObject(restArray[i].restaurant);
        allRest.push(restInfo);
    }
}

// print restaurant with Upvotes
function printRestList(restaurant_obj){
    stop()
    var resultLink = $("<a href='#'></a>");
    var resultCard = $("<div class='result-card'>");
    if (restaurant_obj.Img === "") {
        resultCard.append("<div class='image-div-result'><img class='result-element result-img' src='assets/images/noimagethumb.jpg'></div>");
    } else {
    resultCard.append("<div class='image-div-result'><img class='result-element result-img' src='"+restaurant_obj.Img+"'></div>");
    }
    resultCard.append("<div class='result-element result-name'><h3>"+restaurant_obj.Name+"</h3></div>")
    resultCard.append("<div class='result-element result-vote'><h3>"+restaurant_obj.Upvotes+"</h3></div>")
//result animation    
    TweenMax.staggerFromTo(".result-card", 1, { y:150, opacity:0, ease:Power3.easeOut},{y:0, opacity:1, ease:Elastic.easeOut}, 0.15);


    resultLink.append(resultCard)
    $("#all-restaurants").append(resultLink)
    

    if(picked_rest[restaurant_obj.RestID]){
        resultCard.attr("class", "result-card picked");
        resultLink.attr("data-toggle", "tooltip" )
        resultLink.attr("data-placement", "bottom" )
        resultLink.attr("title", "You preferred this restaurant " + picked_rest[restaurant_obj.RestID] + " times" )
        $('[data-toggle="tooltip"]').tooltip();
    }
}

function highlightPicked(){
    picked_rest
}

function printRestInDecreasing(upvotes_array,allRest){
    var sorted_rests = []
    // upvotes_array has been sorted in increasing order
    for(var i = upvotes_array.length-1 ; i > -1 ; i--){
        for(var j = 0; j < allRest.length ; j++){
            if(allRest[j].Upvotes === upvotes_array[i]){
                sorted_rests.push(allRest[j])
                printRestList(allRest[j]);
            }
        }
    }
    console.log(sorted_rests);
}

// print final result 
function printVotes(){
    database.ref().once("value",function(snapshot){
        var upvotes_array = [];
        var data = snapshot.val();
        $(".timer").empty();

        // save Upvotes to each restaurant object and print a list of restaurants order by their Upvotes
        if (data !== null){
            for(var i=0; i<allRest.length; i++){
                var restaurantId = allRest[i].RestID; 

                // If restaurant has Upvotes property, save to restaurant object, if not, save and set it to 0
                allRest[i]["Upvotes"] = data[restaurantId]? parseInt(data[restaurantId].Upvotes) : 0;

                if(upvotes_array.indexOf(allRest[i]["Upvotes"]) == -1){
                    upvotes_array.push(parseInt(allRest[i]["Upvotes"]));
                }                 
            }

            // sort upvotes_array by increasing order
            upvotes_array = upvotes_array.sort(function(a, b){return a - b});
            $("#all-restaurants").append("<h2 class ='result-title'>WHAT OTHER PEOPLE CHOOSE:</h2>");
            $("#all-restaurants").append("<div class='result-head'><div class='result-head-v result-vote'><p>Votes</p></div><div class='result-head-n result-name'><p>Restaurant Name</p></div>");

            // print restaurants (Upvotes decreasing order)
            printRestInDecreasing(upvotes_array,allRest)
        }
          
    });

    // resultAnimation();
}

function run() {
    clearInterval(intervalId);
    intervalId = setInterval(decrement, 1000);
    number = 10;

};

//function to countdown the timer
function decrement() {
    number--;
    var num = $("<div>")
    num.addClass("btn btn-info timerSize")
    num.html("<h2>" + number + "</h2>")
    $("#timer").html(num);
    if (number === 0) {
        stop();
        random();
        run();

    }
};

//function to stop the timer
function stop() {
    clearInterval(intervalId);
    clearTimeout();
   
    
    
};

$("body").on("click", "#retry-btn", function(){
    location.reload();
});

//Search form out on submit click
function submitAnimation(){
    var tl = new TimelineMax();
    tl.to("#search-div", 0.4, {scale:1.05, transformOrigin: "50% 50%"})
    tl.to("#search-div", 0.2, {scale:0, transformOrigin: "50% 50%"})
    tl.to("#search-div", 0.1, {height:0, transformOrigin: "50% 100%"})
    tl.to("#logo", 0.3, {scale: 0.6, transformOrigin: "50% 0%", ease:Power4.easeOut })
}

//opening logo animation
function logoAnimation(){
    var tl = new TimelineMax();
    tl.fromTo("#logo", 0.3, {y:100, scale: 0.1  ,opacity:0, transformOrigin: "50% 50%", ease:Power4.easeOut},{y:100, scale: 1.3 , opacity:1, transformOrigin: "50% 50%", ease:Power4.easeOut})
    // tl.fromTo("#icon", 0.5, {scale: 0.8  ,transformOrigin: "50% 50%", ease:Elastic.easeOut},{scale: 1  ,transformOrigin: "50% 50%", ease:Elastic.easeOut})
    tl.staggerFrom(".ceiling", 1, {scale: 0 ,transformOrigin: "50% 50%", ease:Elastic.easeOut}, 0.08)
    tl.to("#logo", 0.5, {y:0, scale: 1  ,opacity:1, transformOrigin: "50% 50%", ease:Power4.easeOut}, "=-0.5")
    tl.staggerFrom(".form-el", 1, {opacity:0 , transformOrigin: "50% 50%", ease:Power1.easeIn}, 0.3, "=-0.5")

}

//The flip animation when you click on each restaurant
function transitionOut(divid){
    var tl = new TimelineMax();
    tl.to("#"+divid, 0.3, {rotationY:180, transformOrigin: "50% 50%", opacity:0, scale:0.5, ease:Power4.easeOut})
    .to("#"+divid, 0.3, {rotationY:0, transformOrigin: "50% 50%", opacity:1, scale:1, ease:Power4.easeOut}, "=+0.1")
}

function finishGame(id){
    var sendOut;
    if (id==="rest1"){
        sendOut= "rest2"
    } else{ sendOut= "rest1"}
    var tl = new TimelineMax();
    tl.to("#"+sendOut, 0.3, {y:80, transformOrigin: "50% 50%", opacity:0, ease:Power4.easeOut})
    .to("#"+id, 0.3, {y:80, transformOrigin: "50% 50%", opacity:0, ease:Power4.easeOut}, "=+0.15")
    .to ("#restaurants-div", 0.2, {height:0, transformOrigin: "50% 100%"})
    setTimeout(function(){
        $("#restaurants-div").attr("class", "row noDisplay")
    }, 950)
    // .staggerFrom(".result-card", 1, {y:10, opacity:0, ease:Power4.easeOut}, 0.1)
}
// function resultAnimation(){
//     var tl = new TimelineMax();
//     tl.staggerFromTo(".result-card", 10, {y:10, opacity:0, ease:Power4.easeOut},{y:0, opacity:1, ease:Power4.easeOut}, 1)
// }

//print featured restaurant
function printSelected(restID){
    console.log("winningRestID="+restID);
    for (var i = 0; i < allRest.length; i++) {
        if (restID == allRest[i].RestID) {
            console.log(allRest[i].Name);
            console.log(allRest[i]);
            console.log(allRest[i].Upvotes);
            console.log(allRest[i]["Name"]);
            console.log(allRest[i]["Upvotes"]);
            appendRest("featured-restaurant", allRest[i]);
            $("#featured-restaurant").append("<p class='rest-url'>"+"<span class='title'><a href='" + allRest[i].URL + "' target='_blank'>More Info</a></span> </p>")
            // var selectedVotes = allRest[i].Upvotes;
            // var selectedVotesDiv = $("<div>");
            // selectedVotesDiv.append("Total votes: " + selectedVotes);
            // selectedVotesDiv.addClass("selectedVotesDiv");
            // $("#featured-restaurant").append(selectedVotesDiv);
            var chosenHeaderDiv = $("<div>");
            chosenHeaderDiv.append("<h2> YOU CHOSE: </h2>");
            chosenHeaderDiv.addClass("chosenHeaderDiv");
            $("#featured-restaurant").prepend(chosenHeaderDiv);
        } else {}
    }
 }

//  function printSelectedVotes(restID) {
//     for (var i = 0; i < allRest.length; i++) {
//         if (restID == allRest[i].RestID) {
//             console.log(allRest[i].Name);
//             console.log(allRest[i].Upvotes);
//             var selectedVotes = allRest[i].Upvotes;
//             var selectedVotesDiv = $("<div>");
//             selectedVotesDiv.append("Total votes: " + selectedVotes);
//             selectedVotesDiv.addClass("selectedVotesDiv");
//         } else {}
//     }
//  }



logoAnimation();



$("#submit-btn").on("click", function(){
    event.preventDefault();
    
    var userZip = $("#zipCode").val().trim();
    var foodType= $("#foodType").val().trim();
    if(userZip==""){
        $('#myModal').modal({
          show: true})
        //   return;
      }else{

        $("#restaurants-div").attr("class", "row")
        submitAnimation();
        $.ajax({
            url: "https://maps.googleapis.com/maps/api/geocode/json?address="+userZip,
            method: "GET"
        }).then(function(response){
            console.log(response)
        
            var lat = response.results[0].geometry.location.lat;
            var lng = response.results[0].geometry.location.lng;
            console.log(lat,lng);
            
            var zomatoApi= "33175bea606c24db1122bc43c4dada6c"
            var queryURL = "https://developers.zomato.com/api/v2.1/search?q=" + foodType + "&count=8" + "&lat=" + lat + "&lon=" + lng + "&radius=3219" + "&sort=real_distance" + "&apikey=" + zomatoApi
            $.ajax({
                url: queryURL,
                method: "GET",
            }).then(function(response) {
                restArray= response.restaurants;
                saveRestObj(restArray);
                console.log(restArray)
                writeRest();
            
            });
        });
        run();

    }
    
});


    
//Tyler's upvote function
var picked_rest = {}


$("body").on("click", ".rest-card div", function() {
    event.preventDefault();
   
    var restID = $(this).attr("data-restID"); // the id of restaurant that has been clicked
    console.log("restID="+restID);
    // if restID hasn't been saved into picked_rest, save and set to 1
    // else increase the number of picked by one
    picked_rest[restID] = !picked_rest[restID] ? 1 : picked_rest[restID]+1;
    console.log(picked_rest)

    // save vote
    saveVote(restID);

    var divId= $(this).attr('id');  // the div tag id of restaurant that has been clicked

    // print new restaurant 
    if (restArray.length > 0){
        console.log(divId)

        if (divId==="rest1"){ // if rest1 is picked
            transitionOut("rest2");
            index2 = printNewRestaurant("rest2",restID,index2)   
             
        }else{  // else rest2 is picked
            transitionOut("rest1");
            index1 = printNewRestaurant("rest1",restID,index1)
        }
    }else{
        $(".rest-card").attr("class", "col-md-6 noHover")
        finishGame(divId);
        // $(".rest-card").empty();
        
        $("#retry").attr("class", "col-md-2")
        printVotes();
        printSelected(restID);
        // resultAnimation();
           
        printMap(restID);
    }
    run();
});
//function to pick random rest if timer has ran out.
function random() {
    var randomRest = Math.floor(Math.random()* 2);
    console.log(randomRest);
  

    if (restArray.length > 2){

        if (randomRest===0){ 
            transitionOut("rest2");
            index2 = printNewRestaurant("rest2",index2)    
            console.log(index2);
            
        }else{  
            transitionOut("rest1");
            index1 = printNewRestaurant("rest1",index1)
           console.log(index1);
          
        }}else{
        $(".rest-card").empty();
        $("#restaurants-div").attr("class", "row noDisplay")
        printVotes();
        stop();
    }   
    

    
}


//retrieve the votes from firebase and store them in an object (restID: upvote) object contains the initial n restaurants
//on the result page we display the n restaurants with their firebase votes
//feature the winner restaurant
//+ highlight the restaurants the user clicked on 
//retry button

// map function

function printRestOnMap(mymap,restaurant,restID){
    var lat = restaurant.latitude;
    var long = restaurant.longitude;
    var rest_icon;

    if(restID == restaurant.RestID){
        rest_icon = {icon: L.AwesomeMarkers.icon({icon: 'glass', markerColor: 'blue', prefix: 'fa', iconColor: 'yellow', spin: 'true'}) };
    }else{
        rest_icon = {icon: L.AwesomeMarkers.icon({icon: 'glass', markerColor: 'blue', prefix: 'fa', iconColor: 'white'}) }        
    }

    var detail = $("<div>");
    var name = $("<p class='mapRestName'>"+restaurant.Name+"</p>");
    name.css("margin","5px 0")
    var address = $("<p class='mapLocat'>"+restaurant.Location+"</p>");
    address.css("margin","5px 0")

    // star rating html
    var rating_star = $("<div class='star-ratings-css'>");
    var stars = $("<div class='star-ratings-css-top'>");
    var stars_span = "<span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>";
    // set stars tag's width by restaurant's rating
    stars.css("width",(restaurant.Rating/5).toFixed(2)*100+"%");
    stars.append(stars_span);
    rating_star.append(stars)

    detail.append(name,address,rating_star);

    // add restaurant to map
    L.marker([lat, long],rest_icon).addTo(mymap).bindPopup(detail.html());
}


function printMap(restID){
    // create map and use the winning restaruant as center of the map
    var mymap;
    for (var i = 0; i < allRest.length; i++) {
        if (restID == allRest[i].RestID) {
            console.log(allRest[i].Name);
            var mymap = L.map('mapid').setView([allRest[i].latitude, allRest[i].longitude], 12);
            L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
                attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
                maxZoom: 18,
                id: 'mapbox.streets',
                accessToken: 'pk.eyJ1IjoiZ3VndWNvZGUiLCJhIjoiY2pocjU1Z3R2MWMwcjM3cHZnZDhqa3NyYyJ9.6qeZqaN1FcIHVZqSut1hgw'
            }).addTo(mymap);
            break;
        } 
    }

    // print out all restaurants 
    allRest.forEach(function(restaurant) {
        printRestOnMap(mymap,restaurant,restID);
    });
    
}
