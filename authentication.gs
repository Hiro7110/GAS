// Google Cloud OAuth2 Tokens
var PROJECT_ID = "";
var CLIENT_ID = "";
var CLIENT_SECRET = "";
var API_KEY = ""

// SpreadSheet configs
var SPREAD_ID = "";
var SHEETS = "";

function onOpen(){
  SHEETS = SpreadsheetApp.openById(SPREAD_ID)
  var myMenuEntries = [];
  myMenuEntries.push({name: "InstitutionConfigs", functionName: "importInstitutionConfigs"});
  myMenuEntries.push({name: "InstitutionReferences", functionName: "importInstitutionReferences"});
  myMenuEntries.push({name: "UserConfigs", functionName: "importUserConfigs"});
  myMenuEntries.push({name: "InstitutionUserConfigs", functionName: "importInstitutionUserConfigs"});
  myMenuEntries.push({name: "Notices", functionName: "importNotices"});
  SHEETS.addMenu("Import", myMenuEntries);
}

function onOpen(){
  var importMenu = [
    {name: "InstitutionConfigs", functionName: "importInstitutionConfigs"},
    {name: "InstitutionReferences", functionName: "importInstitutionReferences"},
    {name: "UserConfigs", functionName: "importUserConfigs"},
    {name: "InstitutionUserConfigs", functionName: "importInstitutionUserConfigs"},
    {name: "Notices", functionName: "importNotices"},
    {name: "ApiKeys", functionName: "importApiKeys"},
    {name: "Members", functionName: "importMembers"},
    {name: "Members(複数施設)", functionName: "importMembers2"},
    {name: "CreateMembers(招待メールなし)", functionName: "importCreateMembersWithoutInvitation"}
  ];

  var exportMenu = [
    {name: "Invitations", functionName: "exportInvitations"},
    {name: "QueryDatastore", functionName: "exportDatastore"}
  ];

  SHEETS = SpreadsheetApp.openById(SPREAD_ID)
  SHEETS.addMenu("Import", importMenu);
  SHEETS.addMenu("Export", exportMenu);
}

/**
 * execute import InstitutionConfigs
**/
function importInstitutionConfigs() {
  SHEETS = SpreadsheetApp.openById(SPREAD_ID)
  var service = authentication();
  if (service != null &&
      Browser.msgBox("InstitutionConfigsのインポートを開始します。", Browser.Buttons.OK_CANCEL) != "cancel") {
    putInstitutionConfigs(service);
  }
}

/**
 * execute import InstitutionReferences
**/
function importInstitutionReferences() {
  SHEETS = SpreadsheetApp.openById(SPREAD_ID)
  var service = authentication();
  if (service != null &&
      Browser.msgBox("InstitutionReferencesのインポートを開始します。", Browser.Buttons.OK_CANCEL) != "cancel") {
    putInstitutionReferences(service);
  }
}

/**
 * execute import Notices
**/
function importNotices() {
  SHEETS = SpreadsheetApp.openById(SPREAD_ID)
  var service = authentication();
  if (service != null &&
      Browser.msgBox("Noticesのインポートを開始します。", Browser.Buttons.OK_CANCEL) != "cancel") {
    putNotices(service);
  }
}

/**
 * execute import UserConfigs
**/
function importUserConfigs() {
  SHEETS = SpreadsheetApp.openById(SPREAD_ID)
  var service = authentication();
  if (service != null &&
      Browser.msgBox("UserConfigsのインポートを開始します。", Browser.Buttons.OK_CANCEL) != "cancel") {
    putUserConfigs(service);
  }
}

/**
 * execute import InstitutionUserConfigs
**/
function importInstitutionUserConfigs() {
  SHEETS = SpreadsheetApp.openById(SPREAD_ID)
  var service = authentication();
  if (service != null &&
      Browser.msgBox("InstitutionUserConfigsのインポートを開始します。", Browser.Buttons.OK_CANCEL) != "cancel") {
    putInstitutionUserConfigs(service);
  }
}

/**
 * execute import ApiKeys
**/
function importApiKeys() {
  SHEETS = SpreadsheetApp.openById(SPREAD_ID)
  var service = authentication();
  if (service != null &&
      Browser.msgBox("ApiKeysのインポートを開始します。", Browser.Buttons.OK_CANCEL) != "cancel") {
    putApiKeys(service);
  }
}

/**
 * execute import Members
**/
function importMembers() {
  SHEETS = SpreadsheetApp.openById(SPREAD_ID)
  var service = authentication();
  if (Browser.msgBox("Membersのインポートを開始します。", Browser.Buttons.OK_CANCEL) != "cancel") {
    createMembers();
  }
  
}

/**
 * execute import Members
**/
function importMembers2() {
  SHEETS = SpreadsheetApp.openById(SPREAD_ID)
  var service = authentication();
  if (Browser.msgBox("(CS評価中)Membersのインポートを開始します。", Browser.Buttons.OK_CANCEL) != "cancel") {
    createMembers2();
  }
}

/**
 * execute import createMembersWithoutInvitation
**/
function importCreateMembersWithoutInvitation() {
  SHEETS = SpreadsheetApp.openById(SPREAD_ID)
  if (Browser.msgBox("Member作成(招待メールなし)を開始します。", Browser.Buttons.OK_CANCEL) != "cancel") {
    createMembersWithoutInvitation();
  }
}

/**
 * execute export Invitations
**/
function exportInvitations() {
  SHEETS = SpreadsheetApp.openById(SPREAD_ID)
  var service = authentication();
  if (Browser.msgBox("Invitationsのエクスポートを開始します。", Browser.Buttons.OK_CANCEL) != "cancel") {
    queryInvitations(service);
  }
}

function exportDatastore() {
  SHEETS = SpreadsheetApp.openById(SPREAD_ID)
  var service = authentication();
  var target = "GetMemberInfo";
  var ts = SHEETS.getSheetByName(target);  
  var insCode = ts.getRange("B3").getValue();

  var query = {
    "query": {
      "kind": [
        {
          "name": "Invitations"
        }
      ],
      "filter": {
        "propertyFilter": {
          "op": "EQUAL",
          "property": {
            "name": "institutionCode"
          },
          "value": {
            "stringValue": insCode
          }
        }
      }
    }
  }

  if (Browser.msgBox("Invitationsのエクスポートを開始します。", Browser.Buttons.OK_CANCEL) != "cancel") {
    queryDatastore(service, query);
  } 
}

/**
 * confirm whether OAuth2 authentication
 * If not exists, show dialog for authentication URL.
 **/
function authentication() {
  var service = googleOAuth2_();
  if (service.hasAccess()) {
    return service;
  } else {
    var authorizationUrl = service.getAuthorizationUrl();
    Logger.log('Open the following URL and re-run the script: %s', authorizationUrl);
    Browser.msgBox('Open the following URL and re-run the script: ' + authorizationUrl);
    return null;
  }
}

/**
 * OAuth2 callback
 **/
function authCallback(request) {
  var datastoreService = googleOAuth2_();
  var isAuthorized = datastoreService.handleCallback(request);
  if (isAuthorized) {
    Logger.log("Authentication succeeded! Please try again.");
  } else {
    return HtmlService.createHtmlOutput('Denied. You can close this tab');
  }
}
/**
 * Authentication OAuth2 based on ClientID and ClientSecret.
 **/
function googleOAuth2_() {
  // Create a new service with the given name. The name will be used when
  // persisting the authorized token, so ensure it is unique within the
  // scope of the property store.
  return OAuth2.createService('datastore')
      // Set the endpoint URLs, which are the same for all Google services.
      .setAuthorizationBaseUrl('https://accounts.google.com/o/oauth2/auth')
      .setTokenUrl('https://accounts.google.com/o/oauth2/token')
      // Set the client ID and secret, from the Google Developers Console.
      .setClientId(CLIENT_ID)
      .setClientSecret(CLIENT_SECRET)
      // Set the name of the callback function in the script referenced
      // above that should be invoked to complete the OAuth flow.
      .setCallbackFunction('authCallback')
      // Set the property store where authorized tokens should be persisted.
      .setPropertyStore(PropertiesService.getUserProperties())
      // Set the scopes to request (space-separated for Google services).
      // this is blogger read only scope for write access is:
      // https://www.googleapis.com/auth/blogger
      .setScope('https://www.googleapis.com/auth/datastore')
      // Below are Google-specific OAuth2 parameters.
      // Sets the login hint, which will prevent the account chooser screen
      // from being shown to users logged in with multiple accounts.
      .setParam('login_hint', Session.getActiveUser().getEmail())
      // Requests offline access.
      .setParam('access_type', 'offline')
      // Forces the approval prompt every time. This is useful for testing,
      // but not desirable in a production application.
      .setParam('approval_prompt', 'force');
}
