function _getProps() {
  return PropertiesService.getScriptProperties();
}

function _okJson(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function _hexDigest(bytes) {
  return bytes.map(function(b){
    var h = (b<0? b+256: b).toString(16);
    return h.length==1? '0'+h : h;
  }).join('');
}

function doGet(e) {
  var token = (e.parameter && e.parameter.t) ? e.parameter.t : '';
  if (!token) {
    return _okJson({ ok: false, error: 'missing_token' });
  }
  var props = _getProps();
  var cfgKey = 'CONFIG_' + token;
  var cfg = props.getProperty(cfgKey);
  if (cfg) {
    try {
      var obj = JSON.parse(cfg);
      return _okJson({ ok: true, config: obj });
    } catch (err) {
      return _okJson({ ok: false, error: 'invalid_config' });
    }
  }
  var valid = props.getProperty('VALID_TOKENS') || '';
  var tokens = valid.split(',').map(function(t){ return t.trim(); }).filter(Boolean);
  if (tokens.indexOf(token) === -1) {
    return _okJson({ ok: false, error: 'token_invalid' });
  }
  return _okJson({ ok: true, config: null });
}

function doPost(e) {
  try {
    var data = {};
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else {
      data.nomes = e.parameter.nomes || '';
      data.vai = e.parameter.vai || '';
      data.token = e.parameter.token || '';
      data.origem = e.parameter.origem || '';
    }

    var token = data.token || '';
    var props = _getProps();
    var valid = props.getProperty('VALID_TOKENS') || '';
    var tokens = valid.split(',').map(function(t){ return t.trim(); }).filter(Boolean);
    if (tokens.indexOf(token) === -1) {
      return _okJson({ ok: false, error: 'token_invalid' });
    }

    var singleUse = (props.getProperty('TOKEN_SINGLE_USE')+'').toLowerCase() === 'true';
    if (singleUse) {
      var usedSheetId = props.getProperty('SHEET_ID_TOKENS_USED');
      if (!usedSheetId) {
        usedSheetId = props.getProperty('SHEET_ID_PRIV');
      }
      if (usedSheetId) {
        var ssTokens = SpreadsheetApp.openById(usedSheetId);
        var sht = ssTokens.getSheetByName('tokens_used');
        if (!sht) sht = ssTokens.insertSheet('tokens_used');
        var vals = sht.getDataRange().getValues().map(function(r){ return r[0]+''; });
        if (vals.indexOf(token) !== -1) {
          return _okJson({ ok: false, error: 'token_used' });
        }
        sht.appendRow([token, new Date()]);
      }
    }

    var sheetId = props.getProperty('SHEET_ID_PRIV');
    if (!sheetId) {
      return _okJson({ ok: false, error: 'no_sheet_config' });
    }
    var ss = SpreadsheetApp.openById(sheetId);
    var sheetName = props.getProperty('SHEET_NAME_PRIV') || 'respostas';
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) sheet = ss.insertSheet(sheetName);

    var now = new Date();
    sheet.appendRow([now, token, data.nomes || '', data.vai || '', data.origem || '']);

    var pubId = props.getProperty('SHEET_ID_PUB');
    if (pubId) {
      var pubSS = SpreadsheetApp.openById(pubId);
      var pubName = props.getProperty('SHEET_NAME_PUB') || 'anon';
      var pubSheet = pubSS.getSheetByName(pubName);
      if (!pubSheet) pubSheet = pubSS.insertSheet(pubName);

      var salt = props.getProperty('ANON_SALT') || '';
      var digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, (data.nomes || '') + salt);
      var hex = _hexDigest(digest);
      pubSheet.appendRow([now, hex, data.vai || '']);
    }

    return _okJson({ ok: true });

  } catch (err) {
    return _okJson({ ok: false, error: 'exception', message: err.message });
  }
}

/*
Deploy: New deployment -> Web app
Execute as: Me
Who has access: Anyone (or Anyone with link)
*/