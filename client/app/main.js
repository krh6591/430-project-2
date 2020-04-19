// String representing the actively-edited Pixt canvas
let pixtStr = '';

const loadPixts = () => {
  sendAjax('GET', '/getPixts', null, (data) => {
    ReactDOM.render(
      <PixtList pixts={data.pixts} />, document.querySelector("#pixts")
    );
  });
};

const createPixt = (e) => {
  e.preventDefault();
  
  // Serialize the form and setup the data
  let pixtArray = $("#pixtForm").serializeArray();
  let pixtData = {};
  
  console.log(pixtArray);
  
  for (let i = 0; i < pixtArray.length; ++i) {
    pixtData[pixtArray[i].name] = pixtArray[i].value;
  }
  pixtData.pixels = pixtStr;
  
  sendAjax('POST', '/createPixt', pixtData, function() {
    loadPixts();
  });
  
  return false;
};


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
    
    return (
      <div key={pixt._id} className="pixt">
        <img src={dataURL} alt="pixt" className="pixtImage" />
      </div>
    );
  });
  
  return (
    <div className="pixtList">
      {pixtNodes}
    </div>
  );
};

const randomizeCanvas = function(ctx) {
  pixtStr = '';
  for (let y = 0; y < 32; ++y) {
    let rowStr = '';
    for (let x = 0; x < 32; ++x) {
    
      let pixStr = Math.floor(Math.random() * 3 + 1).toString(16) + 
                   Math.floor(Math.random() * 3 + 1).toString(16) +
                   Math.floor(Math.random() * 3 + 1).toString(16);
                
      rowStr += pixStr;
      
      ctx.fillStyle = '#' + pixStr;
      ctx.fillRect(x, y, 1, 1);
    }
    pixtStr += rowStr;
  }
}

const setup = function(csrf) {
  ReactDOM.render(
    <PixtForm csrf={csrf} />, document.querySelector("#makePixt")
  );
  
  ReactDOM.render(
    <PixtList pixts={[]} />, document.querySelector("#pixts")
  );
  
  loadPixts();
  
  // Setup and randomize the canvas
  let canvas = document.querySelector("#pixtCanvas")
  let ctx = canvas.getContext('2d');
  randomizeCanvas(ctx);
  canvas.addEventListener('mousedown', function(e) {
    let origin = canvas.getBoundingClientRect();
    let x = Math.floor((e.clientX - origin.left) / 16);
    let y = Math.floor((e.clientY - origin.top) / 16);

    let pixStr = Math.floor(Math.random() * 3 + 11).toString(16) + 
                 Math.floor(Math.random() * 3 + 11).toString(16) +
                 Math.floor(Math.random() * 3 + 11).toString(16);
                 
    pixtStr = pixtStr.substr(0, y * 96 + x * 3) + pixStr + pixtStr.substr(y * 96 + x * 3 + 3);
    
    ctx.fillStyle = '#' + pixStr;
    ctx.fillRect(x, y, 1, 1);
  });
}

const getToken = () => {
  sendAjax('GET', '/getToken', null, (result) => {
    setup(result.csrfToken);
  });
};

$(document).ready(function() {
  getToken();
});
