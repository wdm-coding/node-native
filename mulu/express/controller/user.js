const { User,Subscribe,Cash,UserCert } = require('../models');
const md5 = require('../utils/md5'); // 引入 md5 加密函数
const { Op } = require('sequelize'); // 引入 Sequelize 的 Op 操作符
const { generateToken } = require('../utils/jwt'); // 引入 JWT 相关函数
const {failBack,successBack} = require('../utils/backBody');
const { parseP12FromFile  } = require('../utils/cert');
const forge = require('node-forge');
const { signUserCertificate } = require('../config/ssl');
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
    // 将userId 为 user.id 的cash 设置为当前的用户的cash
    const cash = await Cash.findOne({ where: { userId: user.id } });
    if (cash) {
      await cash.update({ tokenVersion });
    } else {
      // 如果不存在，则创建一个新的
      await Cash.create({ tokenVersion, userId: user.id });
    }
    res.send({
      code: 0,
      msg: '登录成功',
      data: "Bearer " + token
    })
  } catch (err) {
    failBack(res,err);
  }
}
// 获取用户信息
async function getUserInfo(req, res) {
  try {
    const user = await User.findByPk(req.user.id,{
      attributes: {exclude: ['password']}
    });
    if (!user) {
      return failBack(res,{message:'用户不存在'});
    }
    successBack(res,user);
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
    successBack(res,{id: newUser.id});
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
      // 关联查询证书表
      include: [{
        model: UserCert,
        as: 'cert',
        attributes: ['userId']
      }],
      attributes: {exclude: ['password']}  // 查询时排除密码字段
    });
    res.send({
      code: 0,
      list: rows.map(user => ({
        ...user.toJSON(),
        cert: !!user.cert
      })),
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
        return failBack(res,{message:'用户不存在3'});
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

// 用户订阅
async function subscribe(req, res) {
  try {
      const userId = req.user.id;
      const { userId: subscribeUserId } = req.params;
      // 检查subscribeUserId是否存在
      const subscribeUser = await User.findByPk(subscribeUserId);
      if (!subscribeUser) {
          return failBack(res,{message:'关注的用户不存在'});
      }
      // 检查是否是自己订阅自己
      if (userId === subscribeUserId) {
          return failBack(res,{message:'不能订阅自己'});
      }
      // 检查是否已经订阅
      const existingSubscription = await Subscribe.findOne({ where: { userId, subscribeUserId } });
      if (existingSubscription) {
          return failBack(res,{message:'已订阅'});
      }
      // 创建新的订阅记录
      const newRow = await Subscribe.create({ userId, subscribeUserId });
      if (!newRow) {
          return failBack(res,{message:'订阅失败'});
      }
      // 更新订阅计数
      await User.increment('subscribeCount', { where: { id: userId } });
      // 更新被订阅用户的粉丝计数
      await User.increment('fansCount', { where: { id: subscribeUserId } });
      successBack(res,newRow);
  } catch (err) {
      failBack(res,err);
  }
}

// 用户取消订阅
async function unsubscribe(req, res) {
  try {
      const userId = req.user.id;
      const { userId: subscribeUserId } = req.params;
      // 检查subscribeUserId是否存在
      const subscribeUser = await User.findByPk(subscribeUserId);
      if (!subscribeUser) {
          return failBack(res,{message:'关注的用户不存在'});
      }
      // 检查是否是自己订阅自己
      if (userId === subscribeUserId) {
          return failBack(res,{message:'不能取消关注自己'});
      }
      // 检查是否已经订阅
      const existingSubscription = await Subscribe.findOne({ where: { userId, subscribeUserId } });
      if (!existingSubscription) {
          return failBack(res,{message:'未关注此用户，无需取消关注'});
      }
      // 删除订阅记录
      await Subscribe.destroy({ where: { id: existingSubscription.id } });
      // 更新订阅计数
      await User.decrement('subscribeCount', { where: { id: userId } });
      // 更新被订阅用户的粉丝计数
      await User.decrement('fansCount', { where: { id: subscribeUserId } });
      successBack(res,null);
  } catch (err) {
      failBack(res,err);
  }
}

// 获取频道信息
async function getChannel(req, res) {
  let isSubscribe = false;
  try {
      if(req.user){
        // 检查是否已经订阅
        const isSub = await Subscribe.findOne({ where: { subscribeUserId:req.params.userId,userId: req.user.id} })
        if(isSub){
          isSubscribe = true;
        }
      }
      // 查询频道信息
      const currentUser = await User.findByPk(req.params.userId,{
        attributes: ["id","name","cover","channeldes",'avator']
      });
      if (!currentUser) {
          return failBack(res,{message:'用户不存在'});
      }
      currentUser.dataValues.isSubscribe = isSubscribe;
      successBack(res, {...currentUser.dataValues });
  } catch (err) {
      failBack(res,err);
  }
}

// 获取关注的用户列表
async function getSubscribes(req, res) {
  try{
    // 查询订阅列表
    const subscribeList = await Subscribe.findAll({
      where: {
        userId: req.user.id,
      },
      include: [{
        model: User,
        as: 'subscribed',
        attributes: ['name', 'cover', 'avator', 'channeldes']
      }]
    });
    if(subscribeList.length === 0) return successBack(res,[]);
    const list = subscribeList.map(item =>{
      const params = {
        subscriberId: item.dataValues.id,
        ...item.subscribed.dataValues,
        ...item.dataValues
      }
      delete params.subscribed;
      delete params.id;
      return params;
    });
    successBack(res,list);
  }catch(err){
    failBack(res,err);
  }
}

// 查询粉丝列表
async function getFans(req, res) {
  try{
    // 分页查询
    const pageNum = parseInt(req.query.pageNum) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    if (isNaN(pageNum) || isNaN(pageSize) || pageNum < 1 || pageSize < 1) {
        return failBack(res,{message:'无效的分页参数'});
    }
    const offset = (pageNum - 1) * pageSize;
    // 查询粉丝列表
    const fansList = await Subscribe.findAll({
      where: {
        subscribeUserId: req.user.id,
      },
      include: [{
        model: User,
        as: 'fans',
        attributes: ['name', 'cover', 'avator', 'channeldes']
      }],
      offset,
      order: [['created_at', 'DESC']],
      limit: pageSize,
    });
    if(fansList.length === 0) return successBack(res,[]);
    const list = fansList.map(item =>{
      const params = {
        subscriberId: item.dataValues.id,
        ...item.fans.dataValues,
        ...item.dataValues
      }
      delete params.fans;
      delete params.id;
      return params;
    });
    successBack(res,{
      list,
      total: fansList.length,
      currentPage: pageNum
    });
  }catch(err){
    failBack(res,err);
  }
}

// 证书上传后解析证书信息
async function parseCert(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        code: 1, 
        message: '请上传文件' 
      });
    }
    console.log('req.file:', req.file);
    // 直接调用解析 P12 文件的函数
    const certContent = parseP12FromFile(req.file.path);
    console.log('certContent:', certContent);
    // 解析证书信息
    successBack(res,certContent);
  } catch (err) {
    failBack(res,err);
  }
}

// 用户申请证书
async function applyCert(req, res) {
  try {
    const { userId } = req.params;
    // 1. 验证用户是否存在
    const user = await User.findByPk(userId);
    if (!user) {
      return failBack(res,{message:'用户不存在'});
    }
    // 查询证书是否存在
    const existingCert = await UserCert.findOne({ where: { userId } });
    if (existingCert) {
      return failBack(res,{message:'用户已申请证书'});
    }
    // 2. 生成 RSA 密钥对 (放在服务端)
    const keys = forge.pki.rsa.generateKeyPair({ bits: 2048 });
    const publicKey = keys.publicKey;
    const privateKey = keys.privateKey;
    // 3. 创建 CSR (放在服务端)
    const csr = forge.pki.createCertificationRequest();
    csr.publicKey = publicKey;
    csr.setSubject([{
        name: 'commonName', // 将用户 ID 放入 CN 字段
        value: String(userId)
    }]);
    // 4. 签名 CSR
    csr.sign(privateKey, forge.md.sha256.create());
    const csrPem = forge.pki.certificationRequestToPem(csr);
    // 5. 将 CSR 转换回 forge 对象以便签发函数使用
    const forgeCsr = forge.pki.certificationRequestFromPem(csrPem);
    // 6. 使用 CA 私钥签发证书
    const userCertPem = await signUserCertificate(forgeCsr, userId);
    const privateKeyPem = forge.pki.privateKeyToPem(privateKey); // 将私钥转换为 PEM 格式
    const encryptedPrivateKey = privateKeyPem // 直接存储私钥，不加密
    // 7. 保存证书和加密后的私钥到数据库
    const cert = await UserCert.create({
        userId,
        certPem: userCertPem,
        encryptedPrivateKey
    });
    successBack(res,cert);
  } catch (err) {
    failBack(res,err);
  }
}


// 用户下载证书文件为 P12 格式
async function downloadCert(req, res) {
  try {
    const { userId } = req.params;
    // 1. 验证用户是否存在
    const user = await User.findByPk(userId);
    if (!user) {
      return failBack(res,{message:'用户不存在'});
    }
    // 查询证书是否存在
    const existingCert = await UserCert.findOne({ where: { userId } });
    if (!existingCert) {
      return failBack(res,{message:'用户未申请证书'});
    }
    // 2. 构建 P12 文件内容
    const userCert = forge.pki.certificateFromPem(existingCert.certPem);
    const privateKey = forge.pki.privateKeyFromPem(existingCert.encryptedPrivateKey); 
    console.log('userCert:', userCert);
    const p12Asn1 = forge.pkcs12.toPkcs12Asn1(
      privateKey,
      [userCert],
      '123456',
    )
    // 将 ASN.1 结构转换为 DER 编码的二进制数据
    const p12Der = forge.asn1.toDer(p12Asn1).getBytes();
    // 3. 发送 P12 文件
    // 4. 设置响应头并发送 P12 文件流
    res.setHeader('Content-Disposition', `attachment; filename="user_${userId}.p12"`); // 设置下载文件名
    res.setHeader('Content-Type', 'application/x-pkcs12'); // 设置正确的 MIME 类型
    res.send(p12Der); // 发送二进制数据
  } catch (err) {
    console.log('err:', err);
    failBack(res,err);
  }
}


// 用户注销证书
async function cancelCert(req, res) {
  try {
    const { userId } = req.params;
    // 1. 验证用户是否存在
    const user = await User.findByPk(userId);
    if (!user) {
      return failBack(res,{message:'用户不存在'});
    }
    // 查询证书是否存在
    const existingCert = await UserCert.findOne({ where: { userId } });
    if (!existingCert) {
      return failBack(res,{message:'用户未申请证书'});
    }
    // 2. 删除证书记录
    await existingCert.destroy();
    successBack(res);
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
  updateProfile,
  subscribe,
  unsubscribe,
  getChannel,
  getSubscribes,
  getFans,
  getUserInfo,
  parseCert,
  applyCert,
  cancelCert,
  downloadCert
}
