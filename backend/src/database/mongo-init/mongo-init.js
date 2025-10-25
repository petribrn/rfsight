db = db.getSiblingDB('admin');

db.auth(process.env.MONGO_INITDB_ROOT_USERNAME, process.env.MONGO_INITDB_ROOT_PASSWORD);

db = db.getSiblingDB('rfsight');

db.createUser({
'user': 'dbAdmin',
'pwd': '.Lock.DBMgAdmin',
'roles': [{
    'role': 'dbOwner',
    'db': 'rfsight'}]});

db.createCollection("users")
db.createCollection("devices")
db.createCollection("configurations")
db.createCollection("profiles")
db.createCollection("networks")
db.createCollection("organizations")
