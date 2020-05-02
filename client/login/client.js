// Check input validity and log the user in
const handleLogin = (e) => {
  e.preventDefault();
  
  if ($("#user").val() === '' || $("#pass").val() === '') {
    handleError("Missing Username/Password");
    return false;
  }
  
  sendAjax('POST', $("#loginForm").attr("action"), $("#loginForm").serialize(), redirect);
  
  return false;
};

// Check input validity and create a user
const handleSignup = (e) => {
  e.preventDefault();
  
  if ($("#user").val() === '' || $("#pass").val() === '' || $("#pass2").val() === '') {
    handleError("Missing Username/Password");
    return false;
  }
  
  if ($("#pass").val() !== $("#pass2").val()) {
    handleError("Passwords Don't Match");
    return false;
  }
  
  sendAjax('POST', $("#signupForm").attr("action"), $("#signupForm").serialize(), redirect);
  
  return false;
};

// Form for logging in
const LoginWindow = (props) => {
  return (
    <form id="loginForm"
    name="loginForm"
    onSubmit={handleLogin}
    action="/login"
    method="POST"
    className="mainForm"
    >
    <br/>
    <label htmlFor="username">Username: </label>
    <input id="user" type="text" name="username" placeholder="username"/>
    <br/>
    <label htmlFor="pass">Password: </label>
    <input id="pass" type="password" name="pass" placeholder="password"/>
    <br/>
    <input type="hidden" name="_csrf" value={props.csrf}/>
    <input className="formSubmit" type="submit" value="Sign In" />
    </form>
  );
};

// Form for signing up
const SignupWindow = (props) => {
  return (
    <form id="signupForm"
    name="signupForm"
    onSubmit={handleSignup}
    action="/signup"
    method="POST"
    className="mainForm"
    >
    <br/>
    <label htmlFor="username">Username: </label>
    <input id="user" type="text" name="username" placeholder="username"/>
    <br/>
    <label htmlFor="pass">Password: </label>
    <input id="pass" type="password" name="pass" placeholder="password"/>
    <br/>
    <label htmlFor="pass2">Password: </label>
    <input id="pass2" type="password" name="pass2" placeholder="password"/>
    <br/>
    <input type="hidden" name="_csrf" value={props.csrf}/>
    <input className="formSubmit" type="submit" value="Sign Up" />
    </form>
  );
};

// Render the login form
const createLoginWindow = (csrf) => {
  ReactDOM.render(
    <LoginWindow csrf={csrf} />,
    document.querySelector("#content")
  );
};

// Render the signup form
const createSignupWindow = (csrf) => {
  ReactDOM.render(
    <SignupWindow csrf={csrf} />,
    document.querySelector("#content")
  );
};

// Initialization
const setup = (csrf) => {
  const loginButton = document.querySelector("#loginButton");
  const signupButton = document.querySelector("#signupButton");
  
  signupButton.addEventListener("click", (e) => {
    e.preventDefault();
    createSignupWindow(csrf);
    return false;
  });
  
  loginButton.addEventListener("click", (e) => {
    e.preventDefault();
    createLoginWindow(csrf);
    return false;
  });
  
  createLoginWindow(csrf);
};

// Fetch csrf token
const getToken = () => {
  sendAjax('GET', '/getToken', null, (result) => {
    setup(result.csrfToken);
  });
};

$(document).ready(function() {
  getToken();
});
