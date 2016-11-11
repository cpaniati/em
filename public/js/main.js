


var config = {
    apiKey: "AIzaSyBtOb-lpjqdq72j75l5aUu7d-MBg_7JtV4",
    authDomain: "nlptest-146520.firebaseapp.com",
    databaseURL: "https://nlptest-146520.firebaseio.com",
    storageBucket: "",
    messagingSenderId: "749581434184"
  };
  firebase.initializeApp(config);





window.fbAsyncInit = function() {
    FB.init({
      appId      : '320966348272883',
      xfbml      : true,
      version    : 'v2.6'
    });
    
  };



  (function(d, s, id){
     var js, fjs = d.getElementsByTagName(s)[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement(s); js.id = id;
     js.src = "//connect.facebook.net/en_US/sdk.js";
     fjs.parentNode.insertBefore(js, fjs);
   }(document, 'script', 'facebook-jssdk'));



  

  function statusChangeCallback(response){
    console.log(response);
    if(response.status == 'connected'){
        window.user = response.authResponse;
        window.user.currentPost = {key:null,text:''};
        startJournal();
    }else{
      FB.login(function(response){
        window.user = null;
        statusChangeCallback(response);
      });
    }
  }



  var database = firebase.database();



  function startNewFirebaseEntry(){
    var today = String(new Date());
    console.log('hit');
    var userRef = database.ref('users');
    userRef.child(window.user.userID).once('value').then(function(snapshot) {
      //if user doesnt exist
      console.log(snapshot);
      if(snapshot.val() === null){
        console.log('user not found');
        //create user
        database.ref('users/' + window.user.userID).set({
          accessToken: window.user.accessToken,
          signedRequest: window.user.signedRequest
        },function(error){
          if(error){
            console.log(error);
          }
          else{
            console.log("user created successfully");
          }
        });
      }else{
        console.log("user already exists");
        var userPostsRef = database.ref('users/' + window.user.userID).child('posts');
        var newPostRef = userPostsRef.push({
          date: today,
          text: "blank..",
          convoTime: 0
        },function(){
          window.user.currentPost.key = newPostRef.key;
          console.log(window.user.currentPost.key);
        });
        
      }
      

    });
    startEntryTimer();
    getEntries();
  }



  function startNewFirebaseChat(){
    var today = String(new Date());
    var chatRef = database.ref('chats');
    var newPostRef = chatRef.push({
          date: today,
          convoTime: 0,
        },function(){

          window.user.currentChat.key = newPostRef.key;
          console.log(window.user.currentChat.key);

          var newPostRef = userPostsRef.set({
            date: today,
            convoTime: 0,
          },function(){
            window.user.currentChat.key = newPostRef.key;
            console.log(window.user.currentChat.key);
          });

        });

  }

  function chatPost(text){
    var today = String(new Date());
    var chatRef = database.ref('chats/'+window.user.currentChat.key+'posts/');
    chatRef.push({
          date: today,
          text: text,
          convoTime: 0
        },function(){
          window.user.currentPost.key = newPostRef.key;
          console.log(window.user.currentPost.key);
        });
  }



  function getEntries(){
      database.ref('users/' + window.user.userID).child('posts').once('value').then(function(snapshot) {
          
        snapshot.forEach(function (snapshot,i) {
           var obj = snapshot.val();
           if(obj.text !== "blank.."){
              $('#entries').append("<div class = 'entry' entry-num='"+i+"'><h3>"+obj.date+"</h3><p>"+obj.text+"</p></div>");
           }
        });
        
      });
  }


  function startEntryTimer(){
    window.entryTimer = 0;
    var entryTimer = setInterval(function(){
      window.entryTimer += 1000;
    },1000);
  }



  function entryUpdated(){
        var today = String(new Date());
        database.ref('users/' + window.user.userID).child('posts').child(window.user.currentPost.key).set({
          date: today,
          convoTime: window.entryTimer,
          text:window.user.currentPost.text
        },function(error){
          if(error){
            console.log(error);
          }
          else{
            console.log("post updated successfully");
          }
        });
  }


  


  $(document).ready(function(){

    $('#viewEntries').click(function(){
      $('#entriesWrap').toggleClass('active');
    });

    $('#entriesWrap').click(function(){
      $('#entriesWrap').removeClass('active');
    }).children().click(function(e) {
      e.stopPropagation();
      return false;
    });

    document.getElementById('start').onclick = function(){
        FB.getLoginStatus(function(response) {
            statusChangeCallback(response);
        });
    };

    document.getElementById('logout').onclick = function(){
      FB.logout();
      $('#startDialog').fadeIn();
      $('#logout').hide();
    };

    $('#recognitionRestart').click(function(){
      recognitionRestart();
      var f = document.forms.e_form;
      f.e_input.focus();
    });

  });

function startJournal(){
  $('#logout').show();
  $('#startDialog').fadeOut();
  startDictation();
  var f = document.forms.e_form;
  f.e_input.focus();
  startNewFirebaseEntry();
}





var elizaMinWaitTime = 5000;

var eliza = new ElizaBot();
var elizaLines = new Array();

var displayCols = 60;
var displayRows = 20;

var emBody;
var currentMood = 'neutral';
window.radarSpeed = 2000;
window.emSpeed = 5;
var xPos = 0;
var yPos = 0;

function elizaReset() {
  console.log('elizaReset');
	eliza.reset();
	elizaLines.length = 0;
	elizaStep();
}

//document.forms.e_form.e_input.value.onchange=function(){elizaStep();};

function typeItOut(userInput,i,sentenceContainer,currentInput){
  //console.log(i);
  if(i < userInput.length){
    var typeLetter = setTimeout(function(){
      //currentInput = currentInput+"<span>"+userInput[i]+"</span>";

      var out = document.getElementById("entry");
      // allow 1px inaccuracy by adding 1
      var isScrolledToBottom = out.scrollHeight - out.clientHeight <= out.scrollTop + 1;

      sentenceContainer.append("<span class = 'letter'>"+userInput[i]+"</span>");

      if(isScrolledToBottom)
      out.scrollTop = out.scrollHeight - out.clientHeight;

      i = i+1;
      typeItOut(userInput,i,sentenceContainer,currentInput);
    },20);
  }else if(i == userInput.length){
    i = i+1;
    var replaceText = setTimeout(function(){
      //currentInput = currentInput+"<span>"+userInput[i]+"</span>";
      var out = document.getElementById("entry");
      // allow 1px inaccuracy by adding 1
      var isScrolledToBottom = out.scrollHeight - out.clientHeight <= out.scrollTop + 1;

      sentenceContainer.html(userInput);

      if(isScrolledToBottom)
      out.scrollTop = out.scrollHeight - out.clientHeight;

      i = i+1;

    },10000);
    //$('#entry').html(origText+" <span class = 'sentence'>"+currentInput+"</span>");
    //$('#entry').append("</span>");
    i = i+1;
  }
  return;
}

/*function typeItOut(userInput,i,origText,currentInput){
  console.log(i);
  if(i < userInput.length){
    var typeLetter = setTimeout(function(){
      currentInput = currentInput+"<span>"+userInput[i]+"</span>";
      $('#entry').html(origText+" "+currentInput);
      i = i+1;
      typeItOut(userInput,i,origText,currentInput);
    },Math.random()*100);
  }else if(i == userInput.length){
    $('#entry').html(origText+" <span class = 'sentence'>"+currentInput+"</span>");
    i = i+1;
  }
  return;
}*/

function elizaSpeak(text){
  if(window.emotionFlag == "sad"){
    text = "<i class = 'em em-confused'></i> "+text;
  }else if(window.emotionFlag == "happy"){
    text = "<i class = 'em em-blush'></i> "+text;
  }else if(window.emotionFlag == "upset"){
    text = "<i class = 'em em-confused'></i> <i class = 'em em-confused'></i> <i class = 'em em-confused'></i> "+text;
  }
  var emXPos = xPos+200;
  var emYPos = yPos+200;
  if(emXPos < 10){
    emXPos = 10;
  }
  if(emYPos < 10){
    emYPos = 10;
  }
  $('#emCaption').css('left',emXPos).css('top',emYPos).html(text).fadeIn(400);
  setTimeout(function(){
    $('#emCaption').fadeOut(1000);
  },3500);
}


function elizaStep() {
  console.log('elizaStep');
	var f = document.forms.e_form;
	var userinput = f.e_input.value;
	if (eliza.quit) {
		f.e_input.value = '';
		if (confirm("This session is over.\nStart over?")) elizaReset();
		f.e_input.focus();
		return;
	}
	else if (userinput != '') {
    var elizaRpl = eliza.transform(userinput);
		var usr = 'YOU:   ' + userinput;
    var punctuation = "";
    //console.log(userinput[userinput.length-1]);
    if(userinput[userinput.length-1] != "." && userinput[userinput.length-1] != "?" && userinput[userinput.length-1] != "!"){
      punctuation = ".";
    }
    $('#entry').append("<span class = 'sentence'></span>");
    window.user.currentPost.text += userinput+punctuation+" ";
    entryUpdated();
    typeItOut(userinput+punctuation+" ",0,$('.sentence').last(),"");
    elizaLines.push(usr);
    setTimeout(function(){

    },Math.floor(Math.random() * (1500 - 500)) + 500);
    
    setTimeout(function(){

      if(window.timeToRespond){

        if(elizaRpl != ''){
          var rpl ='EM: ' + elizaRpl;
          elizaLines.push(rpl);
          elizaSpeak(elizaRpl);
        }
        // display nicely
        // (fit to textarea with last line free - reserved for extra line caused by word wrap)
        var temp  = new Array();
        var l = 0;
        for (var i=elizaLines.length-1; i>=0; i--) {
          l += 1 + Math.floor(elizaLines[i].length/displayCols);
          if (l >= displayRows) break
          else temp.push(elizaLines[i]);
        }
        elizaLines = temp.reverse();
        f.e_display.value = elizaLines.join('\n');

      }

  },Math.floor(Math.random() * (elizaMinWaitTime+1000 - elizaMinWaitTime)) + elizaMinWaitTime);
		
		// display nicely
		// (fit to textarea with last line free - reserved for extra line caused by word wrap)
		var temp  = new Array();
		var l = 0;
		for (var i=elizaLines.length-1; i>=0; i--) {
			l += 1 + Math.floor(elizaLines[i].length/displayCols);
			if (l >= displayRows) break
			else temp.push(elizaLines[i]);
		}
		elizaLines = temp.reverse();
		f.e_display.value = elizaLines.join('\n');
	}
	else if (elizaLines.length == 0) {
		// no input and no saved lines -> output initial
    setTimeout(function(){
      //var initial = 'EM: ' + eliza.getInitial();
      var initial = eliza.getInitial();
      elizaLines.push(initial);
      f.e_display.value = initial + '\n';
      elizaSpeak(initial);
    },1000);
	 
	}
	f.e_input.value = '';
	f.e_input.focus();
  //window.setTimeout(startDictation,100);
}


function startCall(){

}


window.inCall = false;


function recognitionRestart(){
  stopDictation();
  startDictation();
}

function stopDictation(){
  window.recognition.stop();
}

  function startDictation() {
    if (window.hasOwnProperty('webkitSpeechRecognition')) {
      window.recognition = new webkitSpeechRecognition();
      var recognition = window.recognition;
 
      recognition.continuous = true;
      recognition.interimResults = false;
 
      recognition.lang = "en-US";
      recognition.start();
 
      recognition.onresult = function(e) {
        window.timeToRespond = false;
        setTimeout(function(){
          window.timeToRespond = true;
        },elizaMinWaitTime-100);
        document.getElementById('transcript').value= e.results[0][0].transcript;
        if(window.inCall){
          sendChat();
        }else{
           window.setTimeout(elizaStep,100);
        }
        
        recognition.stop();
       
        //document.getElementById('e_form').submit();
        //window.setTimeout(startDictation(),200);
      };

      recognition.onend = function() {
           recognitionRestart();
      };
 
      recognition.onerror = function(e) {
        recognition.stop();
      }
 
    }
  }
/* SNAP */
window.onload = function() {
  var s = Snap("#em-container");
  var sr = Snap("#em-radar-container");

  emBody = s.circle(200, 200, 20);

  emBody.attr({
      id:"emBody"
  });

  var emHighlight = s.circle(210, 190, 3);

  emHighlight.attr({
      fill: "#ffffff"
  });

  var em = s.group(emBody, emHighlight);


  var emRadar = s.circle(200, 200, 1);

  var emRadarClass = "emRadar";
  if(currentMood == "sad"){
    emRadarClass += " sad";
  }

  emRadar.attr({
      fill: "#FF9E9E",
      opacity:.1,
      id:"radar"+0
  });

  var emRadarObj = {width:0,height:0,opacity:.2};
  



  
  var pageHeight = $(window).height() - 130;
  console.log(pageHeight);
  var pageWidth = .3*$(window).width()+30;

  $(window).resize(function(){
    pageHeight = $(window).height() - 130;
    pageWidth = .3*$(window).width()+30;
  });

  //em.transform("t"+pageWidth/3+","+pageHeight/3);

  
  var minVal = -.2;
  var maxVal = .2;
  var direction = 0;
  var rInertia = 0;
  var radars = [];
  var radarsData = [];


  var counter = 0;
  window.radarBlinker = function(){
      var object = {width:0,height:0,opacity:.2};
      radarsData.push(object);
      counter++;
      var radarObj = sr.circle(xPos+200, yPos+200, 1);
      radarObj.attr({
          fill: "#FF9E9E",
          opacity:.1,
          id:"radar"+counter
      });

      $('#radar'+counter).addClass("emRadar "+currentMood);

      radars[radars.length] = radarObj;

      radarObj.animate({ transform: "s"+1000+" "+1000, opacity:0}, 10000 );


      /*clearInterval(interval);
      counter += 200;
      interval = setInterval(myFunction, counter);*/
  }
  window.radarBlink = setInterval(window.radarBlinker, window.radarSpeed);


  var emMovement = setInterval(function(){
    var rChange = Math.random()*.2-.1;
    rInertia += rChange;
    direction += rInertia;
    //console.log('r:'+rInertia+' d:'+direction+' x:'+xPos+' y:'+yPos);
    if(xPos < -30){
      xPos += (xPos+30)*-.1;
    }else if (xPos > 30){
      xPos -= (xPos-30)*.1;
    }
    if(yPos < -30){
      yPos += (yPos+30)*-.1;
    }else if (yPos > 300){
      yPos -= (yPos - 300)*.1;
    }
    xPos += Math.sin(direction)*window.emSpeed;
    yPos += Math.cos(direction)*window.emSpeed;
    if(rInertia > maxVal){
      rInertia = maxVal;
    }else if(rInertia < minVal){
      rInertia = minVal;
    }

    em.animate({ transform: "t"+xPos+" "+yPos}, 200 );


    /*
    for(i=0;i<radars.length;i++){
      console.log(radarsData[i].width);
      if(Number(radarsData[i].width) > 1000){
        console.log('big');
        radarsData.splice(i,1);
        radars.splice(i,1);
      }
      radarsData[i].width+=20;
      radarsData[i].height+=20;
      radarsData[i].opacity-=.005;
      radars[i].animate({ transform: "s"+radarsData[i].width+" "+radarsData[i].height, opacity:radarsData[i].opacity}, 200 );
    }
*/


    


  },200);

  var emRadarGen = setInterval(function(){
      for(i=0;i<radars.length;i++){
      
      radarsData[i].width+=20;
      radarsData[i].height+=20;
      radarsData[i].opacity-=.005;
      if(Number(radarsData[i].width) > 1000){
        radarsData.splice(i,1);
        //console.log(sr.select("#"+radars[i].id));
        sr.select("#"+radars[i].node.id).removeData();
        sr.select("#"+radars[i].node.id).remove();
        //console.log(radars[i].node.id);
        radars.splice(i,1);
        return;
      }
      //radars[i].animate({ transform: "s"+radarsData[i].width+" "+radarsData[i].height, opacity:radarsData[i].opacity}, 200 );
    }
    },200);




}