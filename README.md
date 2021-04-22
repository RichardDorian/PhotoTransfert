> :warning: **The readme file is not fully written!**

# PhotoTransfert
NodeJS app made under 2 days by a cool guy (me) 

What PhotoTransfert is ?
-------------------
Photo Transfert is a Node JS application whose goal is to transfer your photos from OneDrive to Google Photos

In what situation could I use this program ?
-------------------
Let's take an example, you paid every months a OneDrive subscription to benefit from 1TB of storage. You and your family decide that all the photos taken with your mobile phones / tablets will automatically be uploaded to OneDrive. Obviously, there are duplicate photos, duds, so you decide to sort all of those photos and move them to a specific folder on OneDrive. After this, you want the rest of your family to be able to see these photos. You therefore choose to create a photo album on Google Photos. And that's where my program comes in, it will automatically move all the content of the specific folder to OneDrive and then upload it to an album on Google Photos. With a small scheduled task, your family can benefit from all your photos

Setup process
------------------
* OneDrive connection (Authorizarion)
  * Creating the app on Microsoft Azure

      To create a new App, you have to go on the [Azure App registrations page](https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade)
      
      When prompted, sign in with your account credentials
      
      Find **My applications** and click **Add an app**
      
      Enter your app's name and click **Create application**
      
  * Get all the informations from the Azure App page to fill the config file
      
      Go on the **Overview** tab and copy the `Appliclation (Client) ID` and paste the ClientID in the config under `ClientId` in the OneDriveAuth part of the file.
      
      After we need to add a redirct uri to our Azure App, to do this navigate to the **Authentication** tab and click on the **Add a platform** button, after click on **Web**. In the first text field we are going to enter the redirect uri, wich is : 
      ```
      https://localhost:<PORT>/oneDriveAuthCode
      ```
      <PORT> -> Replace <PORT> by the port you set for the listener in the config (Default is 37793)
  
      And finally click on the **Configure** button
      
      Now you have to, like the ClientID, set the value in the config
  
      After adding the redirect uri, we need to generate a client secret by going to the **Certificates & secrets** tab. Click on **New client secret** button, set a description if you want and set expires date and finally click on **Add**.
      Now, add the client secret in the config file and you are for the first step !
  
  
  
  
