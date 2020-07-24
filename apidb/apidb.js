const DynamoDB = require('aws-sdk/clients/dynamodb');

const AWS_REGION = 'ap-northeast-2';
const TABLE_NAME = 'TizenFX_API_Members';
const INDEX_NAME = 'Category-DocId-index';

class APIDB {
  query(category) {
    return new Promise((resolve, reject) => {
      const client = new DynamoDB.DocumentClient({
        region: AWS_REGION,
      });
      const params = {
        TableName: TABLE_NAME,
        IndexName: INDEX_NAME,
        KeyConditionExpression: 'Category = :category',
        ExpressionAttributeValues: {
          ':category': category,
        },
      };

      const items = [];
      const onQuery = function(err, data) {
        if (err) {
          reject(new Error('Unable to query:', JSON.stringify(err, null, 2)));
        } else {
          items.push(...data.Items);
          if (typeof data.LastEvaluatedKey != 'undefined' ) {
            params.ExclusiveStartKey = data.LastEvaluatedKey;
            client.query(params, onQuery);
          } else {
            resolve(items);
          }
        }
      };
      client.query(params, onQuery);
    });
  }

  put(category, items) {
    return new Promise((resolve, reject) => {
      const client = new DynamoDB.DocumentClient({
        region: AWS_REGION,
      });
      let count = 0;
      const itemKeys = Object.keys(items);
      const total = itemKeys.length;
      itemKeys.forEach((docId) => {
        client.put({
          TableName: TABLE_NAME,
          Item: {
            DocId: docId,
            Category: category,
            Info: items[docId],
          },
        }, (err, data) => {
          if (err) {
            reject(err);
          }
          if (data) {
            count++;
            console.log(`[PUT] (${count}/${total}) ${docId}`);
            if (count == total) {
              resolve();
            }
          }
        });
      });
    });
  }

  delete(category, keys) {
    return new Promise((resolve, reject) => {
      const client = new DynamoDB.DocumentClient({
        region: AWS_REGION,
      });
      let count = 0;
      for (const docId of keys) {
        client.delete({
          TableName: TABLE_NAME,
          Key: {
            DocId: docId,
            Category: category,
          },
        }, (err, data) => {
          if (err) {
            reject(err);
          }
          if (data) {
            count++;
            console.log(`[DEL] (${count}/${keys.size}) ${docId}`);
            if (count == keys.size) {
              resolve();
            }
          }
        });
      }
    });
  }

  compare(oldJson, newJson) {
    const oldItems = {};
    oldJson.forEach((i) => oldItems[i['DocId']] = i['Info']);

    const newItems = {};
    newJson.forEach((i) => newItems[i['DocId']] = i['Info']);

    const oldKeys = new Set(Object.keys(oldItems));
    const newKeys = new Set(Object.keys(newItems));

    const interKeys = _intersection(oldKeys, newKeys);
    const addedKeys = _difference(newKeys, interKeys);
    const removedKeys = _difference(oldKeys, interKeys);
    const changedKeys = new Set();
    interKeys.forEach((i) => {
      const oldinfo =
        JSON.stringify(oldItems[i], Object.keys(oldItems[i]).sort());
      const newinfo =
        JSON.stringify(newItems[i], Object.keys(newItems[i]).sort());
      if (oldinfo !== newinfo) {
        changedKeys.add(i);
      }
    });

    const addedPublicKeys = new Set();
    const removedPublicKeys = new Set();
    const changedPublicKeys = new Set();
    const addedInternalKeys = new Set();
    const removedInternalKeys = new Set();
    const changedInternalKeys = new Set();

    addedKeys.forEach((i) => {
      if (newItems[i].IsHidden) {
        addedInternalKeys.add(i);
      } else {
        addedPublicKeys.add(i);
      }
    });

    removedKeys.forEach((i) => {
      if (oldItems[i].IsHidden) {
        removedInternalKeys.add(i);
      } else {
        removedPublicKeys.add(i);
      }
    });

    changedKeys.forEach((i) => {
      if (oldItems[i].IsHidden && newItems[i].IsHidden) {
        changedInternalKeys.add(i);
      } else if (!oldItems[i].IsHidden && !newItems[i].IsHidden) {
        changedPublicKeys.add(i);
      } else if (oldItems[i].IsHidden) {
        removedInternalKeys.add(i);
        addedPublicKeys.add(i);
      } else if (newItems[i].IsHidden) {
        addedInternalKeys.add(i);
        removedPublicKeys.add(i);
      }
    });

    const totalChanged = addedKeys.size + removedKeys.size + changedKeys.size;
    const publicChanged = addedPublicKeys.size + removedPublicKeys.size +
                          changedPublicKeys.size;
    const internalChanged = addedInternalKeys.size + removedInternalKeys.size +
                            changedInternalKeys.size;

    return {
      oldItems,
      newItems,
      addedKeys,
      addedPublicKeys,
      addedInternalKeys,
      removedKeys,
      removedPublicKeys,
      removedInternalKeys,
      changedKeys,
      changedPublicKeys,
      changedInternalKeys,
      totalChanged,
      publicChanged,
      internalChanged,
    };
  }
}

function _intersection(setA, setB) {
  const intersection = new Set();
  for (const elem of setB) {
    if (setA.has(elem)) {
      intersection.add(elem);
    }
  }
  return intersection;
}

function _difference(setA, setB) {
  const difference = new Set(setA);
  for (const elem of setB) {
    difference.delete(elem);
  }
  return difference;
}

module.exports.APIDB = APIDB;
