const express = require('express');
const app = express();
const pool = require('./db');
// 查询用户列表
app.get('/', async (req, res) => {
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
});

app.use(express.urlencoded({ extended: true })); // extended: true 解析复杂对象
app.use(express.json());
// 添加用户信息
app.post('/user/add',async (req, res) => {
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
});

// 修改用户信息
app.post('/user/edit', async (req, res) => {
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
})

// 删除用户信息
app.delete('/user/delete', async (req, res) => {
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
})
app.listen(3000, () => {
  console.log('Server is running on port 3000 http://localhost:3000');
});