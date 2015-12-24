var myImage = document.querySelector('img');

myImage.onclick = function() {
	var mySrc = myImage.getAttribute('src');
	if (mySrc === 'images/sunset.png') {
		myImage.setAttribute('src', 'images/sunset1.jpg');
		myImage.width = "500";
		myImage.height = "300";
		myImage.style.boxShadow = "10px, 10px, 5px, blue";
	} else {
		myImage.setAttribute('src', 'images/sunset.png');
	}
}

var myButton = document.querySelector('button');
var myHeading = document.querySelector('h1');

function setUserName() {
	var myName = prompt('Please enter your name.');
	localStorage.setItem('name', myName);
	myHeading.textContent = "Mozilla is cool, " + myName;

	if (!localStorage.getItem('name') ) {
		setUserName();
	} else {
		var storedName = localStorage.getItem('name');
		myHeading.textContent = "Mozilla is cool, " + storedName;
	}
}

myButton.onclick = function() {
	setUserName();
}