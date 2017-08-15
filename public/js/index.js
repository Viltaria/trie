const app = new Moon({
  el: "#app",
  data: {
    title: "Trie",
    loading: true,
    search: '',
    searchInfo: '',
    history: [],
    possibilities: {},
    using: "Webster's Unabridged Dictionary"
  }
});

$('.item.button')
  .popup()
;

$.getJSON('new_dictionary.json', success);

function success( data ) {
  const root = trie(data);
  $('#search').on('input', function ( e ) {
    app.set('search', e.target.value);
    app.set('searchInfo', search(root, e.target.value));
  });
  app.set('loading', false);
}

/*
  Turns a non-nested JSON object into a Trie
*/
function trie ( data ) {
  const root = {};
  for (key in data) {
    let val = data[key];
    if (root[key.slice(0, 1)]) {
      trie_recurse(root[key.slice(0, 1)], key.slice(1, key.length), val);
    } else {
      const obj = {};
      trie_recurse(obj, key.slice(1, key.length), val);
      root[key.slice(0, 1)] = obj;
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
  if (search) return search_recurse(root, search, []);
}

/*
  Recursive helper method to search the Trie
*/
function search_recurse( obj, search, history ) {
  history.push(search.slice(0, 1));
  app.set('history', history);
  if (search.length <= 1) {
    if ( obj[search] ) {
      if (obj[search].value) {
        app.set('possibilities', Object.keys(obj[search]));
        return obj[search].value;
      }
    }
  }
  let n = search.slice(0, 1);
  if (!obj[n]) {
    return "404 Word not found.";
  }
  app.set('possibilities', Object.keys(obj[n]));
  return search_recurse( obj[n], search.slice(1, search.length), history );
}
