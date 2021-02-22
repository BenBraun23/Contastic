var urlBase = 'http://www.contastic.rocks/LAMPAPI';
//var urlBase = window.location.href;
var extension = 'php';

var userId = 0;
var firstName = "";
var lastName = "";

// Perform login for user
function doLogin()
{
	userId = 0;
	firstName = "";
	lastName = "";

	var login = document.getElementById("loginName").value;
	var password = document.getElementById("loginPassword").value;
	var hash = md5( password );

	if ((login == "") || (password == ""))
	{
		document.getElementById("loginResult").innerHTML = "Not a valid username/password";
		return;
	}

	document.getElementById("loginResult").innerHTML = "";

	var jsonPayload = '{"login" : "' + login + '", "password" : "' + hash + '"}';
	var url = urlBase + '/Login.' + extension;

	var xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

	try
	{
		xhr.send(jsonPayload);
		xhr.onreadystatechange = function()
		{
			if (this.readyState == 4 && this.status == 200)
			{
				var jsonObject = JSON.parse(xhr.responseText);
				userId = jsonObject.id;

				if (userId < 1)
				{
					document.getElementById("loginResult").innerHTML = "User/Password combination incorrect";
					return;
				}

				firstName = jsonObject.firstName;
				lastName = jsonObject.lastName;

				saveCookie();

				window.location.href = "home.html";
			}
		};
	}
	catch(err)
	{
		document.getElementById("loginResult").innerHTML = err.message;
	}
}

// Create new login for user
function registerUser() {

	firstName = document.getElementById("firstName").value;
	lastName = document.getElementById("lastName").value;
	var login = document.getElementById("loginName").value;
	var password = document.getElementById("loginPassword").value;
	var hash = md5( password );

	if ((login == "") || (password == "" )|| (firstName == "") || (lastName == ""))
	{
		document.getElementById("registerResult").innerHTML = "Information missing. All fields are required";
		return;
	} else {
    document.getElementById("registerResult").innerHTML = " ";
  }

	if(password.length < 7) {
		document.getElementById("registerResult").innerHTML = "Password must be at least 7 characters";
		return;
	} else {
    document.getElementById("registerResult").innerHTML = " ";
   }

  if(comparePassword() == 1) {
    return;
  }

	document.getElementById("registerResult").innerHTML = "";

	var jsonPayload =  `{"firstName" : "${firstName}",
						"lastName" : "${lastName}",
						"login" : "${login}",
						"password" : "${hash}"}`;

	var url = urlBase + '/SignUp.' + extension;

	var xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.send(jsonPayload);
		xhr.onreadystatechange = function()
		{
			if (this.readyState == 4 && this.status == 200)
			{
				var jsonObject = JSON.parse(xhr.responseText);
				userId = jsonObject.id;
				// Ensures user does not get auto logged in if they create existing username
				if (userId < 1)
				{
					document.getElementById("registerResult").innerHTML = jsonObject.error;
					return;
				}
				firstName = jsonObject.firstName;
				lastName = jsonObject.lastName;

				saveCookie();

				window.location.href = "home.html";
			}
		};
	}
	catch(err)
	{
		document.getElementById("registerResult").innerHTML = err.message;
	}

}

function saveCookie()
{
	var minutes = 20;
	var date = new Date();
	date.setTime(date.getTime()+(minutes*60*1000));
	document.cookie = "firstName=" + firstName + ",lastName=" + lastName + ",userId=" + userId + ";expires=" + date.toGMTString();
}

function readCookie()
{
	userId = -1;
	var data = document.cookie;
	var splits = data.split(",");
	for(var i = 0; i < splits.length; i++)
	{
		var thisOne = splits[i].trim();
		var tokens = thisOne.split("=");
		if( tokens[0] == "firstName" )
		{
			firstName = tokens[1];
		}
		else if( tokens[0] == "lastName" )
		{
			lastName = tokens[1];
		}
		else if( tokens[0] == "userId" )
		{
			userId = parseInt( tokens[1].trim() );
		}
	}

	if( userId < 0 )
	{
		window.location.href = "index.html";
	}
	else
	{
		document.getElementById("userName").innerHTML = "Welcome " + firstName + " " + lastName + "!";
	}
}

function doLogout()
{
	userId = 0;
	firstName = "";
	lastName = "";
	document.cookie = "firstName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
	window.location.href = "index.html";
}

// Once logged in, user can add contact
function addContact()
{
	var newFirstName = document.getElementById("firstName").value;
	var newLastName = document.getElementById("lastName").value;
	var newPhone = document.getElementById("phone").value;
	var newEmail = document.getElementById("email").value;

	if (newFirstName == "")
	{
    document.getElementById("addError").style.display = "block";
		return;
	} else {
     document.getElementById("addError").style.display = "none";
  }

	var jsonPayload =  `{"firstName" : "${newFirstName}",
						"lastName" : "${newLastName}",
						"phone" : "${newPhone}",
						"email" : "${newEmail}",
						"id" : "${userId}"}`;


	var url = urlBase + '/AddContact.' + extension;

	var xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.send(jsonPayload);
		//var contactjson = xhr.fetch(jsonPayload);

		xhr.onreadystatechange = function()
		{
			if (this.readyState == 4 && this.status == 200)
			{
				addContactToTable(newFirstName, newLastName, newPhone, newEmail, jsonPayload.id);
				searchContact();
				//document.getElementById("contactAddResult").innerHTML = "Contact has been added";

		        //Closing modal
		        var modal = document.getElementById('addModal');
		      	modal.style.display = "none";
		        //clearing fields in modal for additional contacts
		        document.getElementById('firstName').value = '';
		        document.getElementById('lastName').value = ''
		        document.getElementById('phone').value = ''
		        document.getElementById('email').value = ''

		        addNotification();
			}
		};

	}
	catch(err)
	{
		document.getElementById("contactAddResult").innerHTML = err.message;
	}

}

function homeStartUp() {
  var table = document.createElement("table");
	table.setAttribute("id", "fillContacts");
 	document.body.appendChild(table);

  createTableHeaders();
  searchContact();
}

function viewAllContacts() {
  //clears search fields first
  document.getElementById('firstSearch').value = '';
  document.getElementById('lastSearch').value = '';
  document.getElementById('phoneSearch').value = '';
  document.getElementById('emailSearch').value = '';

  searchContact();
}

// Creates table headers
function createTableHeaders(){
	var table = document.getElementById("fillContacts");

	var row = table.insertRow(0);
  row.style.background = "none";

	// Filling first row of table with default headers
	var th1 = document.createElement("th");
	var th2 = document.createElement("th");
	var th3 = document.createElement("th");
	var th4 = document.createElement("th");
	var th5 = document.createElement("th");
	var th6 = document.createElement("th");

	th1.innerHTML = "First Name";
	th2.innerHTML = "Last Name";
	th3.innerHTML = "Phone Number";
	th4.innerHTML = "Email";

	row.appendChild(th1);
	row.appendChild(th2);
	row.appendChild(th3);
	row.appendChild(th4);
	row.appendChild(th5);
	row.appendChild(th6);

	table.appendChild(row);
}

function sortTable() {
  var table, rows, switching, i, x, y, shouldSwitch;
  table = document.getElementById("fillContacts");
  switching = true;

  while (switching) {

    switching = false;
    rows = table.rows;

    for (i = 1; i < (rows.length - 1); i++) {

      shouldSwitch = false;

      x = rows[i].getElementsByTagName("th1")[0];
      y = rows[i + 1].getElementsByTagName("th1")[0];

      if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
        shouldSwitch = true;
        break;
      }
    }
    if (shouldSwitch) {
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
    }
  }
}

function resetTable() {
	var table = document.getElementById('fillContacts');
	table.innerHTML = "";
	createTableHeaders();
}

function addContactToTable(newFirstName, newLastName, newPhone, newEmail, id)
{
	// Find a <table> element with id="fillContacts":
	var table = document.getElementById("fillContacts");

	// Create edit button
	var editButton = document.createElement("BUTTON");
	editButton.innerHTML = "&#9998;";
	editButton.setAttribute("type","button");
	editButton.setAttribute("class","edit");

	editButton.onclick = function() {
		openModal({ id: id, firstName: newFirstName, lastName: newLastName, phone: newPhone, email: newEmail });
	}

	//Create delete button
	var deleteButton = document.createElement("BUTTON");
	deleteButton.innerHTML = "&#10006;";
	deleteButton.setAttribute("type","button");
	deleteButton.setAttribute("class","cross");

	deleteButton.onclick = function()
	{
		openMo(id);
	}

	// Create an empty <tr> element and add it to the 1st position of the table:
	var row = table.insertRow(1);

	// Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
	var cell1 = row.insertCell(0);
	var cell2 = row.insertCell(1);
	var cell3 = row.insertCell(2);
	var cell4 = row.insertCell(3);
	var cell5 = row.insertCell(4);
	var cell6 = row.insertCell(5);

	// Add some text to the new cells:
	cell1.innerHTML = newFirstName;
	cell2.innerHTML = newLastName;
	cell3.innerHTML = newPhone;
	cell4.innerHTML = newEmail;
	cell5.appendChild(editButton);
	cell6.appendChild(deleteButton);
}

function openMo(id) {
	var modal = document.getElementById('deleteModal');
	//modal.classList.toggle('modal-open');
	modal.style.display = "block";

	document.getElementById("uid").value = id;
}

// This function is a test.
function deleteTest(newFirstName, newLastName, newPhone, newEmail)
{
	//window.alert("This button should call the delete() funtion and deletes this contact : " +  newFirstName + " " + newLastName + " "  + newPhone + " " + newEmail );
}

function searchContact()
{
	var first = document.getElementById("firstSearch").value;
	var last = document.getElementById("lastSearch").value;
	var phone = document.getElementById("phoneSearch").value;
	var email = document.getElementById("emailSearch").value;
	document.getElementById("contactSearchResult").innerHTML = "";

	var contactList = "";

	var jsonPayload = {
		"firstName": first,
		"lastName": last,
		"phone": phone,
		"email": email,
		"id": userId
	};
	var url = urlBase + '/SearchContacts.' + extension;

	var xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function()
		{
			if (this.readyState == 4 && this.status == 200)
			{
				var jsonObject = JSON.parse( xhr.responseText );

				resetTable();
				sortTable();

				jsonObject.forEach(function(user) {
					addContactToTable(user.firstName, user.lastName, user.phone, user.email, user.id);
				})

	          document.getElementById('firstSearch').value = '';
	          document.getElementById('lastSearch').value = '';
	          document.getElementById('phoneSearch').value = '';
	          document.getElementById('emailSearch').value = '';

			}
		};
		xhr.send(JSON.stringify(jsonPayload)); // to make sure it is a string
	}
	catch(err)
	{
		document.getElementById("contactSearchResult").innerHTML = err.message;
	}
}

function openModal(user) {
	var modal = document.getElementById('homeModal');
	var form = document.getElementById('update-contact');
	form.onsubmit = updateContact;

	//modal.classList.toggle('modal-open');
	modal.style.display = "block";

	document.getElementById("firstEdit").value = user.firstName;
	document.getElementById("lastEdit").value = user.lastName;
	document.getElementById("emailEdit").value = user.email;
	document.getElementById("phoneEdit").value = user.phone;
	document.getElementById("uid").value = user.id;
}

function closeModal() {
	var modal = document.getElementById('homeModal');
	modal.style.display = "none";
}

function updateContact(event) {
	event.preventDefault();
	var updateFirstName = document.getElementById("firstEdit").value;
	var updateLastName = document.getElementById("lastEdit").value;
	var updateEmail = document.getElementById("emailEdit").value;
	var updatePhone = document.getElementById("phoneEdit").value;
	var contactID = document.getElementById("uid").value;
	document.getElementById("updateResult").innerHTML = "";

	var jsonPayload = '{"firstName" : "' + updateFirstName + '", "lastName" : "' + updateLastName +'", "email" : "' + updateEmail + '", "phone" : "' + updatePhone + '", "id" : "' + contactID + '"}';

	// MUST match API
	var url = urlBase + '/UpdateContact.' + extension; // Changed to match php

	var xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function()
		{
			if (this.readyState == 4 && this.status == 200)
			{
				//document.getElementById("updateResult").innerHTML = "Contact has been updated";
				closeModal();
				searchContact();
        		updateNotification();
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("updateResult").innerHTML = err.message;
	}
}

function deleteContact(id) {
	var contactID = id;
	//document.getElementById("deleteResult").innerHTML = "";
	var jsonPayload = '{"id" : "' + contactID + '"}';
	var url = urlBase + '/DeleteContact.' + extension;

	var xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function()
		{
			if (this.readyState == 4 && this.status == 200)
			{
				var modal = document.getElementById('deleteModal');
		      	modal.style.display = "none";
        		searchContact();
				deleteNotification();
				//document.getElementById("updateResult").innerHTML = "Contact has been deleted";
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		//document.getElementById("deleteResult").innerHTML = err.message;
	}
}

function updateNotification(){
	var notif = document.getElementById("updateNotif");
	notif.setAttribute("class", "notification");
	notif.removeAttribute("hidden");
	document.body.removeChild(notif);
	document.body.appendChild(notif);
}

function addNotification(){
	var notif = document.getElementById("addNotif");
	notif.setAttribute("class", "notification");
	notif.removeAttribute("hidden");
	document.body.removeChild(notif);
	document.body.appendChild(notif);
}

function deleteNotification(){
	var notif = document.getElementById("deleteNotif");
	notif.setAttribute("class", "notification");
	notif.removeAttribute("hidden");
	document.body.removeChild(notif);
	document.body.appendChild(notif);
}

function comparePassword(){
	var pwd = document.getElementById("loginPassword").value;
	var pwdConfirm = document.getElementById("confirmPassword").value;

	if (pwd != pwdConfirm) {
		document.getElementById("passwordResult").innerHTML = "*Passwords do not match";
     return 1;
	} else {
		document.getElementById("passwordResult").innerHTML = "";
	}

   return 0;
}

function togglePassword() {
	var pwd = document.getElementById("loginPassword");
	var eyeball = document.getElementById("eye1");

	if (eyeball.getAttribute("class") == "fa fa-eye") {
		eyeball.setAttribute("class", "fa fa-eye-slash");
	} else {
		eyeball.setAttribute("class", "fa fa-eye");
	}

	if (pwd.getAttribute("type") == "password") {
		pwd.setAttribute("type", "text");
	} else {
		pwd.setAttribute("type", "password");
	}
}

function toggleConfirm() {
	var pwd = document.getElementById("confirmPassword");
	var eyeball = document.getElementById("eye2");

	if (eyeball.getAttribute("class") == "fa fa-eye") {
		eyeball.setAttribute("class", "fa fa-eye-slash");
	} else {
		eyeball.setAttribute("class", "fa fa-eye");
	}

	if (pwd.getAttribute("type") == "password") {
		pwd.setAttribute("type", "text");
	} else {
		pwd.setAttribute("type", "password");
	}
}

function toggleLogin() {
	var pwd = document.getElementById("loginPassword");
	var eyeball = document.getElementById("eyeLogin");

	if (eyeball.getAttribute("class") == "fa fa-eye") {
		eyeball.setAttribute("class", "fa fa-eye-slash");
	} else {
		eyeball.setAttribute("class", "fa fa-eye");
	}

	if (pwd.getAttribute("type") == "password") {
		pwd.setAttribute("type", "text");
	} else {
		pwd.setAttribute("type", "password");
	}
}
