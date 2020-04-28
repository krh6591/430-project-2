"use strict";

// String representing the actively-edited Pixt canvas
var pixtStr = '';

var loadPixts = function loadPixts() {
  sendAjax('GET', '/getPixts', null, function (data) {
    ReactDOM.render( /*#__PURE__*/React.createElement(PixtList, {
      pixts: data.pixts
    }), document.querySelector("#pixts"));
  });
};

var createPixt = function createPixt(e) {
  e.preventDefault(); // Serialize the form and setup the data

  var pixtArray = $("#pixtForm").serializeArray();
  var pixtData = {};
  console.log(pixtArray);

  for (var i = 0; i < pixtArray.length; ++i) {
    pixtData[pixtArray[i].name] = pixtArray[i].value;
  }

  pixtData.pixels = pixtStr;
  sendAjax('POST', '/createPixt', pixtData, function () {
    loadPixts();
  });
  return false;
};

var PixtForm = function PixtForm(props) {
  return (/*#__PURE__*/React.createElement("form", {
      id: "pixtForm",
      name: "pixtForm",
      onSubmit: createPixt,
      action: "/createPixt",
      method: "POST",
      className: "pixtForm"
    }, /*#__PURE__*/React.createElement("input", {
      type: "hidden",
      name: "_csrf",
      value: props.csrf
    }), /*#__PURE__*/React.createElement("input", {
      className: "makePixtSubmit",
      type: "submit",
      value: "Create Pixt"
    }))
  );
}; // Render Pixts


var PixtList = function PixtList(props) {
  if (props.pixts.length === 0) {
    return (/*#__PURE__*/React.createElement("div", {
        className: "pixtList"
      }, /*#__PURE__*/React.createElement("h3", {
        className: "emptyPixt"
      }, "No Pixts yet"))
    );
  } // Use a canvas to build the images


  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  canvas.width = 32;
  canvas.height = 32;
  var pixtNodes = props.pixts.map(function (pixt) {
    var pixels = pixt.pixels;

    for (var y = 0; y < 32; ++y) {
      for (var x = 0; x < 32; ++x) {
        ctx.fillStyle = '#' + pixels.charAt(y * 96 + x * 3 + 0) + pixels.charAt(y * 96 + x * 3 + 1) + pixels.charAt(y * 96 + x * 3 + 2);
        ctx.fillRect(x, y, 1, 1);
      }
    }

    var dataURL = canvas.toDataURL();
    return (/*#__PURE__*/React.createElement("div", {
        key: pixt._id,
        className: "pixt"
      }, /*#__PURE__*/React.createElement("img", {
        src: dataURL,
        alt: "pixt",
        className: "pixtImage"
      }))
    );
  });
  return (/*#__PURE__*/React.createElement("div", {
      className: "pixtList"
    }, pixtNodes)
  );
};

var randomizeCanvas = function randomizeCanvas(ctx) {
  pixtStr = '';

  for (var y = 0; y < 32; ++y) {
    var rowStr = '';

    for (var x = 0; x < 32; ++x) {
      var pixStr = Math.floor(Math.random() * 2 + 2).toString(16) + Math.floor(Math.random() * 2 + 2).toString(16) + Math.floor(Math.random() * 2 + 2).toString(16);
      rowStr += pixStr;
      ctx.fillStyle = '#' + pixStr;
      ctx.fillRect(x, y, 1, 1);
    }

    pixtStr += rowStr;
  }
};

var setup = function setup(csrf) {
  ReactDOM.render( /*#__PURE__*/React.createElement(PixtForm, {
    csrf: csrf
  }), document.querySelector("#makePixt"));
  ReactDOM.render( /*#__PURE__*/React.createElement(PixtList, {
    pixts: []
  }), document.querySelector("#pixts"));
  loadPixts(); // Setup and randomize the canvas

  var canvas = document.querySelector("#pixtCanvas");
  var ctx = canvas.getContext('2d');
  randomizeCanvas(ctx);
  canvas.addEventListener('mousedown', function (e) {
    var origin = canvas.getBoundingClientRect();
    var x = Math.floor((e.clientX - origin.left) / 16);
    var y = Math.floor((e.clientY - origin.top) / 16);
    var pixStr = Math.floor(Math.random() * 3 + 10).toString(16) + Math.floor(Math.random() * 3 + 10).toString(16) + Math.floor(Math.random() * 3 + 10).toString(16);
    pixtStr = pixtStr.substr(0, y * 96 + x * 3) + pixStr + pixtStr.substr(y * 96 + x * 3 + 3);
    ctx.fillStyle = '#' + pixStr;
    ctx.fillRect(x, y, 1, 1);
  });
};

var getToken = function getToken() {
  sendAjax('GET', '/getToken', null, function (result) {
    setup(result.csrfToken);
  });
};

$(document).ready(function () {
  getToken();
});
"use strict";

var handleError = function handleError(message) {
  $("#errorMessage").text(message);
};

var redirect = function redirect(response) {
  window.location = response.redirect;
};

var sendAjax = function sendAjax(type, action, data, success) {
  $.ajax({
    cache: false,
    type: type,
    url: action,
    data: data,
    dataType: "json",
    success: success,
    error: function error(xhr, status, _error) {
      var messageObj = JSON.parse(xhr.responseText);
      handleError(messageObj.error);
    }
  });
};
