const fs = require('fs');
const {promisify} = require('util');
// 异步读取文件内容
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const {failBack} = require('../utils/backBody');
const getAllImpList = async (prop) => {
  try {
    const result=  await readFile('./mockData/annualDisclosureData.json', 'utf8')
    const fileData = JSON.parse(result);
    return fileData[prop] || [];
  } catch (err) {
    throw err;
  }
}

const writeJson = async (key,value) => {
  const allJson = await readFile('./mockData/annualDisclosureData.json', 'utf8');
  const fileData = JSON.parse(allJson);
  fileData[key] = value;
  await writeFile('./mockData/annualDisclosureData.json', JSON.stringify(fileData, null, 2));
}

// 获取实施机构列表
async function getImpList(req, res) {
  try {
    // 分页查询
    const pageNum = parseInt(req.query.pageNum) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    if (isNaN(pageNum) || isNaN(pageSize) || pageNum < 1 || pageSize < 1) {
        return failBack(res,{message:'无效的分页参数'});
    }
    const offset = (pageNum - 1) * pageSize;
    const limit = pageSize;
    // 分页查询
    const impList=  await getAllImpList('impList');
    const data = impList.slice(offset, offset + limit);
    res.send({
      data:{
        list: data,
        total: impList.length
      }
    })
  } catch (err) {
    console.log(err);
    failBack(res,err);
  }
}
// 添加实施机构
async function addImp(req, res) {
  try {
    const {authorizedOperations,implementOrgName,authorizedDataName} = req.body;
    const impList=  await getAllImpList('impList');
    authorizedOperations.forEach(item=>{
      impList.push({
        id: new Date().getTime().toString(),
        implementOrgName,
        authorizedDataName,
        operatorName: item.authorizedOperationName,
        authorizedStartTime: item.operationTerm[0],
        authorizedEndTime: item.operationTerm[1],
        createTime: '2026-03-05 00:00:00',
        updateTime: new Date().getTime(),
      })
    })
    await writeJson('impList',impList);
    res.send({
      data: true
    })
  } catch (err) {
    failBack(res,err);
  }
}

// 删除实施机构
async function deleteImp(req, res) {
  try {
    const {id} = req.params;
    const impList=  await getAllImpList('impList');
    const newList = impList.filter(item => item.id !== id.toString());
    await writeJson('impList',newList);
    res.send({
      data: true
    })
  } catch (err) {
    failBack(res,err);
  }
}

// 获取操作机构列表
async function getOptList(req, res) {
  try {
    // 分页查询
    const pageNum = parseInt(req.query.pageNum) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    if (isNaN(pageNum) || isNaN(pageSize) || pageNum < 1 || pageSize < 1) {
        return failBack(res,{message:'无效的分页参数'});
    }
    const offset = (pageNum - 1) * pageSize;
    const limit = pageSize;
    // 分页查询
    const optList=  await getAllImpList('optList');
    const data = optList.slice(offset, offset + limit);
    res.send({
      data:{
        list: data,
        total: optList.length
      }
    })
  } catch (err) {
    failBack(res,err);
  }
}

// 添加操作机构
async function addOpt(req, res) {
  try {
    const {operatorName,productName,productServiceWay,registerConfirmNo} = req.body;
    const optList=  await getAllImpList('optList');
    optList.push({
      id: new Date().getTime().toString(),
      operatorName,
      productName,
      registerConfirmNo,
      productServiceWay,
      createTime: "2026-03-05 00:00:00",
      updateTime: "2026-03-05 00:00:00"
    })
    await writeJson('optList',optList);
    res.send({
      data: true
    })
  } catch (err) {
    failBack(res,err);
  }
}
// 删除操作机构
async function deleteOpt(req, res) {
  try {
    const {id} = req.params;
    const optList=  await getAllImpList('optList');
    const newList = optList.filter(item => item.id !== id.toString());
    await writeJson('optList',newList);
    res.send({
      data: true
    })
  } catch (err) {
    failBack(res,err);
  }
}



module.exports = {
  getImpList,
  addImp,
  deleteImp,
  getOptList,
  addOpt,
  deleteOpt
}