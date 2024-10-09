const {Sequelize} = require('sequelize');
const sequelize = new Sequelize('node-complete' , 'root' , <MyPassword> ,{dialect:'mysql',host:'localhost'})

module.exports = sequelize;
