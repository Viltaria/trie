const app = new Moon({
  el: "#app",
  data: {
    title: "Trie",
    loading: true,
    search: '',
    searchInfo: '',
    history: [],
    possibilities: {},
    possibilities_count: 0,
    using: "Webster's_Unabridged_Dictionary.json"
  }
});

$('.item.button')
  .popup()
;

function handleFileSelect()
{
  if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
    alert('The File APIs are not fully supported in this browser.');
    return;
  }

  input = document.getElementById('file');
  if (!input) {
    alert("Um, couldn't find the file element.");
  }
  else if (!input.files) {
    alert("This browser doesn't seem to support the `files` property of file inputs.");
  }
  else if (!input.files[0]) {
    alert("Please select a file before clicking 'Load'");
  }
  else {
    file = input.files[0];
    fr = new FileReader();
    fr.fileName = file.name;
    fr.onload = receivedText;
    fr.readAsText(file);
  }
}
function receivedText() {
  app.set('loading', true);
  try {
    success(JSON.parse(fr.result));
    app.set('using', fr.fileName);
  } catch (e) {
    alert('Failed to parse JSON');
  }
}

$("#file").change(function(){
  handleFileSelect();
 });

$.getJSON('new_dictionary.json', success);
$.getJSON('public/new_dictionary.json', success);

function success( data ) {
  const root = trie( data );
  $('#download').click(function () {
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(root));
    var dlAnchorElem = document.getElementById('downloadAnchorElem');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", app.get('using'));
    dlAnchorElem.click();
  });

  $('#search').on('input', function ( e ) {
    app.set('search', e.target.value);
    app.set('searchInfo', search(root, e.target.value));
  });
  app.set('loading', false);
}

/*
  Turns a JSON object into a Trie
*/
function trie ( data ) {
  const root = {};
  for (key in data) {
    let val = data[key];
    if (val !== null && typeof val === 'object') {
      data[key] = trie(data[key]);
    } else {
      if (root[key.slice(0, 1)]) {
        trie_recurse(root[key.slice(0, 1)], key.slice(1, key.length), val);
      } else {
        const obj = {};
        trie_recurse(obj, key.slice(1, key.length), val);
        root[key.slice(0, 1)] = obj;
      }
    }
  }
  return root;
}

/*
  Recursive helper method to turn the JSON object into a Trie
*/
function trie_recurse( obj, key, val ) {
  if ( key.length <= 1 ) {
    if (key.length < 1) {
      obj.value = val;
    }
    obj[key] = {
      value: val
    }
    return;
  }
  let n = key.slice(0, 1);
  if (!obj[n]) obj[n] = {};
  trie_recurse(obj[n], key.slice(1, key.length), val);
}

/*
  Search function to search the Trie
*/
function search( root, search ) {
  search = search.toLowerCase();
  app.set('possibilities', []);
  if (search) {
    return search_recurse(root, search, []);
  }
}

/*
  Recursive helper method to search the Trie
*/
function search_recurse( obj, search, history ) {
  if (search.length <= 1) {
    if ( obj[search] ) {
      if (obj[search].value) {
        history.push(search.slice(0, 1));
        app.set('history', history);
	      app.set('possibilities', Object.keys(obj[search]).sort());
        app.set('possibilities_count', possibility(obj[search]));
        return obj[search].value;
      }
    }
  }
  let n = search.slice(0, 1);
  if (!obj[n]) {
    return "404 Word not found.";
  }

  history.push(search.slice(0, 1));
  app.set('history', history);
  app.set('possibilities', Object.keys(obj[n]).sort());
  app.set('possibilities_count', possibility(obj));
  return search_recurse( obj[n], search.slice(1, search.length), history );
}

/*
  Get all Possibilities left in the trie from a node
*/
function possibility ( node ) {
  const keys = Object.keys(node);
  let count = 0;
  for (let i = 0; i < keys.length; i++) {
    let val = node[keys[i]];
    if (val !== null && typeof val === 'object') {
      count += possibility( val );
    } else {
      count += 1;
    }
  }
  return count;
}
