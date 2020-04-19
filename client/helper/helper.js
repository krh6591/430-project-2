const handleError = (message) => {
  $("#errorMessage").text(message);
};

const redirect = (response) => {
  window.location = response.redirect;
};

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
