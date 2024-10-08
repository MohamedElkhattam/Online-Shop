const {Sequelize} = require('sequelize');
const sequelize = new Sequelize('node-complete' , 'root' , 'MohamedKhaled@4' ,{dialect:'mysql',host:'localhost'})

module.exports = sequelize;