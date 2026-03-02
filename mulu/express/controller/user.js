const { User } = require('../models');
const md5 = require('../utils/md5'); // 引入 md5 加密函数
const { Op } = require('sequelize'); // 引入 Sequelize 的 Op 操作符
const { generateToken } = require('../utils/jwt'); // 引入 JWT 相关函数
const {Cash} = require('../models');
const failBack = require('../utils/failBack');
// 用户登录
async function login(req, res) {
  try {
    const { account, password } = req.body;// account 可以是用户名、邮箱或手机号
    if(!account || !password) {
      return failBack(res,{message:'账号或密码不能为空'})
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
      return failBack(res,{message:'账号或密码错误'})
    }
    // 生成 JWT token
    const tokenVersion = new Date().getTime()
    const token = await generateToken({ 
      id: user.id, 
      username: user.username,
      email: user.email,
      phone: user.phone,
      tokenVersion
    });
    // 将id 为 1 的cash 设置为当前的用户的cash
    const cash = await Cash.findOne({ where: { id: 1 } });
    if (cash) {
      await cash.update({ tokenVersion });
    } else {
      // 如果不存在，则创建一个新的
      await Cash.create({ tokenVersion });
    }
    res.send({
      code: 0,
      msg: '登录成功',
      data: token
    })
  } catch (err) {
    failBack(res,err);
  }
}

// 用户登出
async function logout(req, res) {
    res.send({
      code: 0,
      msg: '登出成功'
    });
}

// 用户注册
async function register(req, res) {
  try {
    const { name, username, password,email,phone,age,avator } = req.body;
    const newUser = await User.create({ name, username, password,email,phone,age,avator });
    res.status(200).json({code: 0, message: '注册成功', data: {id: newUser.id} });
  } catch (err) {
    failBack(res,err);
  }
}

// 查询用户列表
async function getUserList(req, res) {
  try {
    // 分页查询
    const pageNum = parseInt(req.query.pageNum) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    if (isNaN(pageNum) || isNaN(pageSize) || pageNum < 1 || pageSize < 1) {
        return failBack(res,{message:'无效的分页参数'});
    }
    const offset = (pageNum - 1) * pageSize;
    const { count, rows } = await User.findAndCountAll({
      offset,
      order: [['created_at', 'DESC']],
      limit: pageSize,
      attributes: {exclude: ['password']} // 查询时排除密码字段
    });
    res.send({
      code: 0,
      list: rows,
      total: count,
      currentPage: pageNum,
      message: '查询成功'
    });
  } catch (err) {
    failBack(res,err);
  }
}

// 编辑用户信息
async function editUser(req, res) {
 const body = req.body;
  if(!body || !body.id){
    return failBack(res,{message:'缺少用户ID'});
  }
  try{
    const {id, ...updateData} = body;
    const [updatedRowsCount] = await User.update(updateData, { where: { id } });
    if (updatedRowsCount === 0) {
      return failBack(res,{message:'用户不存在或未修改任何字段'});
    }
    const updatedUser = await User.findByPk(id); // 重新查询以获取更新后的数据
    if(!updatedUser){
      return failBack(res,{message:'用户不存在'});
    }else{
      res.send({
        code: 0,
        data: updatedUser.id,
        msg: '修改成功'
      })  
    }
  }catch(err){
    failBack(res,err);
  }
}

// 删除用户信息
async function deleteUser(req, res) {
  try {
      const { id } = req.params;
      const deletedRowsCount = await User.destroy({ where: { id } });
      if (deletedRowsCount === 0) {
          return failBack(res,{message:'用户不存在'});
      }
      res.json({ code: 0, msg: '删除成功', data: { id } });
  } catch (err) {
      failBack(res,err);
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
        return failBack(res,{message:'用户不存在'});
      }
      res.json({ code: 0, data: user, msg: '查询成功' });
  } catch (err) {
      failBack(res,err);
  }
}

// 修改个人信息
async function updateProfile(req, res) {
  try {
      const userId = req.user.id;
      const { ...updateInfo } = req.body;
      const [updatedRowsCount] = await User.update(updateInfo, { where: { id: userId } });
      if (updatedRowsCount === 0) {
          return failBack(res,{message:'用户不存在或未修改任何字段'});
      }
      const updatedUser = await User.findByPk(userId, {
        attributes: { exclude: ['password'] } // 排除密码字段
      });
      res.json({ code: 0, data: updatedUser, msg: '请求成功' });
  } catch (err) {
      failBack(res,err);
  }
}

// 导出所有控制器函数
module.exports = {
  register,
  getUserList,
  editUser,
  deleteUser,
  getUserById,
  login,
  logout,
  updateProfile
}