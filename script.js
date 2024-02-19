const fetch = import('node-fetch');

const axios = require('axios');

const fs=require ('fs')

const { google } = require('googleapis');
const api_key='AIzaSyBNdkr-wCP0fe6DZ0GJ5kix3LzdTrFWkLk'

const key= require ('./serviceAccounkey.json')

const { authenticate, auth } = require('google-auth-library');

const { OAuth2Client }= require('google-auth-library');

const { Storage } = require('@google-cloud/storage');

const {storage} = new Storage();

const apiUrl = 'https://proxy-ryjv5uudqq-ew.a.run.app' 

const SCOPES = ['https://www.googleapis.com/auth/drive']

const GCS_URI_QUERY = 'gcsUri';

const PROJECT_QUERY = 'project';

const AUTH_HEADER= 'Authorization';
const AUTH_PREFIX= 'Bearer';
const PROCESSOR_ENDPOINT = 'parser';

const BASE_LIST_REQUEST = {
    orderBy: 'createdTime', 
    corpora: 'drive',
    includeTeamDriveItems: true,
    supportsAllDrives: true
};

const bucketName = 'origamee-qa-astander';
const storageFileName = 'new-filename.pdf';

const DIGITAILIZER_API = "https://proxy-z3i57tjyga-ew.a.run.app";
const TOKEN_ENDPOINT = 'digitailizer';



/**
 * Authenticates in origamee with a service account
 * @param {*} schemaId 
 * @param {*} contractId 
 * @param {*} data 
 * @returns 
 */
async function authenticate1(schemaId, contractId, data) {

    const url = `https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=AIzaSyDQifTSH9D3zBa8e8--ZkIWl7FOPEaJ1kM`;

    try {
        const response = await axios.post(url, {
                email: 'astander@origamee-prod.iam.gserviceaccount.com',
                password: 'holaFer',
                returnSecureToken: true,
            },{
                headers: {
                    'Content-Type': 'application/json',
                },  
            });

        const token = response.data.idToken;

        return token;
    } catch (error) {
        throw error;
    }
}


/**
 * Process pdf, 
 */
async function processPDFs() {
    try {

        let datos = null;
        let data = null;

        const DEFAULT_SCHEMA = await getSchema();
        
        //const DEFAULT_SCHEMA= { "display": "form", "settings": { "pdf": { "id": "1ec0f8ee-6685-5d98-a847-26f67b67d6f0", "src": "https://files.form.io/pdf/5692b91fd1028f01000407e3/file/1ec0f8ee-6685-5d98-a847-26f67b67d6f0" } }, "components": [ { "title": "Parte de Trabajo", "theme": "primary", "collapsible": false, "key": "parteDeTrabajo", "type": "panel", "label": "Panel", "input": false, "tableView": false, "components": [ { "label": "Columns", "columns": [ { "components": [ { "label": "Empresa", "applyMaskOn": "change", "tableView": true, "validate": { "required": true }, "key": "EMPRESA", "type": "textfield", "input": true } ], "offset": 0, "push": 0, "pull": 0, "size": "md", "currentWidth": 6, "width": 6 }, { "components": [ { "label": "Fecha", "format": "dd-MM-yyyy", "tableView": false, "datePicker": { "disableWeekends": false, "disableWeekdays": false }, "enableTime": false, "timePicker": { "showMeridian": false }, "enableMinDateInput": false, "enableMaxDateInput": false, "key": "fecha", "type": "datetime", "input": true, "widget": { "type": "calendar", "displayInTimezone": "viewer", "locale": "en", "useLocaleSettings": false, "allowInput": true, "mode": "single", "enableTime": false, "noCalendar": false, "format": "dd-MM-yyyy", "hourIncrement": 1, "minuteIncrement": 1, "time_24hr": true, "minDate": null, "disableWeekends": false, "disableWeekdays": false, "maxDate": null } } ], "offset": 0, "push": 0, "pull": 0, "size": "md", "currentWidth": 6, "width": 6 } ], "autoAdjust": true, "key": "columns1", "type": "columns", "input": false, "tableView": false }, { "label": "Columns", "columns": [ { "components": [ { "label": "Nº Proyecto", "applyMaskOn": "change", "tableView": true, "validate": { "required": true }, "key": "N0_PROYECTO", "type": "textfield", "input": true } ], "width": 6, "offset": 0, "push": 0, "pull": 0, "size": "md", "currentWidth": 6 }, { "components": [ { "label": "Buque", "applyMaskOn": "change", "tableView": true, "validate": { "required": true }, "key": "BUQUE", "type": "textfield", "input": true } ], "width": 6, "offset": 0, "push": 0, "pull": 0, "size": "md", "currentWidth": 6 } ], "key": "columns", "type": "columns", "input": false, "tableView": false }, { "label": "Columns", "columns": [ { "components": [ { "label": "Nº Tarea", "applyMaskOn": "change", "tableView": true, "validate": { "required": true }, "key": "nTarea", "type": "textfield", "input": true } ], "width": 6, "offset": 0, "push": 0, "pull": 0, "size": "md", "currentWidth": 6 }, { "components": [ { "label": "Fiabilidad", "applyMaskOn": "change", "mask": false, "disabled": true, "tableView": false, "delimiter": false, "requireDecimal": false, "inputFormat": "plain", "truncateMultipleSpaces": false, "clearOnHide": false, "calculateValue": "value = Math.floor(data.confidence.mean * 100);", "key": "fiabilidad", "type": "number", "input": true } ], "width": 6, "offset": 0, "push": 0, "pull": 0, "size": "md", "currentWidth": 6 } ], "key": "columns2", "type": "columns", "input": false, "tableView": false }, { "title": "Lista Tuberías", "theme": "primary", "collapsible": false, "key": "listaTuberias", "type": "panel", "label": "Panel", "input": false, "tableView": false, "components": [ { "label": "Lista de Tuberias", "tableView": false, "addAnother": "Añadir", "saveRow": "Aceptar", "removeRow": "Cancelar", "rowDrafts": true, "key": "listaDeTuberias", "type": "editgrid", "displayAsTable": false, "input": true, "components": [ { "label": "Número Tuberia", "applyMaskOn": "change", "mask": false, "tableView": true, "delimiter": false, "requireDecimal": false, "inputFormat": "plain", "truncateMultipleSpaces": false, "key": "numeroTuberia", "type": "number", "input": true }, { "label": "Materiales", "applyMaskOn": "change", "tableView": true, "key": "materiales", "type": "textfield", "input": true }, { "label": "Diámetros", "applyMaskOn": "change", "mask": false, "tableView": true, "delimiter": false, "requireDecimal": false, "inputFormat": "plain", "truncateMultipleSpaces": false, "key": "diametros", "type": "number", "input": true }, { "label": "Espesores", "applyMaskOn": "change", "tableView": true, "key": "espesores", "type": "textfield", "input": true }, { "label": "Servicio/Línea", "applyMaskOn": "change", "tableView": true, "key": "servicioLinea", "type": "textfield", "input": true }, { "label": "Tratamientos", "applyMaskOn": "change", "tableView": true, "key": "tratamientos", "type": "textfield", "input": true }, { "label": "Columns", "columns": [ { "components": [ { "label": "Bridas", "tableView": false, "defaultValue": false, "key": "bridas", "conditional": { "show": true }, "type": "checkbox", "input": true } ], "offset": 0, "push": 0, "pull": 0, "size": "md", "currentWidth": 4, "width": 4 }, { "components": [ { "label": "Tubos", "tableView": false, "key": "tubos", "type": "checkbox", "input": true, "defaultValue": false } ], "offset": 0, "push": 0, "pull": 0, "size": "md", "currentWidth": 4, "width": 4 }, { "components": [ { "label": "T", "tableView": false, "defaultValue": false, "key": "t", "type": "checkbox", "input": true } ], "size": "md", "offset": 0, "push": 0, "pull": 0, "width": 4, "currentWidth": 4 } ], "key": "columns", "type": "columns", "input": false, "tableView": false }, { "label": "Columns", "columns": [ { "components": [ { "label": "Codos", "tableView": false, "key": "codos", "type": "checkbox", "input": true, "defaultValue": false } ], "offset": 0, "push": 0, "pull": 0, "size": "md", "currentWidth": 4, "width": 4 }, { "components": [ { "label": "Mangon", "tableView": false, "key": "mangon", "type": "checkbox", "input": true, "defaultValue": false } ], "offset": 0, "push": 0, "pull": 0, "size": "md", "currentWidth": 4, "width": 4 } ], "key": "columns1", "type": "columns", "input": false, "tableView": false }, { "label": "Colada", "applyMaskOn": "change", "mask": false, "tableView": false, "delimiter": false, "requireDecimal": false, "inputFormat": "plain", "truncateMultipleSpaces": false, "key": "colada", "type": "number", "input": true }, { "label": "Cantidad", "applyMaskOn": "change", "mask": false, "tableView": false, "delimiter": false, "requireDecimal": false, "inputFormat": "plain", "truncateMultipleSpaces": false, "key": "cantidad", "type": "number", "input": true }, { "label": "Otros", "applyMaskOn": "change", "tableView": false, "key": "otros", "type": "textfield", "input": true } ] } ] }, { "label": "Adjuntar documento", "storage": "FirebaseStorage", "tableView": false, "webcam": false, "capture": false, "fileTypes": [ { "label": "", "value": "" } ], "key": "documento", "type": "file", "input": true }, { "label": "confidence", "hidden": true, "tableView": false, "clearOnHide": false, "key": "confidence", "type": "container", "input": true, "components": [ { "label": "mean", "applyMaskOn": "change", "mask": false, "tableView": false, "delimiter": false, "requireDecimal": false, "inputFormat": "plain", "truncateMultipleSpaces": false, "key": "mean", "type": "number", "input": true }, { "label": "min", "applyMaskOn": "change", "mask": false, "tableView": false, "delimiter": false, "requireDecimal": false, "inputFormat": "plain", "truncateMultipleSpaces": false, "key": "min", "type": "number", "input": true }, { "label": "max", "applyMaskOn": "change", "mask": false, "tableView": false, "delimiter": false, "requireDecimal": false, "inputFormat": "plain", "truncateMultipleSpaces": false, "key": "max", "type": "number", "input": true } ] }, { "label": "Guardar", "showValidations": false, "tableView": false, "key": "guardar", "type": "button", "saveOnEnter": false, "input": true } ] } ], "input": true, "key": "", "tableView": false, "label": "" };
        
        const folderId = '1nPq4q0zzSEmrqhyvq-0OeRGbL8wQk-zq';
        const driveId = '0AO5Il-tGgasrUk9PVA';

        const files = await listFiles( driveId, folderId);
        let fileObjects = [];
        let filefinal= 'false'

        for (const file of files) {

            const respuesta = await processPDF( file.id);
            const name_archivo = await transferirDesdeDriveAGCS(file.id, file.name); 

            if (respuesta[0]) {

                if (filefinal == 'true'){
                    const token = await authenticate1()
                    await createitem('6368149369782272', '4774097088151552', datos, token, fileObjects);
                    datos = null;
                    data = null;
                    fileObjects = [];
                    filefinal= 'false'
    
                }else{
                 console.log('continuamos') 
                }

                const data = await getInvoiceParsed(name_archivo, DEFAULT_SCHEMA);  

                if (datos === null) {
                    datos = await transformResponse(data, DEFAULT_SCHEMA);
                } else {
                    datos = await transformResponse2(data, datos, DEFAULT_SCHEMA);
                }

                const fileObject = {
                    "Groupname": "scan",
                    "Id": name_archivo,
                    "Filename": name_archivo,
                    "Type": "Scan"
                };
                fileObjects.push(fileObject);

                await moveFile(file.id,'1WhBC8jPgZDLNYfQxnRsnZBTvaRkh3SU7');
            } else {
                const token = await authenticate1()

                const fileObject = {
                    "Groupname": "scan",
                    "Id": name_archivo,
                    "Filename": name_archivo,
                    "Type": "Scan"
                };
                fileObjects.push(fileObject);

                await moveFile( file.id, '1WhBC8jPgZDLNYfQxnRsnZBTvaRkh3SU7');


                filefinal= 'true'
            }
        }

        if (filefinal == 'true'){
            const token = await authenticate1()
            await createitem('6368149369782272', '4774097088151552', datos, token, fileObjects);
            datos = null;
            data = null;
            fileObjects = [];
            filefinal= 'false'

        }else{
         console.log('continuamos') 
        }
    } catch (error) {
        console.error(error);
    }


}

/**
 * Transforms the response of the digitailizer
 * @param {*} resp 
 * @param {*} DEFAULT_SCHEMA 
 * @returns 
 */
async function transformResponse(resp, DEFAULT_SCHEMA) {
    const data = {
        ...resp.data.formFields
    };
    data.confidence = resp.data.confidence;

    for (const table of resp.data.tables) {
        const tableKey = await getKeyLabels(DEFAULT_SCHEMA.components);   
             if (tableKey != null) {

    
            data[tableKey] = table.values.map((row) => {
                const parsedRow = {};
                for (let i = 0; i < row.length; i++) {
                    const cell = row[i];
                    parsedRow[table.headers[i]] = cell;
                }

                return parsedRow;
            });
        }
    }

    return data;
}

/**
 * 
 * @param {*} fields 
 * @returns 
 */
function getKeyLabels(fields) {
    let keyLabels = {};

    for (const field of fields) {
        switch (field.type) {
            case FormioComponents.COLUMNS:
                for (const column of field.columns) {
                    const tmp = getKeyLabels(column.components);
                    keyLabels = {
                        ...keyLabels,
                        ...tmp
                    };
                }
                break;
            case FormioComponents.PANEL:
            case FormioComponents.DATAGRID:
            case FormioComponents.EDIT_GRID:
                const tmp = getKeyLabels(field.components);
                keyLabels = {
                    ...keyLabels,
                    ...tmp
                };
                break;
            default:
                keyLabels[field.key] = field.label;
                break;
        }
    }

    return keyLabels;
}


/**
 * Makes a list of the files in the drive folder to digitalize
 * @param {*} driveId 
 * @param {*} folderId 
 * @returns 
 */
async function listFiles(driveId, folderId) {
    try {
        const { google } = require('googleapis');
        const drive = google.drive('v3');
        const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: key.client_email,
            client_id: key.client_id,
            private_key: key.private_key,
        },
        scopes: [
            'https://www.googleapis.com/auth/drive',
        ],
        });
        const authClient = await auth.getClient();
        google.options({ auth: authClient });
        
        const res = await drive.files.list({
            q: `'${folderId}' in parents and trashed=false`,
            driveId,
            ...BASE_LIST_REQUEST
        });

        
        return res.data.files;
    } catch (error) {
        console.error('Error al listar archivos:', error.message);

        throw error;
    }
}

/**
 * Move files to the other drive folder of digitalized documents
 * @param {*} fileId 
 * @param {*} newFolderId 
 */
async function moveFile( fileId, newFolderId) {
    try {

        const { google } = require('googleapis');
        const drive = google.drive('v3');
        const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: key.client_email,
            client_id: key.client_id,
            private_key: key.private_key,
        },
        scopes: [
            'https://www.googleapis.com/auth/drive',
        ],
        });
        const authClient = await auth.getClient();
        google.options({ auth: authClient });
        await drive.files.update({
            fileId: fileId,
            addParents: [newFolderId],
            removeParents: ['1nPq4q0zzSEmrqhyvq-0OeRGbL8wQk-zq'],
            fields: 'id, name, mimeType, parents',
            supportsAllDrives: true
        });
    } catch (error) {
        console.error('Error al mover archivo:', error.message);
        throw error;
    }
}

/**
 * Transforms data and adds news rows to update de item
 * @param {*} resp 
 * @param {*} datos 
 * @param {*} DEFAULT_SCHEMA 
 * @returns 
 */
function transformResponse2(resp, datos,DEFAULT_SCHEMA) {
    const data = datos;

    for (const table of resp.data.tables) {
        const tableKey = getKeyLabels(DEFAULT_SCHEMA.components[0].components, table.headers);

        if (tableKey != null) {
            // Agregar nuevas filas a data usando el tableKey
            if (!data[tableKey]) {
                data[tableKey] = [];
            }

            data[tableKey] = data[tableKey].concat(table.values.map((row) => {
                const parsedRow = {};
                for (let i = 0; i < row.length; i++) {
                    const cell = row[i];
                    parsedRow[table.headers[i]] = cell;
                }

                return parsedRow;
            }));
        }
    }

    return data;
}



/**
 * Converts the pdf to a google doc to be able to read it
 * @param {*} pdfFileId 
 * @param {*} drive 
 * @returns 
 */
async function convertPDFToGoogleDoc(pdfFileId, drive) {
    try {
        const copyResponse = await drive.files.copy({
            fileId: pdfFileId,
            supportsAllDrives: true,
            requestBody: {
                mimeType: 'application/vnd.google-apps.document',
            },
        });

        const copiedFileId = copyResponse.data.id || copyResponse.data?.fileId;

        if (!copiedFileId) {
            throw new Error('Unable to retrieve the ID of the copied file.');
        }

        return copiedFileId;
    } catch (error) {
        console.error('Error converting PDF to Google Doc:', error.message);
        throw error;
    }
}



/**
 * Creates item
 * @param {*} schemaId 
 * @param {*} contractId 
 * @param {*} data 
 * @param {*} token 
 * @param {*} fileObjects 
 */
async function createitem (schemaId, contractId, data, token, fileObjects){
    const newItem = {}
    newItem.Records = data;
    newItem.System = {
        AssignedDate: "",
        AssignedTo: "",
        CreatedDate: new Date(),
        disabled: false,
        draft: false,
        Files:fileObjects,
        ModifiedDate: new Date(),
    }
    const body = { Schema_ID: schemaId, Data: newItem, Contract_ID: contractId };

try {
        const response = await axios.post(`${apiUrl}/saveFormAnswer`, 
             body,
            {
                headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Contract-Id': '4774097088151552',
                'Workspace-Id': 'astander',
                'Schema-Id': '6368149369782272',
            },
        });
    
        const result = await response.data.message;
        console.log(result)
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }  
}

async function getSchema() {
    const token = await authenticate1()

    try {
        const response = await axios.get(`${apiUrl}/schemas/6368149369782272`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'workspace-Id': 'astander',
                'Content-Type': 'application/json',
            }
        })

        return JSON.parse(response.data.FormSchema)
    } catch (error) {
        throw (error)
    }
}


/**
 * Process a single pdf
 */
async function processPDF(fileId){

    const { google } = require('googleapis');
        const drive = google.drive('v3');
        const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: key.client_email,
            client_id: key.client_id,
            private_key: key.private_key,
        },
        scopes: [
            'https://www.googleapis.com/auth/drive',
        ],
        });
        const authClient2 = await auth.getClient();
        google.options({ auth: authClient2 });
        
    fileDocId = await convertPDFToGoogleDoc(fileId, drive)
    startTerm = 'CARACTERÍSTICAS'
    finishTerm = 'ISOMÉTRICAS'
    start = await accessTextInGoogleDoc( fileDocId, startTerm )
    finish =await accessTextInGoogleDoc( fileDocId, finishTerm )

    return [start,finish]

}

/**
 * Read the text of the google doc
 * @param {*} googleDocId 
 * @param {*} searchTerm 
 * @returns 
 */
async function accessTextInGoogleDoc(googleDocId, searchTerm) {
    try {
        const { google } = require('googleapis');
        const drive = google.drive('v3');
        const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: key.client_email,
            client_id: key.client_id,
            private_key: key.private_key,
        },
        scopes: [
            'https://www.googleapis.com/auth/drive',
        ],
        });
        const authClient2 = await auth.getClient();
        google.options({ auth: authClient2 });
      const docs = google.docs({ version: 'v1', auth });
      const doc = await docs.documents.get({ documentId: googleDocId });
  
      // Access the text content
      const textContent = doc.data.body.content
        .map(paragraph => {
          if (paragraph.paragraph && paragraph.paragraph.elements) {
            return paragraph.paragraph.elements.map(element => element.textRun.content).join('');
          }
          return '';
        })
        .join('\n');
  
      console.log('Text Content:', textContent);
  
      const isSearchTermPresent = textContent.includes(searchTerm);
  
      console.log(`Search term '${searchTerm}' is present: ${isSearchTermPresent}`);
      
      return isSearchTermPresent;
    } catch (error) {
      console.error('Error accessing text in Google Doc:', error.message);
      throw error;
    }
  }

async function transferirDesdeDriveAGCS(fileId,filename) {
  try {
    const { google } = require('googleapis');
        const drive = google.drive('v3');
        const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: key.client_email,
            client_id: key.client_id,
            private_key: key.private_key,
        },
        scopes: [
            'https://www.googleapis.com/auth/drive',
        ],
        });
        const authClient2 = await auth.getClient();
        google.options({ auth: authClient2 });
   

    const auth3 = new google.auth.GoogleAuth({
        credentials: {
            client_email: key.client_email,
            client_id: key.client_id,
            private_key: key.private_key,
        },
        scopes: [
            'https://www.googleapis.com/auth/cloud-platform',
        ],
        });

    const storage = google.storage({
      version: 'v1',
      auth: auth3
    });

   
    const { data } = await drive.files.get(
        { fileId: fileId, alt: 'media' },
        { responseType: 'stream' }
      );

    const name_archivo=await createName(fileId,filename)

    await storage.objects.insert({
        bucket: bucketName,
        name: name_archivo,
        media: { body: data }
      });

    return name_archivo

  } catch (error) {
    console.error('Error al iniciar la transferencia:', error.message);
  }
};

/**
 * Name of the pdf
 * @param {*} fileId 
 * @param {*} filename 
 * @returns 
 */
async function createName (fileId , filename){
    const name= `astander_${Date.now()}_${filename}`
    return name
}

/**
 * Process the pdf in the digitailizer
 * @param {*} fileUri 
 * @param {*} fields 
 * @returns 
 */
async function getInvoiceParsed(fileUri, fields) {

    const token = await generateToken()

    const headers = {
        [AUTH_HEADER]: `${AUTH_PREFIX} ${token}`
    };
 

    const url = `${DIGITAILIZER_API}/${PROCESSOR_ENDPOINT}/form/astander/5709113312935936/cr9d5GU5pPZxcMlnSsDiPPmDtWH3?gcsUri=gs://origamee-qa-astander/${fileUri}&project=origamee-qa&EMPRESA=Empresa&fecha=Fecha&N0_PROYECTO=N%C2%BA%20Proyecto&BUQUE=Buque&nTarea=N%C2%BA%20Tarea&fiabilidad=Fiabilidad&numeroTuberia=N%C3%BAmero%20Tuberia&materiales=Materiales&diametros=Di%C3%A1metros&espesores=Espesores&servicioLinea=Servicio/L%C3%ADnea&tratamientos=Tratamientos&bridas=Bridas&tubos=Tubos&t=T&codos=Codos&mangon=Mangon&colada=Colada&cantidad=Cantidad&otros=Otros&documento=Adjuntar%20documento&confidence=confidence&guardar=Guardar`; 
//Falta que esta url pille los campos de forma automatica
    try {
        const response = await axios.get(url, {
            headers: headers
        });

        const responseData = await response.data;

        return responseData;
    } catch (error) {
        throw error;
    }
}


      
const FormioComponents = {
    ADDRESS: 'address',
    BUTTON: 'button',
    CHECKBOX: 'checkbox',
    COLUMNS: 'columns',
    CONTAINER: 'container',
    CONTENT: 'content',
    CURRENCY: 'currency',
    CUSTOM: 'custom',
    DATAGRID: 'datagrid',
    DATE_TIME: 'datetime',
    DATETIME: 'datetime',
    DAY: 'day',
    EDIT_GRID: 'editgrid',
    EMAIL: 'email',
    FIELDSET: 'fieldset',
    FILE: 'file',
    FORM: 'form',
    HIDDEN: 'hidden',
    HTML_ELEMENT: 'htmlelement',
    NUMBER: 'number',
    PANEL: 'panel',
    PASSWORD: 'password',
    PHONE_NUMBER: 'phoneNumber',
    RADIO: 'radio',
    RESOURCE: 'resource',
    SELECT: 'select',
    SELECT_BOXES: 'selectboxes',
    SIGNATURE: 'signature',
    SURVEY: 'survey',
    TABLE: 'table',
    TAGS: 'tags',
    TEXTAREA: 'textarea',
}

/**
 * Authenticate 
 * @param {*} audience 
 * @returns 
 */
async function generateToken(audience= DIGITAILIZER_API) {

    const token = await authenticate1()
    try{
        const response= await axios.get(`${apiUrl}/${TOKEN_ENDPOINT}?audience=${audience}`,{
        headers: {
            'Authorization': `Bearer ${token}`,
            'workspace-Id': 'astander',
        }
    })
        return response.data.data
    }catch(error){
        return error
    }

}


processPDFs()


//const SCHEMA= { "display": "form", "settings": { "pdf": { "id": "1ec0f8ee-6685-5d98-a847-26f67b67d6f0", "src": "https://files.form.io/pdf/5692b91fd1028f01000407e3/file/1ec0f8ee-6685-5d98-a847-26f67b67d6f0" } }, "components": [ { "title": "Parte de Trabajo", "theme": "primary", "collapsible": false, "key": "parteDeTrabajo", "type": "panel", "label": "Panel", "input": false, "tableView": false, "components": [ { "label": "Columns", "columns": [ { "components": [ { "label": "Empresa", "applyMaskOn": "change", "tableView": true, "validate": { "required": true }, "key": "EMPRESA", "type": "textfield", "input": true } ], "offset": 0, "push": 0, "pull": 0, "size": "md", "currentWidth": 6, "width": 6 }, { "components": [ { "label": "Fecha", "format": "dd-MM-yyyy", "tableView": false, "datePicker": { "disableWeekends": false, "disableWeekdays": false }, "enableTime": false, "timePicker": { "showMeridian": false }, "enableMinDateInput": false, "enableMaxDateInput": false, "key": "fecha", "type": "datetime", "input": true, "widget": { "type": "calendar", "displayInTimezone": "viewer", "locale": "en", "useLocaleSettings": false, "allowInput": true, "mode": "single", "enableTime": false, "noCalendar": false, "format": "dd-MM-yyyy", "hourIncrement": 1, "minuteIncrement": 1, "time_24hr": true, "minDate": null, "disableWeekends": false, "disableWeekdays": false, "maxDate": null } } ], "offset": 0, "push": 0, "pull": 0, "size": "md", "currentWidth": 6, "width": 6 } ], "autoAdjust": true, "key": "columns1", "type": "columns", "input": false, "tableView": false }, { "label": "Columns", "columns": [ { "components": [ { "label": "Nº Proyecto", "applyMaskOn": "change", "tableView": true, "validate": { "required": true }, "key": "N0_PROYECTO", "type": "textfield", "input": true } ], "width": 6, "offset": 0, "push": 0, "pull": 0, "size": "md", "currentWidth": 6 }, { "components": [ { "label": "Buque", "applyMaskOn": "change", "tableView": true, "validate": { "required": true }, "key": "BUQUE", "type": "textfield", "input": true } ], "width": 6, "offset": 0, "push": 0, "pull": 0, "size": "md", "currentWidth": 6 } ], "key": "columns", "type": "columns", "input": false, "tableView": false }, { "label": "Columns", "columns": [ { "components": [ { "label": "Nº Tarea", "applyMaskOn": "change", "tableView": true, "validate": { "required": true }, "key": "nTarea", "type": "textfield", "input": true } ], "width": 6, "offset": 0, "push": 0, "pull": 0, "size": "md", "currentWidth": 6 }, { "components": [ { "label": "Fiabilidad", "applyMaskOn": "change", "mask": false, "disabled": true, "tableView": false, "delimiter": false, "requireDecimal": false, "inputFormat": "plain", "truncateMultipleSpaces": false, "clearOnHide": false, "calculateValue": "value = Math.floor(data.confidence.mean * 100);", "key": "fiabilidad", "type": "number", "input": true } ], "width": 6, "offset": 0, "push": 0, "pull": 0, "size": "md", "currentWidth": 6 } ], "key": "columns2", "type": "columns", "input": false, "tableView": false }, { "title": "Lista Tuberías", "theme": "primary", "collapsible": false, "key": "listaTuberias", "type": "panel", "label": "Panel", "input": false, "tableView": false, "components": [ { "label": "Lista de Tuberias", "tableView": false, "addAnother": "Añadir", "saveRow": "Aceptar", "removeRow": "Cancelar", "rowDrafts": true, "key": "listaDeTuberias", "type": "editgrid", "displayAsTable": false, "input": true, "components": [ { "label": "Número Tuberia", "applyMaskOn": "change", "mask": false, "tableView": true, "delimiter": false, "requireDecimal": false, "inputFormat": "plain", "truncateMultipleSpaces": false, "key": "numeroTuberia", "type": "number", "input": true }, { "label": "Materiales", "applyMaskOn": "change", "tableView": true, "key": "materiales", "type": "textfield", "input": true }, { "label": "Diámetros", "applyMaskOn": "change", "mask": false, "tableView": true, "delimiter": false, "requireDecimal": false, "inputFormat": "plain", "truncateMultipleSpaces": false, "key": "diametros", "type": "number", "input": true }, { "label": "Espesores", "applyMaskOn": "change", "tableView": true, "key": "espesores", "type": "textfield", "input": true }, { "label": "Servicio/Línea", "applyMaskOn": "change", "tableView": true, "key": "servicioLinea", "type": "textfield", "input": true }, { "label": "Tratamientos", "applyMaskOn": "change", "tableView": true, "key": "tratamientos", "type": "textfield", "input": true }, { "label": "Columns", "columns": [ { "components": [ { "label": "Bridas", "tableView": false, "defaultValue": false, "key": "bridas", "conditional": { "show": true }, "type": "checkbox", "input": true } ], "offset": 0, "push": 0, "pull": 0, "size": "md", "currentWidth": 4, "width": 4 }, { "components": [ { "label": "Tubos", "tableView": false, "key": "tubos", "type": "checkbox", "input": true, "defaultValue": false } ], "offset": 0, "push": 0, "pull": 0, "size": "md", "currentWidth": 4, "width": 4 }, { "components": [ { "label": "T", "tableView": false, "defaultValue": false, "key": "t", "type": "checkbox", "input": true } ], "size": "md", "offset": 0, "push": 0, "pull": 0, "width": 4, "currentWidth": 4 } ], "key": "columns", "type": "columns", "input": false, "tableView": false }, { "label": "Columns", "columns": [ { "components": [ { "label": "Codos", "tableView": false, "key": "codos", "type": "checkbox", "input": true, "defaultValue": false } ], "offset": 0, "push": 0, "pull": 0, "size": "md", "currentWidth": 4, "width": 4 }, { "components": [ { "label": "Mangon", "tableView": false, "key": "mangon", "type": "checkbox", "input": true, "defaultValue": false } ], "offset": 0, "push": 0, "pull": 0, "size": "md", "currentWidth": 4, "width": 4 } ], "key": "columns1", "type": "columns", "input": false, "tableView": false }, { "label": "Colada", "applyMaskOn": "change", "mask": false, "tableView": false, "delimiter": false, "requireDecimal": false, "inputFormat": "plain", "truncateMultipleSpaces": false, "key": "colada", "type": "number", "input": true }, { "label": "Cantidad", "applyMaskOn": "change", "mask": false, "tableView": false, "delimiter": false, "requireDecimal": false, "inputFormat": "plain", "truncateMultipleSpaces": false, "key": "cantidad", "type": "number", "input": true }, { "label": "Otros", "applyMaskOn": "change", "tableView": false, "key": "otros", "type": "textfield", "input": true } ] } ] }, { "label": "Adjuntar documento", "storage": "FirebaseStorage", "tableView": false, "webcam": false, "capture": false, "fileTypes": [ { "label": "", "value": "" } ], "key": "documento", "type": "file", "input": true }, { "label": "confidence", "hidden": true, "tableView": false, "clearOnHide": false, "key": "confidence", "type": "container", "input": true, "components": [ { "label": "mean", "applyMaskOn": "change", "mask": false, "tableView": false, "delimiter": false, "requireDecimal": false, "inputFormat": "plain", "truncateMultipleSpaces": false, "key": "mean", "type": "number", "input": true }, { "label": "min", "applyMaskOn": "change", "mask": false, "tableView": false, "delimiter": false, "requireDecimal": false, "inputFormat": "plain", "truncateMultipleSpaces": false, "key": "min", "type": "number", "input": true }, { "label": "max", "applyMaskOn": "change", "mask": false, "tableView": false, "delimiter": false, "requireDecimal": false, "inputFormat": "plain", "truncateMultipleSpaces": false, "key": "max", "type": "number", "input": true } ] }, { "label": "Guardar", "showValidations": false, "tableView": false, "key": "guardar", "type": "button", "saveOnEnter": false, "input": true } ] } ], "input": true, "key": "", "tableView": false, "label": "" }

/*function getKeyLabels(fields) {
    let keyLabels = {};

    for (const field of fields) {
        switch (field.type) {
            case FormioComponents.COLUMNS:
                for (const column of field.columns) {
                    const tmp = getKeyLabels(column.components);
                    keyLabels = {
                        ...keyLabels,
                        ...tmp
                    };
                }
                break;
            case FormioComponents.PANEL:
            case FormioComponents.DATAGRID:
            case FormioComponents.EDIT_GRID:
                const tmp = getKeyLabels(field.components);
                keyLabels = {
                    ...keyLabels,
                    ...tmp
                };
                break;
            default:
                keyLabels[field.key] = field.label;
                break;
        }
    }

    return keyLabels;
}
*/

    /*function generateToken(audience = DIGITAILIZER_API) {
    return new Promise((resolve, reject) => {
        const url = `${apiUrl}/${TOKEN_ENDPOINT}?audience=${audience}`;

        http.get(url, (response) => {
            let data = '';

            response.on('data', (chunk) => {
                data += chunk;
            });

            response.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    resolve(result.data);
                } catch (error) {
                    reject(error);
                }
            });
        }).on('error', (error) => {
            reject(error);
        });
    });
}
    TEXTFIELD: 'textfield',
    TIME: 'time',
    WELL: 'well'
};*/


/*async function fetchData() {
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('Error:', error);
  }
}


/*
const res = await drive.files.get({
    fileId: pdfFileId,
    supportsAllDrives: true,
});

*/


/*

var fileObjects = [];
var fileObject = {
    "Groupname": "scan",
    "Id": file.name,
    "Filename": file.name,
    "Type": "Scan"
};
fileObjects.push(fileObject);

*/

/*async function authenticate_google(){
    client = new OAuth2Client(
        key.client_email,
        null,
        key.private_key,
        SCOPES,
        )

    token=await client.authorize()
    const jwtToken = token.access_token;

    return jwtToken
}*/

/*async function getSchema() {
    const token = await authenticate1()

    try {
        const response = await axios.get(`${apiUrl}/schemas/6368149369782272`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'workspace-Id': 'astander',
                'Content-Type': 'application/json',
            }
        })

        return JSON.parse(response.data.FormSchema)
    } catch (error) {
        throw (error)
    }
}*/