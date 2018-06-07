$(document).ready(function(){
    // define elements variable 
    var header = "#header";
    var form = "form";

    // define TimelineMax objects
    var header_t = new TimelineMax({repeat:-1, repeatDelay:1});
    var form_t = new TimelineMax({repeat:0, repeatDelay:1});
    var question_box = new TimelineLite()
    var pick_box = new TimelineLite()

    // modify TimelineMax objects
    header_t.to( header, 1, {color: "white"})
            .to( header, 1, {color: "teal"});
    
    form_t.to( form, 1, {opacity: 0.3})
          .to( form, 1, {opacity: 0.6})
          .to( form, 1, {opacity: 1.0});

    question_box.to(".cbox", 1, {y:60, id:"cbox"})
                .to(".bbox", 0.5, {y:60, ease:Bounce.easeOut, id:"bbox"})
                .to(".abox", 1, {y:60, ease:Bounce.easeOut, id:"abox"})
                .to(".dbox", 1, {y:60, ease:Bounce.easeOut, id:"dbox"});
    
    pick_box.to(".ebox", 1, {y:10, id:"cbox"})
            .to(".fbox", 0.5, {y:10, ease:Bounce.easeOut, id:"fbox"})
            .to(".gbox", 1, {y:10, ease:Bounce.easeOut, id:"gbox"})
            .to(".hbox", 1, {y:10, ease:Bounce.easeOut, id:"hbox"});

    // play TimelineMax objects
    form_t.play();
    


    
  
})
