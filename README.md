Deployed Website using Render: https://benjamins-web-forum-frontend.onrender.com/

Full READme : https://drive.google.com/file/d/1VpusQwrFfQp-3BZ49uJf8fCc-ZvVr3SY/view?usp=sharing

Project Scope
My website Benjamin’s Web Forum provides users a simple, easy-to-understand platform for sharing and discussing ideas. It provides users with the ability to sign in, create, comment on, and search for various discussions made by other users of the forum. Users can also update or delete their posts or comments at any time.


Target Users:
The target users of this website are anyone looking to have a discussion online. The website provides a platform for people to communicate with others. Users could make use of this to ask for or provide help to others, or in any other case, just learn more through the facilitation of discussion on the website.


Trying it for yourself
Prerequisites:
1.	Node.js and npm must be installed. Click here
2.	Go must be installed. Click here

Steps
1.	Download the source code from above, and extract the .zip file. Alternatively, clone my repository.

2.	The root directory of my project should be “webforum-1.0”. This directory will have a .gitignore file, a README.md file, a “backend” folder, and a “frontend” folder.

3.	Navigate to the “frontend” folder. In the terminal, run the command “npm install”. Next, create a file named “.env”. Open it and add the line as follows:

NEXT_PUBLIC_API_URL=http://localhost:3001

4.	Navigate to the “backend” folder. In the terminal, run the command “go mod tidy”. Next, in the terminal, run the following command, and copy down the output:

node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

Next, create a file named “.env”. Open it and add the line as follows:

JWT_SECRET=”whatever you copied from the output above, with the quotes”
ALLOWED ORIGINS=’http://localhost:3000’
PORT=3001


5.	Now we are ready to run start. Note: you may need 2 terminal windows for this. In the “backend” folder, run the command as follows:

go run cmd/server/main.go

If a text “Foreign keys are enabled” appears in the terminal, ignore it. It is okay.
In the “frontend” folder, run the command as follows:

npm run dev

If there are no issues, you can click on the ‘http://localhost:3000’, or go into the browser and enter ‘http://localhost:3000’ to access the application.
