// this script is used to init a elastic search index
const es = require('../services/es_service');
const logger = require('../utils/loggers/logger');

const {
  createEsIndex,
  updateEsTypeMapping,
} = es;

// create Es Index && update type mapping
async function createElasticSearchIndex() {
  await createEsIndex();
  await updateEsTypeMapping();
}


switch (process.argv[2]) {
  case "init_es_index":
    createElasticSearchIndex()
      .then(() => {
        console.log("es index is successfully initialized");
      })
      .catch(
        e => {
          logger("error", "error during init es index: %s",
            err.message, {stack: err.stack},
          );
        },
      );
    break;

  default:
    console.log('unrecognized command');
    process.exit(0);
}
