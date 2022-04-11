# KCHSL Billing Application

A template that can be used to build Desktop applications for a society or a community. 

## Build Instructions
> You would need node.js and electron for this project `npm i electron -g`

* Clone the repo and zip the folder
* Install the node modules using the command `npm install`
* To run the project in a debug mode, use `npm start`
> To build the app, install electron-builder using `npm install -g electron-builder`
* Once installed, run this command to extract the installers (you can extract both .exe and .dmg files in this step): `npm run dist`


## Features fo non-admin users

1.   Entire Member list
        Completed. Displaying a table with:   
        * Member Number	
        * Plot	
        * Plot Type	
        * Name	
        * Phone	
        * Yearly 
        * Bill expiry
2.   Add a member
        Completed. Integrated bill with installation charges as well.
3.   Search a member
        Completed. Added button for Search Bill ID
4.   Generate bill
        Completed.
5.   Generate reports
        Completed Monthly.
6.   Check ownership transfer
        Completed.
7.   Update member phone number
        Completed.
8.   Send SMS to defaulters
        NA

## Additional features for admin users

1.   Change ownership
2.   Update member details 
3.   Delete a member
4.   **Configurations**
    *   Set bill amount per month
    *   Enable/Disable deposits
    *   Deposit amount
    *   Late fee amount

## Each Member data parameters
1.  Plot
2.  Full name
3.  Member number
4.  Phone 
5.  Type
6.  LastPaid
7.  Expiry
8.  Deposit

## Bills Generated data parameters
1.  Unique Bill ID
2.  Member number
3.  Date Generated
4.  Paid for (months)

