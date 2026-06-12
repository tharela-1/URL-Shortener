# URL-Shortener

To implement a website to shorten a URL that is very long and use it for a short period of time so that it would be easier to send it and use it.

Front End: HTML, CSS, JS  
Back End: Node.js  
Database Used: MongoDB Atlas  
Deployment: This website is deployed on Railway.  
Deployment URL: https://url-shortener-production-a1b4.up.railway.app/  

Project Timeline: Jun 7, 2026 - Jun 12, 2026 (For building the project)  

# Features:
1. URLs that are given by user are shortened by this website.
2. Users can enter a custom TTL of a maximum of 7 days 23 hrs 59 mins 59 secs i.e., 691199 seconds.
3. There is a feedback page through which the users can end their valuable feedback to the developer.
4. There is a feature to collect analytics - number of shortened URLs generated, number of times each shortened URL is used (deleted when the record expires), total number of times all the URLs are accessed.
5. Maximum length of the entered URL that can be shortened into is 1000 characters.
6. Maximum length of a feedback that the user can send in one time is 1000 characters.
7. Both server-side length and TTL validation and client-side length and TTL validation are present to prevent client-side bypass of input limits.
8. A minimum TTL of 30 seconds is given to the generated URL, even if the user enters a TTL value less than that to give a meaningful lifecycle for the generated URL.
9. There is a dedicated help page, where users can see how to use this website, privacy policy, terms of service and the license terms of it.
10. There is a 404 - Page Not Found page as well.

# Versions:
*Ver 1.0.0*: It is the basic version of the project that contains all the above features. 
