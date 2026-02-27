const { User } = require('../models');
const md5 = require('../utils/md5'); // 引入 md5 加密函数
const { Op } = require('sequelize'); // 引入 Sequelize 的 Op 操作符
const {generateToken, verifyToken } = require('../utils/jwt'); // 引入 JWT 相关函数


// 用户登录
async function login(req, res) {
  try {
    const { account, password } = req.body;// account 可以是用户名、邮箱或手机号
    if(!account || !password) {
      return res.status(200).json({ 
        code: 1,
        message: '账号或密码不能为空'
      });
    }
    // 根据账号查找用户，这里使用了 Op.or 来匹配用户名、邮箱或手机号
    const user = await User.findOne({ where: { 
      [Op.or]: [
        { username: account },
        { email: account },
        { phone: account }
      ],
      password: md5(password) // 使用 md5 加密密码进行匹配
    } 
    });
    if (!user) {
      return res.status(200).json({ 
        code: 1,
        message: '账号或密码错误'
      });
    }
    // 生成 JWT token
    const token = generateToken({ id: user.id, username: user.username });
    res.send({
      code: 0,
      message: '登录成功',
      data: token
    })
  } catch (err) {
    res.status(500).json({ error: err });
  }
}

// 用户登出
async function logout(req, res) {
    res.send({
      code: 0,
      message: '登出成功'
    });
}

// 用户注册
async function register(req, res) {
  try {
        const { name, username, password,email,phone,age } = req.body;
        const newUser = await User.create({ name, username, password,email,phone,age });
        res.status(200).json({code: 0, message: '注册成功', data: {id: newUser.id} });
    } catch (err) {
        res.status(500).json({ error: err });
    }
}

// 查询用户列表
async function getUserList(req, res) {
  try {
    // 分页查询
    const pageNum = parseInt(req.query.pageNum) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    if (isNaN(pageNum) || isNaN(pageSize) || pageNum < 1 || pageSize < 1) {
        return res.status(400).json({ error: '无效的分页参数' });
    }
    const offset = (pageNum - 1) * pageSize;
    const { count, rows } = await User.findAndCountAll({
      offset,
      order: [['created_at', 'DESC']],
      limit: pageSize,
      attributes: ['id', 'name', 'username','email', 'age','phone','created_at', 'updated_at'] // 只返回需要的字段
    });
    res.send({
      code: 0,
      list: rows,
      total: count,
      currentPage: pageNum,
      message: '查询成功'
    });
  } catch (err) {
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
    const [updatedRowsCount] = await User.update(updateData, { where: { id } });
    if (updatedRowsCount === 0) {
      return res.status(404).json({ error: '用户不存在或未修改任何字段' });
    }
    const updatedUser = await User.findByPk(id); // 重新查询以获取更新后的数据
    if(!updatedUser){
      res.status(404).json({ error: '用户不存在' });
    }else{
      res.send({
        code: 0,
        data: updatedUser.id,
        message: '修改成功'
      })  
    }
  }catch(err){
    res.status(500).json({ error: err });
  }
}

// 删除用户信息
async function deleteUser(req, res) {
  try {
      const { id } = req.params;
      const deletedRowsCount = await User.destroy({ where: { id } });
      if (deletedRowsCount === 0) {
          return res.status(404).json({ error: '用户不存在' });
      }
      res.json({ code: 0, message: '删除成功', data: { id } });
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
}

// 根据id查询用户信息
async function getUserById(req, res) {
  try {
      const { id } = req.params;
      const user = await User.findByPk(id,{
        attributes: { exclude: ['password'] } // 排除密码字段
      });
      if (!user) {
          return res.status(404).json({ error: '用户不存在' });
      }
      res.json({ code: 0, data: user, message: '查询成功' });
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
}


module.exports = {
  register,
  getUserList,
  editUser,
  deleteUser,
  getUserById,
  login,
  logout
}