// Render the message in the special text zone
const handleError = (message) => {
  $("#errorMessage").text(message);
};

// Send them somewhere else
const redirect = (response) => {
  window.location = response.redirect;
};

// Send a request via ajax
const sendAjax = (type, action, data, success) => {
  $.ajax({
    cache: false,
    type: type,
    url: action,
    data: data,
    dataType: "json",
    success: success,
    error: function(xhr, status, error) {
      let messageObj = JSON.parse(xhr.responseText);
      handleError(messageObj.error);
    }
  });
};
