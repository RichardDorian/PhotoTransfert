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

init();

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
    console.info("There are " + files.length + " files");
    files.forEach(file => {
        downloadOneDriveFiles(file.id, file.name);
    });
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
    setTimeout(() => {
        uploadToGooglePhotos(fileName, fileId);
    }, 1500);
}

/** Uploading data to Google Photos */

async function uploadToGooglePhotos(fileName, fileId) {
    let uploadToken = await photos.transport.upload(fileName, __dirname + "/downloads/" + fileName, 45000);
    let upload = await photos.mediaItems.albumBatchCreate(googlePhotos.albumId, fileName, "Automatic upload", uploadToken)
    console.info("File " + fileName +" uploaded");
    deleteFile(fileName, fileId);
}

/** Deleting file from hard drive */

function deleteFile(fileName, fileId) {
    fs.unlinkSync(__dirname + "/downloads/" + fileName);
    console.info("File " + fileName + " deleted (Hard drive)");
    if(config.application.deletingFilesOnOneDriveAfterMoving) {
        deleteFileOnOneDrive(fileName, fileId);
    }
}

/** Deleting OneDrive Content (Optional) */

async function deleteFileOnOneDrive(fileName, fileId) {
    await oneDriveAPI.items.delete({
        accessToken: oneDrive.accessToken,
        itemId: fileId
    })
    console.info("File " + fileName + " deleted (OneDrive)");
}