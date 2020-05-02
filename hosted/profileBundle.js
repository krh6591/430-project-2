"use strict";

var ckey = '';

var loadPixts = function loadPixts() {
  sendAjax('GET', '/getFavorites', null, function (favs) {
    sendAjax('GET', '/getUsers', null, function (users) {
      sendAjax('GET', '/getPixts', null, function (dat) {
        var userID = favs.userID;
        var favorites = favs.favorites;
        var premium = favs.premium;
        var data = dat;
        console.log(favs);
        console.log(favs.premium);

        for (var i = 0; i < data.pixts.length; ++i) {
          data.pixts[i].creator = 'NO CREATOR';
          data.pixts[i].favClass = favorites.includes(data.pixts[i]._id) ? 'favorited' : 'unfavorited';

          for (var j = 0; j < users.users.length; ++j) {
            if (data.pixts[i].owner === users.users[j]._id) {
              data.pixts[i].creator = users.users[j].username;
            }
          }
        }

        var upList = [];
        var fvList = []; // Filter all Pixts created and favorited by the user

        for (var _i = 0; _i < data.pixts.length; ++_i) {
          if (data.pixts[_i].owner === userID) {
            upList.push(data.pixts[_i]);
          }

          if (favorites.includes(data.pixts[_i]._id)) {
            fvList.push(data.pixts[_i]);
          }
        }

        console.log(fvList);
        ReactDOM.render( /*#__PURE__*/React.createElement(PixtList, {
          pixts: upList
        }), document.querySelector("#uploads")); // Render favorites if premium, provide upgrade option if not

        if (premium) {
          ReactDOM.render( /*#__PURE__*/React.createElement(PixtList, {
            pixts: fvList
          }), document.querySelector("#favorites"));
        } else {
          ReactDOM.render( /*#__PURE__*/React.createElement(UpgradeForm, null), document.querySelector("#favorites"));
        }
      });
    });
  });
};

var favPixt = function favPixt(e) {
  var pixtID = e.target.nextSibling.innerText;
  var toFav = e.target.classList.contains("unfavorited");
  var newClass = toFav ? 'favorited' : 'unfavorited';
  sendAjax('POST', '/favorite', {
    pixtID: pixtID,
    toFav: toFav,
    _csrf: ckey
  }, function () {});
  sendAjax('POST', '/favPixt', {
    pixtID: pixtID,
    toFav: toFav,
    _csrf: ckey
  }, function () {});
  e.target.className = newClass;
};

var changePassword = function changePassword(e) {
  e.preventDefault();

  if ($("#pass").val() === '' || $("#pass2").val() === '') {
    handleError("Missing Password");
    return false;
  }

  if ($("#pass").val() !== $("#pass2").val()) {
    handleError("Passwords Don't Match");
    return false;
  }

  sendAjax('POST', '/changePassword', {
    password: $("#pass").val(),
    _csrf: ckey
  }, function () {});
  handleError("Password Changed");
  return false;
};

var upgrade = function upgrade(e) {
  e.preventDefault();
  sendAjax('POST', '/upgrade', {
    _csrf: ckey
  }, function () {});
  handleError("Welcome to Premium");
  loadPixts();
  return false;
};

var PasswordForm = function PasswordForm(props) {
  return (/*#__PURE__*/React.createElement("form", {
      id: "pwForm",
      name: "pwForm",
      onSubmit: changePassword,
      action: "/changePassword",
      method: "POST",
      className: "pwForm"
    }, /*#__PURE__*/React.createElement("label", {
      htmlFor: "pass"
    }, "Password: "), /*#__PURE__*/React.createElement("input", {
      id: "pass",
      type: "password",
      name: "pass",
      placeholder: "password"
    }), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("label", {
      htmlFor: "pass2"
    }, "Password: "), /*#__PURE__*/React.createElement("input", {
      id: "pass2",
      type: "password",
      name: "pass2",
      placeholder: "password"
    }), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("input", {
      type: "hidden",
      name: "_csrf",
      value: props.csrf
    }), /*#__PURE__*/React.createElement("input", {
      className: "changePasswordSubmit",
      type: "submit",
      value: "Change Password"
    }))
  );
};

var UpgradeForm = function UpgradeForm(props) {
  return (/*#__PURE__*/React.createElement("form", {
      id: "upForm",
      name: "upForm",
      onSubmit: upgrade,
      action: "/upgrade",
      method: "POST",
      className: "upForm"
    }, /*#__PURE__*/React.createElement("input", {
      type: "hidden",
      name: "_csrf",
      value: props.csrf
    }), /*#__PURE__*/React.createElement("input", {
      className: "upgradeSubmit",
      type: "submit",
      value: "Get Premium"
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
    var favString = '<3 ' + pixt.favorites;
    return (/*#__PURE__*/React.createElement("div", {
        key: pixt._id,
        className: "pixt"
      }, /*#__PURE__*/React.createElement("img", {
        src: dataURL,
        alt: "pixt",
        className: "pixtImage"
      }), /*#__PURE__*/React.createElement("p", null, pixt.creator), /*#__PURE__*/React.createElement("p", {
        className: pixt.favClass,
        onClick: favPixt
      }, favString), /*#__PURE__*/React.createElement("span", {
        hidden: true
      }, pixt._id))
    );
  });
  return (/*#__PURE__*/React.createElement("div", {
      className: "pixtList"
    }, pixtNodes)
  );
};

var setup = function setup(csrf) {
  ReactDOM.render( /*#__PURE__*/React.createElement(PasswordForm, {
    csrf: csrf
  }), document.querySelector("#pwchange"));
  ReactDOM.render( /*#__PURE__*/React.createElement(PixtList, {
    pixts: []
  }), document.querySelector("#favorites"));
  ReactDOM.render( /*#__PURE__*/React.createElement(PixtList, {
    pixts: []
  }), document.querySelector("#uploads"));
  loadPixts();
  ckey = csrf;
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
