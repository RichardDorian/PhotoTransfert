> :warning: **The readme file is not fully written!**

# PhotoTransfert
NodeJS app made under 3 days by a cool guy (me) 

What PhotoTransfert is ?
-------------------
Photo Transfert is a Node JS application whose goal is to transfer your photos from OneDrive to Google Photos

In what situation could I use this program ?
-------------------
Let's take an example, you paid every months a OneDrive subscription to benefit from 1TB of storage. You and your family decide that all the photos taken with your mobile phones / tablets will automatically be uploaded to OneDrive. Obviously, there are duplicate photos, duds, so you decide to sort all of those photos and move them to a specific folder on OneDrive. After this, you want the rest of your family to be able to see these photos. You therefore choose to create a photo album on Google Photos. And that's where my program comes in, it will automatically move all the content of a specific folder in OneDrive and then upload it to an album on Google Photos. With a small scheduled task, your family can benefit from all your photos

Requirements :
------------------
You should have on your machine :
* NodeJS v14.xx
* Git 2.x

Setup process
------------------

First of all, if you prefer a video [here is one](#video-tutorial)
* Install dependances
  Open command prompt for Windows or a terminal for Linux and run this command to install all the packages
  ```
  npm install
  ```
* Configure the app<br><br>
      Open the config with a text editor like Notepad++ or Sublime Text<br>
      Set the port for the listener by editing the value of `listenerPort` under `application` part<br>
      Change value of `deletingFilesOnOneDriveAfterMoving` if you want your photos deleted on OneDrive after uploading to Google Photos (:warning: I am not responsible if the wrong files are deleted)<br>
      You can change the upload tiemout (in seconds) by changing the value of `maxUploadingTime`<br><br>
* OneDrive connection (Authorization)<br><br>
  * Creating the app on Microsoft Azure<br><br>
      To create a new App, you have to go on the [Azure App registrations page](https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade)<br>
      When prompted, sign in with your account credentials<br>
      Find **My applications** and click **Add an app**<br>
      Enter your app's name and click **Create application**<br><br>
  * Get and set all the informations from the Azure App page to fill the config file<br><br>
      Go on the **Overview** tab and copy the `Appliclation (Client) ID` and paste the **ClientID** in the config under `ClientId` in the `OneDriveAuth` part of the file.<br>
      After we need to add a redirct uri to our Azure App, to do this navigate to the **Authentication** tab and click on the **Add a platform** button, after click on **Web**. In the first text field we are going to enter the redirect uri, wich is : 
      ```
      https://<LOCAL_IP_ADDDRESS>:<PORT>/oneDriveAuthCode
      ```
      -> Replace \<PORT> by the port you set for the listener in the config (Default is 37793)
      And finally click on the **Configure** button
      Now you have to set `redirectUri` (under `OneDriveAuth` part) value in the config file<br>
      After adding the redirect uri, we need to generate a client secret by going to the **Certificates & secrets** tab. Click on **New client secret** button, set a description if you want and set expires date and finally click on **Add**
      Now, in the config file, paste the **Client Secret** under `clientSecret` in the `OneDriveAuth` part<br>
      The last thing you need to do in Azure, it's to change one value in the **Manifest**, open the **Manifest** tab and scroll down until you see `signInAudience` and change the value to this :
      ```json
      "signInAudience": "AzureADandPersonalMicrosoftAccount"
      ```
  * Run the script to set up the authentication<br><br>
      To run the script you just have to open a command prompt for Windows or a terminal for Linux. After this run this command to setup OneDrive :
      ```
      npm run onedrive-authenticate
      ```
      In the console, if everythig is setup correctly, you should get a link like this one :
      ```
      https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=YOUR_CLIENT_ID&scope=files.readwrite.all&response_type=code&redirect_uri=https://localhost:37793/oneDriveAuthCode
      ```
      Open the link, authorize the application and you are done with the script<br><br>
  * Set the folder ID in the config<br><br>
      Put the ID of the folder in which your photos are in the config under `folderId` in the `oneDrive` part<br>
      You can get the folder ID by going to OneDrive through a web browser, when you are in, get the **URL** and copy the value of `id` and replace `%21` by a `!` and you should get something like this :
      ```
      xxxxxxxxxxxxxxx!xxx
      ```
* Google connection (Authorization)<br><br>
  * Set the album name<br><br>
    In the config file, you have to set the Album name, this will be the album in which all the photos will be uploaded
    To change this just set the value of `albumName` in the config under `googlePhotos` part<br><br>
  * Creating the app on Google Cloud Console<br><br>
    Open the [Google Cloud console](https://console.cloud.google.com/projectcreate) new project page<br>
    When prompted, sign in with your account credentials<br>
    Enter your project's name and click **Create**<br><br>
  * Get and set all the informations from Google Cloud Console page to fill the config file<br><br>
    Click on the **Menu** button (Hamburger button) on click on **Dashboard** under **API & Services** tab. Click on **+ Create Credentials** button and select **OAuth clientId**
    In **Application type** select **Web application**, set a name if you want or leave by default. Click on **+ Add URI** button in **Authorized redirect URIs** part, in the text field we are going to enter the redirect uri, wich is :
    ```
    https://thiswebsitedoesnotrealyexist.com:<PORT>/googleAuthCode
    ```
    -> Replace \<PORT> by the port you set for the listener in the config (Default is 37793)
    Set the `RedirectURI` in the config file in `redirectUri` under `googleApi` part<br>
    :warning: **As Google only accept domains names you have to change your Windows HOST file to make `https://thiswebsitedoesnotrealyexist.com` point at the local ip address of your machine**<br>
    Now click on **Create** and after a card will show you your `Client ID` and your `Client Secret`
    Copy those values and paste the `Client ID` in `clientId` under `googleApi` part and paste `Client Secret` in `clientSecret` under `googleApi` part<br>
    Naviguate to the **Library** tab and in the search bar type `Photos` and the first result should be `Photos Library API`, click on it and after click on **Enable**<br><br>
  * Create the OAuth consent screen<br><br>
    Naviguate to the **OAuth consent screen** tab<br>
    Select **External** and click **Create**<br>
    In **App name** write anything you want, `PhotoTransfert` for example
    In **User support email**, select your email<br>
    And scroll down until you see **Developer contact information**
    Write your email address and click **Save and continue**<br>
    Scroll down, and click again on **Save and continue**<br>
    Now, click on **+ Add users** and write your Google account email address and click on **Add** and finaly click on **Save and continue** and click on **Back to dashboard**<br><br>
  * Run the script to set up the authentication<br><br>
    To run the script you just have to open a command prompt for Windows or a terminal for Linux. After this run this command to setup GooglePhotos :
    ```
    npm run google-authenticate
    ```
    In the console, if everythig is setup correctly, you should get a link
    Open the link, authorize the application and you are done with the script<br><br>

Transfer process
------------------
If everything is set up correctly to transfer all your photos, open a command prompt for Windows or a terminal for Linux and run this command :
```
npm run transfert
```
Now the transfer start and when the script ends, you will be able to admire your photos on Google Photos in the Album created by the script

Video tutorial
------------------
Here is a video by me if you prefer :

***Coming soon...***

PS :
------------------
I'm really sorry if you can spot any spelling or grammar mistakes because I am French ^^
