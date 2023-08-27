function exportMember(service, query) {
  queryDatastore(service, query);
  var target = "GetMemberInfo";
  var ts = SHEETS.getSheetByName(target);  
  var userId = ts.getRange("B3").getValue();
  // このarrayDataの中にmembersの情報が入っている
  const membersData = queryDatastore(service, query);
  const lastCol = ts.getLastColumn();
  const lastRow = ts.getLastRow();
  // "9I:9BW"に入っている値を変数serviceValuesに入れる
  const serviceValues = []
  for (let i = 9; i <= lastCol; i++){
    let value = ts.getRange(9, i).getValue();
    serviceValues.push(value);
  }
  // "10I:10BW"に入っている値を変数actionValuesに入れる
  const actionValues = []
  for (let i = 9; i <= lastCol; i++){
    let value = ts.getRange(10, i).getValue();
    actionValues.push(value);
  }

  // console.log(serviceValues);
  // console.log(actionValues);
  // console.log(membersData);
  
  ts.getRange(11, 2, lastRow, lastCol).clearContent();

  // QueryDatastoreで取ってきた値をJSONにする
  for (let i = 0; i < membersData.length; i++) {
    console.log(membersData[i].entity.properties);
    // console.log(membersData[i].entity.properties.detail.stringValue)
    let membersValues = membersData[i].entity.properties.detail.stringValue;
    let membersParse = JSON.parse(membersValues);

    let userIdValue = membersData[i].entity.properties.userId.stringValue;

    let institutionCode = membersData[i].entity.properties.institutionCode.stringValue;

    // let commonService = membersParse.roles.find(role => role.service === "common");
    // let commonService = membersParse.roles.find(role => role.service === "common").actions.find(action => action.action === "owner");
    // let commonService = membersParse.roles.find(role => role.service === "common").actions.find(action => action.action === "owner").permission;
    // console.log(commonService);
    // let testValue1 = membersParse.roles.find(role => role.service == serviceValues[0][0]);
    // let testValue2 = testValue1.actions.find(action => action.action == actionValues[0][0]).permission;
    // console.log(testValue1);
    // console.log(testValue2);


    // 必要なpermissionの値を取り出して各セルに値を入れていく
    for (let j = 0; j < serviceValues.length; j++){
      let role = membersParse.roles.find(role => role.service === serviceValues[j]);
      if (!role) {
        ts.getRange(i + 11, j + 9).setValue("false")
        continue;
      }
      let actionObject = role.actions.find(a => a.action === actionValues[j]);
      if (!role || !actionObject) {
        ts.getRange(i + 11, j + 9).setValue("false");
        continue;
      }      
      let permissionValue = membersParse.roles.find(role => role.service == serviceValues[j]).actions.find(action => action.action == actionValues[j]).permission;
      // console.log(permissionValue);
      ts.getRange(i + 11, j + 9).setValue(permissionValue);
      if (!permissionValue){
        ts.getRange(i + 11, j + 9).setValue("false");
      }
    }
    
    const userName = membersParse.userName;
    ts.getRange(i+11, 4).setValue(userName);

    const position = membersParse.position;
    ts.getRange(i+11, 5).setValue(position);
    
    const mailAdress = membersParse.emergencyEmail;
    ts.getRange(i+11, 7).setValue(mailAdress);

    ts.getRange(i+11, 6).setValue(userIdValue);

    ts.getRange(i+11, 3).setValue(institutionCode);

    const adminConsole = membersParse.disableOperation;
    ts.getRange(i+11, 8).setValue(adminConsole);
    if (!adminConsole) {
      ts.getRange(i+11, 8).setValue("false");
    }

    // 
    console.log("次の施設へ");
  }
}
