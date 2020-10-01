# Tumble Crawler App:
Tumblr Crawler in Javascript

This application is used to get the authenticating user's details and the blogs, likes he follows and hence doing some analytics on the obtained data.

1. To start the application, open a command prompt inside the directory server.
2. To run the application in normal mode, navigate to server directory and run the command "node app.js" or "node app" in Command Prompt Window
3. If the program does not startup or gives an error about any missing modules, or if any modules cannot be found, to install the required node modules, run "npm install" in server directory (Pre-requisite: Working Internet Connection and Administrator Access) OR extract the "node_modules.tar" present in the directory server (File Name: node_modules.tar, command to extract to current directory: "tar -xvf node_modules.tar"). 
4. The program logs can be found out in the directory server/Tumblr-Crawler-Logs
5. The final output logs can be found out in the directory server/Tumblr-Crawler-Final-Output-Log

Way to just perform analytics on the sample data provided:
1. Restore the mongodb sample data provided using the command mentioned later in this file.
2. The name of the database in the file server/model/config.js has to be the same as the one provided while extracting the database
2. Start the program.

Software Requirements:
1. Node.js Version: v8.12.0
2. NPM Version: 6.4.1
3. MongoDB Version: v4.0.3

Command to export mongodb data to bson and json files:
1. mongodump --db <db name> --out <path to backup>
2. Taken from the link: https://stackoverflow.com/questions/11255630/how-to-export-all-collection-in-mongodb
3. Example Command: mongodump --db sampleData --out D:\MongoDB-Backup

Guide to restore and backup mongodb:
1. mongorestore -d <sample_db_name_it_can_be_any_name_other_than_the_folder_name_of_original_db> <directory_having_backup_files_like_json_and_bson>
2. Example: mongorestore -d sampleData D:\MongoDB-Backup
3. The other detailed information about how to perform restore: https://docs.mongodb.com/manual/tutorial/backup-and-restore-tools/
