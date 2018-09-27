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
  "lastUpdated": "2018-09-27 18:32:57"
}

class Collections {
    constructor() {
        this.collections = {};
        let coll;
        while (coll = Zotero.nextCollection()) {
            const key = (coll.primary ? coll.primary : coll).key;
            this.collections[key] = {
                parent: coll.fields.parentKey,
                name: coll.name,
            };
        }
        for (const key in this.collections) {
            const coll = this.collections[key];
            if (coll.parent && !this.collections[coll.parent]) {
                coll.parent = false;
            }
            coll.path = this.path(coll);
        }
        Zotero.debug('collections: ' + JSON.stringify(this.collections));
    }
    clean(filename) {
        return filename.replace(/[#%&{}\\<>\*\?\/\$!'":@]/g, '_');
    }
    path(coll) {
        return (this.collections[coll.parent] ? this.path(this.collections[coll.parent]) + '/' : '') + this.clean(coll.name);
    }
    save(item) {
        const attachments = (item.itemType === 'attachment') ? [item] : (item.attachments || []);
        const collections = (item.collections || []).map(key => this.collections[key]).filter(coll => coll);
        for (const att of attachments) {
            if (att.contentType === 'text/html')
                att.filename = `${this.clean(att.filename.replace(/\.html?$/, ''))}/${this.clean(att.filename)}`; // assume text/html is snapshot
            if (item.itemType !== 'attachment')
                att.filename = `${this.clean(item.title)}/${att.filename}`;
            if (collections.length) {
                for (const coll of collections) {
                    att.saveFile(`${coll.path}/${att.filename}`, true);
                    Zotero.write(`${coll.path}/${att.filename}\n`);
                }
            }
            else {
                att.saveFile(att.filename, true);
                Zotero.write(`${att.filename}\n`);
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
