# Payment Web - BACKEND

Payment Web is an aplication that aims to make it easy for user to do online payment. In backend part, Payment Web provide API to integrate it to [frontend Payment Web aplication](https://github.com/aridwi27/AFA-Pay-FE). API provide include Users and Transaction. We use MySQL as Database with two table in it. 

## Getting Started

This Instruction will guide you to run this aplication

### Dependencies

We use all this main following dependencies:

1. Express
2. Body-parser
3. Multer
4. Bcrypt
5. Jsonwebtoken
6. CORS

### Database
We provide database with two tables:
1. Users
2. Transactions

![Database Scheme](https://i.ibb.co/FDCQSt4/database-scheme.png)

### Installing

Here is few step to run the server of Payment Web:

1. Import MySQL database that named payment.sql provided in this repository
2. Open your terminal and head to your project directory
3. Clone this repository
```
git clone https://github.com/aridwi27/AFA-Pay-BE.git
``` 
4. Use this command to install all dependencies
```
npm install
```
5. You can install nodemon for easier development (optional)
 * local
```
npm install nodemon
```
 * global
```
npm install -g nodemon
```
6. Run the server
 * With nodemon installed
```
nodemon
```
 * Without nodemon
```
node index.js
```

## Documentation
[Postman publication](https://documenter.getpostman.com/view/13708259/TWDdhsko) 

## Team
You can visit our team account

1. [Aridwi](https://github.com/aridwi27)
2. [Ferdy](https://github.com/cotbakheu)
3. [Alif](https://github.com/alifma)
