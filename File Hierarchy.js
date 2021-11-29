{
  "translatorID": "86ffd88b-6f4e-4bec-a5be-839c1034beb2",
  "label": "File Hierarchy",
  "description": "Export files according to collection organisation",
  "creator": "Emiliano Heyns",
  "target": "txt",
  "minVersion": "4.0.27",
  "maxVersion": "",
  "configOptions": {
    "getCollections": true
  },
  "displayOptions": {
    "exportFileData": true
  },
  "translatorType": 2,
  "browserSupport": "gcsv",
  "priority": 100,
  "inRepository": false,
  "lastUpdated": "2021-11-29 19:18:51"
}

class Collections {
  constructor() {
    this.collections = {};
    let coll;
    let path;
    let childp;
    while (coll = Zotero.nextCollection()) {
      for (const e of coll.descendents) {
        path = coll.fields.name + '/' + e.name;
        this.collections[e.key] = {
          path: path,
        };
        if (e.children) {
          for (const c of e.children) {
            childp=path;
            if (c.type == 'collection') {
              childp = childp + '/' + c.name;
              this.collections[c.key] = {
                  path: childp,
              };
              if (c.children) {
                for (const c2 of c.children) {
                  if (c2.type == 'collection') {
                    childp = childp + '/' + c2.name;
                    this.collections[c2.key] = {
                        path: childp,
                    };
                  }
                }
              }
            }
          }
        }
      }
      this.collections[coll.primary.key] = {
          path: path,
      };
    }
    Zotero.debug('coll :' + JSON.stringify(this.collections));
  }
  clean(filename) {
      return filename.replace(/[#%&{}\\<>\*\?\/\$!'":@]/g, '_');
  }
  save(item) {
    const attachments = (item.itemType === 'attachment') ? [item] : (item.attachments || []);
    const collections = (item.collections || []).map(key => this.collections[key]).filter(coll => coll);
    for (const att of attachments) {
      if (!att.defaultPath || att.contentType === 'text/html' || !att.filename)
          continue;
      for (const coll of (collections.length ? collections : [{ path: '' }])) {
        if (coll.path == '')
          Zotero.debug('item :' + JSON.stringify(item));

        att.saveFile(coll.path + '/' + att.filename, true);
      }
    }
  }
}

function doExport() {
  if (!Zotero.getOption('exportFileData'))
    throw new Error('File Hierarchy needs "Export File Data" to be on');
  const collections = new Collections;
  let item, attachments;
  while ((item = Zotero.nextItem())) {
    collections.save(item);
  }
}
