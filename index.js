const app = require('./app');
const chalk = require('chalk');

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(chalk.green.inverse('Server Running on port ' + port));
});
