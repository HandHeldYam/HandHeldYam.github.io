/*

	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/

(function() {

	"use strict";

	var	$body = document.querySelector('body');

	// Methods/polyfills.

		// classList | (c) @remy | github.com/remy/polyfills | rem.mit-license.org
			!function(){function t(t){this.el=t;for(var n=t.className.replace(/^\s+|\s+$/g,"").split(/\s+/),i=0;i<n.length;i++)e.call(this,n[i])}function n(t,n,i){Object.defineProperty?Object.defineProperty(t,n,{get:i}):t.__defineGetter__(n,i)}if(!("undefined"==typeof window.Element||"classList"in document.documentElement)){var i=Array.prototype,e=i.push,s=i.splice,o=i.join;t.prototype={add:function(t){this.contains(t)||(e.call(this,t),this.el.className=this.toString())},contains:function(t){return-1!=this.el.className.indexOf(t)},item:function(t){return this[t]||null},remove:function(t){if(this.contains(t)){for(var n=0;n<this.length&&this[n]!=t;n++);s.call(this,n,1),this.el.className=this.toString()}},toString:function(){return o.call(this," ")},toggle:function(t){return this.contains(t)?this.remove(t):this.add(t),this.contains(t)}},window.DOMTokenList=t,n(Element.prototype,"classList",function(){return new t(this)})}}();

		// canUse
			window.canUse=function(p){if(!window._canUse)window._canUse=document.createElement("div");var e=window._canUse.style,up=p.charAt(0).toUpperCase()+p.slice(1);return p in e||"Moz"+up in e||"Webkit"+up in e||"O"+up in e||"ms"+up in e};

		// window.addEventListener
			(function(){if("addEventListener"in window)return;window.addEventListener=function(type,f){window.attachEvent("on"+type,f)}})();

	// Play initial animations on page load.
		window.addEventListener('load', function() {
			window.setTimeout(function() {
				$body.classList.remove('is-preload');
			}, 100);
		});

	// Slideshow Background.
		(function() {

			// Settings.
				var settings = {

					// Images.
						images: {
							'images/caci01.jpg': 'center',
							'images/caci02.jpg': 'center',
							'images/caci03.jpg': 'center'
						},

					// Delay.
						delay: 6000

				};

			// Variables
				var	index = 0, lastPos = 0,
					$wrapper, $bgs = [], $bg,
					k, v;


				$wrapper = document.createElement('div');
					$wrapper.id = 'bg';
					$body.appendChild($wrapper);

				for (k in settings.images) {


						$bg = document.createElement('div');
							$bg.style.backgroundImage = 'url("' + k + '")';
							$bg.style.backgroundPosition = settings.images[k];
							$wrapper.appendChild($bg);

					// Add it to array.
						$bgs.push($bg);

				}


				$bgs[index].classList.add('visible');
				$bgs[index].classList.add('top');

					if ($bgs.length == 1
					||	!canUse('transition'))
						return;

				window.setInterval(function() {

					lastPos = index;
					index++;

					// Wrap to beginning if necessary.
						if (index >= $bgs.length)
							index = 0;

					// Swap top images.
						$bgs[lastPos].classList.remove('top');
						$bgs[index].classList.add('visible');
						$bgs[index].classList.add('top');

					// Hide last image after a short delay.
						window.setTimeout(function() {
							$bgs[lastPos].classList.remove('visible');
						}, settings.delay / 2);

				}, settings.delay);

		})();

	// Login function
		(function() {

		function submitButton(){

    var dDM = document.getElementById("positions"); // gets the dropdown menu from DOM
    var input = dDM.options[dDM.selectedIndex].text //gets selected item from dropDownMenu
    var text = document.getElementById("textarea1").value; //gets input from textbox
    if(text == ""){
        alert("Must Enter Name Before Sumbission");//make alert when <input> has no vlaue
        return;
    }
    document.getElementById('userNameDisplay').innerHTML = "Username: " + text + " Type: " + input; //changes the <p> userNameDisplay to say         ^

    if(input == "Scrum Master"){ //if ScrumMaster is selected reveal generateCode Button
        document.getElementById("generateCode").style.visibility = "visible";
    } else {//otherwise Make sure it is hidden (if previously selected SM)
        document.getElementById("generateCode").style.visibility = "hidden";
        document.getElementById("roomCodeDisplay").innerHTML = "Room Code:";
    }
		const data = {text, type};
		const options = {
				method: 'POST',
				headers: {
						"Content-Type": "application/json"
				},
				body: JSON.stringify(data)
		};
		fetch('/api', options);
 }

 function generateCode(){
     var code = "";
        for(var i = 0; i< 7;i++){
            code += " " + parseInt(Math.random()*10);
        }
        document.getElementById('roomCodeDisplay').innerHTML = "Room Code:" + code;
				const options = {
			 		 method: 'POST',
			 		 headers:{
			 				 "Content-Type": "application/json"
			 		 },
			 		 body: JSON.stringify(code)
			  };
			  fetch('/api', options);
			 }

				$form.addEventListener('submit', function(event) {

					event.stopPropagation();
					event.preventDefault();

					// Hide message.
						$message._hide();

					// Disable submit.
						$submit.disabled = true;


						window.setTimeout(function() {

							// Reset form.
								$form.reset();

							// Enable submit.
								$submit.disabled = false;

							// Show message.
								$message._show('success', 'Logging you in to Scrum Session');
								//$message._show('Authentication failed. Please try again.');

						}, 750);

				});

		})();

})();
