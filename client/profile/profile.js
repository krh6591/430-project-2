let ckey = '';

// Fetch and render the Pixt sections
const loadPixts = () => {
  // Current user favorites (and other nice data)
  sendAjax('GET', '/getFavorites', null, (favs) => {
    // All users (for matching owners to usernames)
    sendAjax('GET', '/getUsers', null, (users) => {
      // All pixts (For filtering and displaying)
      sendAjax('GET', '/getPixts', null, (dat) => {
        let userID = favs.userID;
        let favorites = favs.favorites;
        let premium = favs.premium;
        let data = dat;
        
        // Cross-reference and update Pixts with users and favorites
        for (let i = 0; i < data.pixts.length; ++i) {
          data.pixts[i].creator = 'NO CREATOR';
          data.pixts[i].favClass = favorites.includes(data.pixts[i]._id) ?
                                                                        'favorited' : 'unfavorited';
        
          for (let j = 0; j < users.users.length; ++j) {
            if (data.pixts[i].owner === users.users[j]._id) {
              data.pixts[i].creator = users.users[j].username;
            }
          }
        }
        
        let upList = [];
        let fvList = [];
    
        // Filter all Pixts created and favorited by the user
        for (let i = 0; i < data.pixts.length; ++i) {
          if (data.pixts[i].owner === userID) {
            upList.push(data.pixts[i]);
          }
          if (favorites.includes(data.pixts[i]._id)) {
            fvList.push(data.pixts[i]);
          }
        }
        
        // Render pixts uploaded by the user
        ReactDOM.render(
          <PixtList pixts={upList} />, document.querySelector("#uploads")
        );
        
        // Render favorites if premium, provide upgrade option if not
        if (premium) {
          ReactDOM.render(
            <PixtList pixts={fvList} />, document.querySelector("#favorites")
          );
        }
        else {
          ReactDOM.render(
            <UpgradeForm />, document.querySelector("#favorites")
          );
        }
      });
    });
  });
};

// Favorite / un-favorite a Pixt
const favPixt = (e) => {
  const pixtID = e.target.nextSibling.innerText;
  const toFav = e.target.classList.contains("unfavorited");
  const newClass = toFav ? 'favorited' : 'unfavorited';

  sendAjax('POST', '/favorite', { pixtID: pixtID, toFav: toFav, _csrf: ckey }, () => {});
  sendAjax('POST', '/favPixt', { pixtID: pixtID, toFav: toFav,  _csrf: ckey }, () => {});
  
  // Immediate visual feedback
  e.target.className = newClass;
};

// Change user's password
const changePassword = (e) => {
  e.preventDefault();
  
  if ($("#pass").val() === '' || $("#pass2").val() === '') {
    handleError("Missing Password");
    return false;
  }
  
  if ($("#pass").val() !== $("#pass2").val()) {
    handleError("Passwords Don't Match");
    return false;
  }
  
  sendAjax('POST', '/changePassword', { password: $("#pass").val(), _csrf: ckey }, function() {});
  handleError("Password Changed");
  return false;
}

// Upgrade user to premium
const upgrade = (e) => {
  e.preventDefault();
  
  sendAjax('POST', '/upgrade', { _csrf: ckey }, function() {});
  handleError("Welcome to Premium");
  loadPixts();
  return false;
}

// Form for password change
const PasswordForm = (props) => {
  return (
    <form id="pwForm"
    name="pwForm"
    onSubmit={changePassword}
    action="/changePassword"
    method="POST"
    className="pwForm"
    >

    <label htmlFor="pass">Password: </label>
    <input id="pass" type="password" name="pass" placeholder="password"/>
    <br/>
    <label htmlFor="pass2">Password: </label>
    <input id="pass2" type="password" name="pass2" placeholder="password"/>
    <br/>
    <input type="hidden" name="_csrf" value={props.csrf}/>
    <input className="changePasswordSubmit" type="submit" value="Change Password" />
    </form>
  );
};

// Form for upgrading account
const UpgradeForm = (props) => {
  return (
    <form id="upForm"
    name="upForm"
    onSubmit={upgrade}
    action="/upgrade"
    method="POST"
    className="upForm"
    >

    <input type="hidden" name="_csrf" value={props.csrf}/>
    <input className="upgradeSubmit" type="submit" value="Get Premium" />
    </form>
  );
};

// Render Pixts
const PixtList = function(props) {
  // Special case for fresh start
  if (props.pixts.length === 0) {
    return (
      <div className="pixtList">
        <h3 className="emptyPixt">No Pixts yet</h3>
      </div>
    );
  }
  
  // Create a canvas to build the images
  let canvas = document.createElement('canvas');
  let ctx = canvas.getContext('2d');
  canvas.width = 32;
  canvas.height = 32;
  
  // Build the images
  const pixtNodes = props.pixts.map(function(pixt) {
    let pixels = pixt.pixels;
    for (let y = 0; y < 32; ++y) {
      for (let x = 0; x < 32; ++x) {
        // Build the fillStyle from the data for the current pixel
        ctx.fillStyle = '#' + pixels.charAt(y * 96 + x * 3 + 0)
                            + pixels.charAt(y * 96 + x * 3 + 1)
                            + pixels.charAt(y * 96 + x * 3 + 2);
        
        // Draw the pixel
        ctx.fillRect(x, y, 1, 1);
      }
    }
    // Generate a data URL to display as img
    let dataURL = canvas.toDataURL();
    let favString = '<3 ' + pixt.favorites;
    
    return (
      <div key={pixt._id} className="pixt">
        <img src={dataURL} alt="pixt" className="pixtImage" />
        <p>{pixt.creator}</p>
        <p className={pixt.favClass} onClick={favPixt}>{favString}</p>
        <span hidden>{pixt._id}</span>
      </div>
    );
  });
  
  return (
    <div className="pixtList">
      {pixtNodes}
    </div>
  );
};

// Initialization
const setup = function(csrf) {
  // Render password change form
  ReactDOM.render(
    <PasswordForm csrf={csrf} />, document.querySelector("#pwchange")
  );

  // Render empty favorites on init
  ReactDOM.render(
    <PixtList pixts={[]} />, document.querySelector("#favorites")
  );
  
  // Render empty uploads on init
  ReactDOM.render(
    <PixtList pixts={[]} />, document.querySelector("#uploads")
  );
  
  ckey = csrf;
  loadPixts();
}

// Fetch csrf token
const getToken = () => {
  sendAjax('GET', '/getToken', null, (result) => {
    setup(result.csrfToken);
  });
};

$(document).ready(function() {
  getToken();
});
