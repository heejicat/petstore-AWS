const AWS = require('aws-sdk')
const validator = require('./validator')

AWS.config.update({ region: 'us-east-1' });
  
const dynamo = new AWS.DynamoDB.DocumentClient();

const petTable = 'pet-dev'
const orderTable = 'order'

    // create pet image
async function createImage (req, res) {
    try {
        // validation 
        const result = await validator.validate(validator.schemas.idSchema, req.fields)
        
        // DB update
        const params = {
            TableName: petTable,
            Key: { id: parseInt(req.fields.petId) },
            UpdateExpression: 'ADD #photoUrls :file',
            ConditionExpression: 'attribute_exists(id)',
            ExpressionAttributeNames: { "#photoUrls": "photoUrls" },
            ExpressionAttributeValues: {':file': dynamo.createSet([req.fields.file])},
            returnValues: 'UPDATED_NEW'
        }

        dynamo.update(params, (err, data) => {
            if(err) {
                res.err = 405
                res.json({error: err.code == "ConditionalCheckFailedException"? "No pet found" : err, data: req.fields})
            } else{
                res.json({success: 'post call succeed!', url: req.url, data: req.fields})
            }
        });
    } catch(err) {
        res.status(405).json( {error : err.details[0].message})
    }
}

async function createPet (req, res) {
    // res.send("ok")
    try {
        // validation 
        let result = await validator.validate(validator.schemas.idSchema, req.fields)
            
        // save in db
        let params = {
            TableName: petTable,
            Key: { id: parseInt(req.fields.petId) },
            UpdateExpression: 'ADD #photoUrls :file',
            ConditionExpression: 'attribute_exists(id)',
            ExpressionAttributeNames: { "#photoUrls": "photoUrls" },
            ExpressionAttributeValues: {':file': dynamo.createSet([req.fields.file])},
            returnValues: 'UPDATED_NEW'
        }

        dynamo.put(params, (err, data) => {
            if(err) {
                res.err = 405
                res.json({error: err.code == "ConditionalCheckFailedException"? "No pet found" : err, data: req.fields})
            } else{
                res.json({success: 'post call succeed!', url: req.url, data: data})
            }
        });
    } catch(err) {
        res.status(405).json( {error : err.details[0].message})
    }
}

    // Update existing pet
async function updatePet (req, res) {
    try {
        // validation 
        const result = await validator.validate(validator.schemas.petSchema, req.body)
            
        // param for db
        const params = {
            TableName: petTable,
            Item: req.body,
            ConditionExpression: 'attribute_exists(id)'
        }

        // Save pet in the database
        dynamo.update(params, (err, data) => {
            if(err) {
                res.err = 405;
                res.json({error: err.code == "ConditionalCheckFailedException"? "No pet found" : err, url: req.url, body: req.fields});
            } else{
                res.json({success: 'put call succeed!', url: req.url, result: data})
            }
        });
    } catch(err) {
        res.status(405).json( {error : err.details[0].message})
    }
}

    // Retrieve pets by status
function findPetsByStatus (req, res) {
    const status = req.query
    const statusKeys = status.status.map(status => '{\'status\' : \'' + status +'\'}')
    const params = {
        RequestItem: {
            petTable: {
                Keys : statusKeys  // key not working.
            }
        }
    }
    dynamo.batchGet(params, (err, data) => {
        if(err) {
            res.statusCode = 500;
            res.json({error: err, url: req.url, body: params});
        } else{
            res.json({success: 'get call succeed!', url: req.url, data: params})
        }
    });
}

    // validating number
function isNumber (a) {
        return a === ""+~~a || /^\d+$/.test(a)
}
    
    // Retrieve a pet
function findPet (req, res) {
    // parameter value number validation
    if(!isNumber(req.params.id)) {
        res.status(405).json({url: req.url, msg: "Invalid ID supplied"});
    } else {
        const params = {
            TableName: petTable,
            Key: {
                id: parseInt(req.params.id)
            }
        }
        // get pet from the database
        dynamo.get(params, (err, data) => {
            if(err) {
                res.json({error: err, url: req.url, body: data});
            } else if(!Object.keys(data).length) {
                res.status(404).json({msg : "Pet not found"})
            } else {
                console.log(data)
                res.json({success: 'get call succeed!', url: req.url, data: data})
            }
        });
    }
}

    // Update a pet status
async function updatePetStatus (req, res) {
    try {
        // validating values
        const result = await validator.validate(validator.schemas.petSchema, req.fields)
                
        // update db
        const params = {
            TableName: petTable,
            Key: { id: parseInt(req.fields.petId) },
            UpdateExpression: `set #name = :name, #status = :status`,
            ConditionExpression: 'attribute_exists(id)',
            ExpressionAttributeNames: {
                "#name": "name",
                "#status": "status"
            },
            ExpressionAttributeValues: {
                ':name': req.fields.name,
                ':status': req.fields.status
            },
            returnValues: 'UPDATE_NEW'
        }

        dynamo.update(params, (err, data) => {
            if(err) {
                res.err = 405;
                res.json({error: err.code == "ConditionalCheckFailedException"? "No pet found" : err, url: req.url, body: req.fields});
            } else{
                res.json({success: 'update call succeed!', url: req.url, data: data})
            }
        });
    } catch(err) {
        res.status(405).json( {error : err.details[0].message})
    }
}

    // Delete a pet
function deletePet (req, res) {
    const params = {
        TableName: petTable,
        Key: { id: parseInt(req.params.id) }
    }

    dynamo.delete(params, (err, data) => {
        if(err) {
            res.status(500).json({error: err, url: req.url, body: data})
        } else{
            res.json({success: 'delete call succeed!', url: req.url, data: data})
        }
    })
}

    // Retrieve store inventory
    // function findStoreInventory (req, res) {
    //     var params = {
    //         TableName: petTable,
    //         Select:'COUNT'
    //     };
    //      // res.json({success: 'delete call succeed!', url: req.url, data: params})
    //     dynamo.query(params, (err, data) => {
    //         if(err) {
    //             res.statusCode = 500;
    //             res.json({error: err, url: req.url, body: data})
    //         } else{
    //             res.json({success: 'delete call succeed!', url: req.url, data: data})
    //         }
    //     })
    // }


    // Create an order
async function createOrder (req, res) {
    try {
        // validation schema
        const result = await validator.validate(validator.schemas.orderSchema, req.body)

        const params = {
            TableName: orderTable,
            Item: req.body
        }

        // Save pet in the database
        dynamo.put(params, (err, data) => {
            if(err) {
                res.status.status(405).json({error: err, url: req.url, body: data});
            } else{
                res.json({success: 'post call succeed!', url: req.url, data: data})
            }
        });
    } catch (err) {
        res.status(405).json( {error : err.details[0].message})
    }
}

    // Retrieve store order
async function findOrder (req, res) {
    if(this.isNumber(req.params.orderId)) {
        const params = {
            TableName: orderTable,
            Key: {
                id: parseInt(req.params.orderId)
            }
        }
        // get pet from the database
        dynamo.get(params, (err, data) => {
            if(err) {
                res.statusCode = 500;
                res.json({error: err, url: req.url, body: data});
            } else{
                res.json({success: 'get call succeed!', url: req.url, data: data})
            }
        });
    } else {
        res.status(405).json({url: req.url, msg: "Invalid ID supplied"});
    }
}

    // Delete an order
function deleteOrder (req, res) {
    if(isNumber(req.params.orderId)) {
        // delete from db
        const params = {
            TableName: orderTable,
            Key: {
                id: parseInt(req.params.orderId)
            }
        }
        dynamo.delete(params), (err, data) => {
            if(err) {
                res.statusCode = 500;
                res.json({error: err, url: req.url, body: data})
            } else{
                res.json({success: 'delete call succeed!', url: req.url, data: data})
            }
        }
    } else {
        res.status(405).json({url: req.url, msg: "Invalid ID supplied"});
    }
}

module.exports = {
    createImage,
    createPet,
    updatePet,
    findPetsByStatus,
    findPet,
    updatePetStatus,
    deletePet,
    // findStoreInventory,
    createOrder,
    findOrder,
    deleteOrder
}