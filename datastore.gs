// begin transaction
function beginTransaction(service) {
  var uri = "" + API_KEY
  var headers = { "Authorization": "Bearer " + service.getAccessToken() };
  var options = {
    "headers"     : headers,
    "method"      : "post",
    "contentType" : 'application/json',
  };
  var res = JSON.parse(UrlFetchApp.fetch(uri, options));
  return res.transaction;
}

function commit(service, body) {
  var uri = "https://datastore.googleapis.com/v1/projects/" + PROJECT_ID + ":commit?key=" + API_KEY
  var headers = { "Authorization": "Bearer " + service.getAccessToken() };
  var options = {
    "headers"     : headers,
    "method"      : "post",
    "contentType" : 'application/json'
  };
  if (body) { options.payload = JSON.stringify(body); }
  var res = JSON.parse(UrlFetchApp.fetch(uri, options));
  if (res.error) { return res.error; }
  return null;
}


/**
 * データストアへアクセスする
**/
function queryDatastore(service, query) {
  var fields ="batch(endCursor%2CentityResults%2Fentity%2Fproperties%2CmoreResults)";
  var api = "https://datastore.googleapis.com/v1beta3/projects/" + PROJECT_ID + ":runQuery?fields="+fields+"&key="+API_KEY;
  var headers = {
    "Authorization": "Bearer " + service.getAccessToken()
  };
  
  var options = {
    "headers"     : headers,
    "method"      : "post",
    "contentType" : 'application/json',
  };
  var array = [];
  var has_next = true;
  var cursor = null;

  // 1回で取得しきれなかった場合は、終わるまで繰り返し取得する
  while (has_next) {
    if (cursor != null) query["query"]["startCursor"]　= cursor;
    options.payload = JSON.stringify(query);
    var res = UrlFetchApp.fetch(api, options);
    var json = JSON.parse(res);
    for (var i in json.batch.entityResults) {
      array.push(json.batch.entityResults[i]);
    }
    cursor = json.batch.endCursor;
    if (json.batch.moreResults == "NO_MORE_RESULTS" ||
         json.batch.moreResults == "MORE_RESULTS_AFTER_LIMIT") {
      has_next = false;
    }
  }
  return array;
}
