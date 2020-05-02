// String representing the actively-edited Pixt canvas
let pixtStr = '';
let ckey = '';

// Fetch and render the Pixt sections
const loadPixts = () => {
  // Current user favorites (and other nice data)
  sendAjax('GET', '/getFavorites', null, (favs) => {
    // All users (for matching owners to usernames)
    sendAjax('GET', '/getUsers', null, (users) => {
      // All pixts (For filtering and displaying)
      sendAjax('GET', '/getPixts', null, (dat) => {
        let favorites = favs.favorites;
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
        // Render all Pixts
        ReactDOM.render(
          <PixtList pixts={data.pixts} />, document.querySelector("#pixts")
        );
      });
    });
  });
};

// Pull the canvas data and upload as a new Pixt
const createPixt = (e) => {
  e.preventDefault();
  
  // Serialize the form and setup the data
  let pixtArray = $("#pixtForm").serializeArray();
  let pixtData = {};
  
  for (let i = 0; i < pixtArray.length; ++i) {
    pixtData[pixtArray[i].name] = pixtArray[i].value;
  }
  pixtData.pixels = pixtStr;
  
  sendAjax('POST', '/createPixt', pixtData, function() {
    loadPixts();
  });
  
  return false;
};

// Favorite / un-favorite a Pixt
const favPixt = (e) => {
  const pixtID = e.target.nextSibling.innerText;
  const toFav = e.target.classList.contains("unfavorited");
  const newClass = toFav ? 'favorited' : 'unfavorited';

  sendAjax('POST', '/favorite', { pixtID: pixtID, toFav: toFav, _csrf: ckey }, () => {
  });
  
  sendAjax('POST', '/favPixt', { pixtID: pixtID, toFav: toFav,  _csrf: ckey }, () => {
  });
  
  e.target.className = newClass;
};

// Form for creating a Pixt (just a button, canvas section does most of the heavy lifting)
const PixtForm = (props) => {
  return (
    <form id="pixtForm"
    name="pixtForm"
    onSubmit={createPixt}
    action="/createPixt"
    method="POST"
    className="pixtForm"
    >

    <input type="hidden" name="_csrf" value={props.csrf}/>
    <input className="makePixtSubmit" type="submit" value="Create Pixt" />
    </form>
  );
};

// Render Pixts
const PixtList = function(props) {
  if (props.pixts.length === 0) {
    return (
      <div className="pixtList">
        <h3 className="emptyPixt">No Pixts yet</h3>
      </div>
    );
  }
  
  // Use a canvas to build the images
  let canvas = document.createElement('canvas');
  let ctx = canvas.getContext('2d');
  canvas.width = 32;
  canvas.height = 32;
  
  const pixtNodes = props.pixts.map(function(pixt) {
    let pixels = pixt.pixels;
    for (let y = 0; y < 32; ++y) {
      for (let x = 0; x < 32; ++x) {
        ctx.fillStyle = '#' + pixels.charAt(y * 96 + x * 3 + 0)
                            + pixels.charAt(y * 96 + x * 3 + 1)
                            + pixels.charAt(y * 96 + x * 3 + 2);
        
        ctx.fillRect(x, y, 1, 1);
      }
    }
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

// Give the canvas a nice interesting starting base
const randomizeCanvas = function(ctx) {
  pixtStr = '';
  for (let y = 0; y < 32; ++y) {
    let rowStr = '';
    for (let x = 0; x < 32; ++x) {
      // Give each channel a value from 2-4 (single-character hex)
      let pixStr = Math.floor(Math.random() * 2 + 2).toString(16) + 
                   Math.floor(Math.random() * 2 + 2).toString(16) +
                   Math.floor(Math.random() * 2 + 2).toString(16);
                
      rowStr += pixStr;
      
      ctx.fillStyle = '#' + pixStr;
      ctx.fillRect(x, y, 1, 1);
    }
    pixtStr += rowStr;
  }
}

// Initialization
const setup = function(csrf) {
  // Render Pixt creation form
  ReactDOM.render(
    <PixtForm csrf={csrf} />, document.querySelector("#makePixt")
  );
  
  // Render empty Pixts section on init
  ReactDOM.render(
    <PixtList pixts={[]} />, document.querySelector("#pixts")
  );
  
  loadPixts();
  ckey = csrf;
  
  // Setup and randomize the canvas
  let canvas = document.querySelector("#pixtCanvas")
  let ctx = canvas.getContext('2d');
  randomizeCanvas(ctx);
  canvas.addEventListener('mousedown', function(e) {
    let origin = canvas.getBoundingClientRect();
    let x = Math.floor((e.clientX - origin.left) / 16);
    let y = Math.floor((e.clientY - origin.top) / 16);

    let pixStr = Math.floor(Math.random() * 3 + 10).toString(16) + 
                 Math.floor(Math.random() * 3 + 10).toString(16) +
                 Math.floor(Math.random() * 3 + 10).toString(16);
                 
    pixtStr = pixtStr.substr(0, y * 96 + x * 3) + pixStr + pixtStr.substr(y * 96 + x * 3 + 3);
    
    ctx.fillStyle = '#' + pixStr;
    ctx.fillRect(x, y, 1, 1);
  });
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
