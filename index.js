const oneDriveAPI = require('onedrive-api');
const Photos = require('googlephotos');
const fs = require('fs');
const { once } = require('events');

const config = require('./config.json');

const oneDrive = config.oneDrive;
const googlePhotos = config.googlePhotos;

const photos = new Photos(googlePhotos.authToken);

if(oneDrive.accessToken == "" || oneDrive.accessToken == null) {
    console.error("You have to run the One Drive authentication process before running the main script");
    process.exit(0);
}
if(googlePhotos.authToken == "" || googlePhotos.authToken == null) {
    console.error("You have to run the Google Api authentication process before running the main script");
    process.exit(0);
}

if(config.application.tryToRecoverUnuploadedFiles) {
    checkUnuploadedFiles();
} else {
    init();
}

async function init() {
    let files = [];
    await oneDriveAPI.items.listChildren({
        accessToken: oneDrive.accessToken,
        itemId: oneDrive.folderId
    }).then((childrens) => {
        childrens.value.forEach(file => {
            files.push({
                id: file.id,
                name: file.name
            });
        });
    })
    console.info("There are " + files.length + " files in your OneDrive folder");
    files.forEach(file => {
        downloadOneDriveFiles(file.id, file.name);
    });
}

function checkUnuploadedFiles() {
    console.info("Checking if files were not uploaded last time...");
    let fileNameList = [];
    let filesNumber = 0;
    fs.readdirSync(__dirname + "/downloads/").forEach(file => {
        if(!file.endsWith('recovery.json')) {
            filesNumber++;
            fileNameList.push(file);
        }
    });
    if(filesNumber == 0) {
        console.info("Perfect ! Last time, every files were uploaded");
    } else {
        console.info("Last time, " + filesNumber + " file(s) was/were not uploaded");
        fileNameList.forEach(element => {
            uploadToGooglePhotos(element);
        });
    }

    init();
    
}

/** Downloading data from OneDrive */

async function downloadOneDriveFiles(fileId, fileName) {
    let stream = fs.createWriteStream(__dirname + "/downloads/" + fileName);
    let fileStream = oneDriveAPI.items.download({
        accessToken: oneDrive.accessToken,
        itemId: fileId
    });
    fileStream.pipe(stream);
    await once(fileStream, "end");
    console.info("File " + fileName + " downloaded");
    addFileToUploadList(fileName);
    setTimeout(() => {
        uploadToGooglePhotos(fileName, fileId);
    }, 1500);
}

/** Uploading data to Google Photos */

async function uploadToGooglePhotos(fileName, fileId = NaN) {

    if(getUploadList().contains(fileName)) {
        try {
            let uploadToken = await photos.transport.upload(fileName, __dirname + "/downloads/" + fileName, config.application.maxUploadingTime * 1000);
            let upload = await photos.mediaItems.albumBatchCreate(googlePhotos.albumId, fileName, "Automatic upload", uploadToken)
            console.info("File " + fileName +" uploaded");
            deleteFile(fileName, fileId);
            removeFileFromUploadList(fileName);
        } catch (error) {
            console.info("File " + fileName + " was not uploaded (Time out, try increasing the maxUploadingTime value in the config)");
            if(!config.application.tryToRecoverUnuploadedFiles) {
                removeFileFromUploadList(fileName);
                console.warn("File can't be upload next time as \"tryToRecoverUnuploadedFiles\" feature is disabled");
            }
        }
    } else {
        console.info("File " + fileName + " is not on the upload list, file can't be uploaded");
    }

}

/** Deleting file from hard drive */

function deleteFile(fileName, fileId = NaN) {
    fs.unlinkSync(__dirname + "/downloads/" + fileName);
    console.info("File " + fileName + " deleted (Hard drive)");
    if(config.application.deletingFilesOnOneDriveAfterMoving) {
        deleteFileOnOneDrive(fileName, fileId);
    }
}

/** Deleting OneDrive Content (Optional) */

async function deleteFileOnOneDrive(fileName, fileId = NaN) {
    if(fileId != NaN) {
        await oneDriveAPI.items.delete({
            accessToken: oneDrive.accessToken,
            itemId: fileId
        })
        console.info("File " + fileName + " deleted (OneDrive)");
    } else {
        console.warn("File " + fileName + " can't be deleted (OneDrive) because no fileId is provided (probably because this file was not successfully uploaded last time)");
    }
}

/** Recover function */

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
 
const adapterA = new FileSync(__dirname + "/downloads/recovery.json");
const adapter = low(adapterA);

adapter.defaults = {"uploadList": []}

function getUploadList() {
    return adapter.get(`uploadList`);
}

function addFileToUploadList(fileName) {
    let list = getUploadList();
    list.push(fileName);
    adapter.set(`uploadList`, list);
}

function removeFileFromUploadList(fileName) {
    let list = getUploadList();
    list.remove(fileName);
    adapter.set(`uploadList`, list);
}