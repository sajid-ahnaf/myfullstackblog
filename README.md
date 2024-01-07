# 👋 Hello developer!

This project serves as an example of what can be achieved. It is not a fully functional product. Feel free to use the source code and ideas as a starting point for your own projects.

This is one of the many templates available from W3Schools. Check our [tutorials for frontend development](https://www.w3schools.com/where_to_start.asp) to learn the basics of [HTML](https://www.w3schools.com/html/default.asp), [CSS](https://www.w3schools.com/css/default.asp) and [JavaScript](https://www.w3schools.com/js/default.asp). 🦄


## Knowledge requirements

To be able to fully understand and modify this template to your needs, there are several things you should know (or learn):

- [HTML](https://www.w3schools.com/html/default.asp)
- [CSS](https://www.w3schools.com/css/default.asp)
- [JavaScript](https://www.w3schools.com/js/default.asp)
- [Node.js](https://www.w3schools.com/nodejs/default.asp)
- [Express.js](https://expressjs.com/)
- [Handlebars](https://handlebarsjs.com/)
- [SQLite](https://www.sqlite.org/docs.html)
- [Google reCAPTCHA v3](https://developers.google.com/recaptcha/docs/v3)
- CK EDITOR 5:
  - [Basic Quick Start](https://ckeditor.com/docs/ckeditor5/latest/installation/getting-started/quick-start.html)
  - [Setting up webpack config](https://ckeditor.com/docs/ckeditor5/latest/installation/getting-started/quick-start-other.html#introduction)

## Warning - environment variables

Do not change SQLITE_DB and COOKIE_SECRET, as these are generated. If they are changed the space may not behave as predicted.
  
## 🔨 What's next?

Customize this template to make it your own.  
Remember to make your layout responsive - if you want your site to look good on smaller screens like mobile.

## 🎨 Where to find everything?

This template is made by using several technologies.  
Below are explanations about where to find specific code.

Public resources are found in the folder `public`.

Data is stored in your admin console.

### HTML

HTML files are stored in a folder called `views`. Files have `.hbs` extension, indicating it is a [Handlebars](https://handlebarsjs.com/) file.
In the file `views/layouts/index.hbs` you can add your external links and scripts, or change other meaningful things that are relevant on every page.
Other relevant `.hbs` files are inside the folder `/views`

### CSS and Images

Images and CSS file can be found in the folder `public`.  
Icons and default images are stored in the folder `public/img`.  
`public/style.css` file is where you can find the whole CSS code of this template.
`public/editor.css` is where you can find the CSS code for the text editor.

### JavaScript

The main frontend JavaScript file - `public/js/script.js`.
You can find the configuration for the text editor in the root folder called `ckeditor-config.mjs`.
When the project was set up the script `npm run build` was run. This created three files, `bundle.js`, `bundle.js.LICENSE.txt` and `bundle.js.map`. These have to be re-built whenever you make changes to the `ckeditor-config.mjs`. To rebuild run `npm run build`.

### API

The Express.js APIs you can find in the `app.js` file that is in the root folder.
API routes are methods that make communication between the database and the frontend possible.

### Database

Dynamic spaces can use [SQLite](https://www.sqlite.org/docs.html) database.  
The database file is called `database.db`. It is placed inside the `w3s-dynamic-storage` folder.  
SQLite connection path to the database is `w3s-dynamic-storage/database.db` which you can use to connect to the SQLite database programmatically.   
For this template, the database connection path can also be found in the environment. 
Database creation and queries can be found in `service/sqlite-service.js`.

---  
**Do not change the `w3s-dynamic-storage` folder name or `database.db` file name!**  
**By changing the `w3s-dynamic-storage` folder name or `database.db` file name, you risk the space not working properly.**


## Google reCAPTCHA v3

In order to make use of this template, it is necessary to generate your own SITE key and SECRET key for Google reCAPTCHA and integrate them into the template.

To do so, it is recommended to first familiarize yourself with the [Google reCAPTCHA v3 documentation](https://developers.google.com/recaptcha/docs/v3). 
Next, access the [Google reCAPTCHA admin site](https://www.google.com/recaptcha/admin). Here, you may be prompted to log in if you have not done so previously.

#### Label

The label serves as a name or alias for your set of keys.

#### reCAPTCHA Type

Choose "reCAPTCHA v3" from the options. This version is considered to be the most current and effective.

#### Domains

Enter your website domain, for example: `your-space-id.w3spaces.com`.

#### Form Submission

Read and accept the reCAPTCHA Terms of Service and submit the form.  
Once the form is submitted, you should be able to view your set of keys, which should then be added to your project.

#### Key Integration

Access the settings by clicking on the gear icon in the upper right corner. 
**Please note:** These settings may not be available on mobile devices. To access them, it is recommended to enable desktop mode in your browser settings.
- In the Environment tab, update the values for `RECAPTCHA_SECRET_KEY` and `RECAPTCHA_SITE_KEY`.
- Open `script.js` file and add site key as the value of the `recaptchaSiteKey` variable. It should be on line 1.
   - Look for this: `const recaptchaSiteKey = "YOUR_RECATPCHA_SITE_KEY";`.

If you wish to deactivate reCAPTCHA for any reason you are free to do so. You will need to change some code in app.js and script.js as well as removing the script tags in the HTML files.

## **NOTE**

You will need to run the `npm run build` command to create new bundle files for CKEditor if you edit `ckeditor-config.mjs` to get the changes into effect.

## Enter in administration

Administration login is hidden from the users.  
Route to the administrator mode login can be found in your environment variables under `LOGIN_ROUTE_PATH`.
Example: `https://your-space.w3spaces.com/LOGIN_ROUTE_PATH`

## Custom administration scripts:
- `admin:createuser`
  - This creates an admin account. There are no limits to number of accounts.

- `admin:changeuserpassword`
  - This changes the password of an admin account.

- `admin:deleteuser`
  - This deletes an admin account.

To run any of these scripts, type in the terminal `npm run SCRIPT_NAME`

## 🔨 Please note
For now files created/uploaded or edited from within the terminal view will not be backed up or synced. 

## ⛑ Need support?
[Join our Discord community](https://discord.gg/6Z7UaRbUQM) and ask questions in the **#spaces-general** channel to get your space on the next level.  
[Send us a ticket](https://support.w3schools.com/hc/en-gb) if you have any technical issues with Spaces.

Happy coding!