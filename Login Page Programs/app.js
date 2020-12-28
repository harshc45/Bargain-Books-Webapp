let signup=()=>{
	let email=document.getElementById("email_field");
	let password=document.getElementById("password_field");
	firebase.auth().createUserWithEmailAndPassword(email.value, password.value)
  .then((user) => {
    // Signed in 
    // ...
  })
  .catch((error) => {
    var errorCode = error.code;
    var errorMessage = error.message;
    // ..
  });
//console.log(email.value);
//console.log(password.value);
alert("You have signed up successfully");
}
let login=()=>{
	let email=document.getElementById("email_field");
	let password=document.getElementById("password_field");
	firebase.auth().signInWithEmailAndPassword(email.value, password.value)
  .then((user) => {
    // Signed in 
    // ...
  })
  .catch((error) => {
    var errorCode = error.code;
    var errorMessage = error.message;
  });
alert("You have logged in successfully");
}