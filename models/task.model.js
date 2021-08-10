const mongoose = require('mongoose');
const { taskSchema } = require('./schema');

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
