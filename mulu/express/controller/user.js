const pool = require('../db');

// 查询用户列表
async function getUserList(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM user');
    res.send({
      code: 0,
      data: rows,
      message: '查询成功'
    });
  } catch (err) {
    res.status(500).json({ error: err });
  }
}
// 添加用户信息
async function addUser(req, res) {
  const body = req.body;
  if(!body){
    res.status(400).json({ error: '缺少用户信息' });
  }
  try{
    const [{insertId}] = await pool.query('INSERT INTO user SET ?', body);
    res.send({
      code: 0,
      data: insertId,
      message: '添加成功'
    });
  }catch(err){
    res.status(500).json({ error: err });
  }
}
// 修改用户信息
async function editUser(req, res) {
 const body = req.body;
  if(!body || !body.id){
    res.status(400).json({ error: '缺少用户ID' });
  }
  try{
    const {id, ...updateData} = body;
    await pool.query('UPDATE user SET ? WHERE id = ?', [updateData, id]);
    res.send({
      code: 0,
      message: '修改成功'
    });
  }catch(err){
    res.status(500).json({ error: err });
  }
}

// 删除用户信息
async function deleteUser(req, res) {
  const query = req.query;
  if(!query || !query.id){
    res.status(400).json({ error: '缺少用户ID' });
  }
  try{
    await pool.query('DELETE FROM user WHERE id = ?', [query.id]);
    res.send({
      code: 0,
      message: '删除成功'
    });
  }catch(err){
    res.status(500).json({ error: err });
  }
}
// 根据id查询用户信息
async function getUserById(req, res) {
  const { id } = req.params;
  try{
    const [rows] = await pool.query('SELECT * FROM user WHERE id = ?', [id]);
    if(rows.length === 0){
      res.status(404).json({ error: '用户不存在' });
    }
    res.send({
      code: 0,
      data: rows[0],
      message: '查询成功'
    });
  }catch(err){
    res.status(500).json({ error: err });
  }
}


exports.getUserList = getUserList;
exports.addUser = addUser;
exports.editUser = editUser;
exports.deleteUser = deleteUser;
exports.getUserById = getUserById;