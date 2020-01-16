function validateNewList() {
  var x = document.forms["listModalForm"]["newListInput"].value;
  if (x == "" || x == null) {
    alert("New Project Name must be entered");
    return false;
  }
}


function validateNewItem() {
  var x = document.forms["newItemForm"]["newItem"].value;
  if (x == "" || x == null) {
    alert("List item cannot be empty");
    return false;
  }
}
