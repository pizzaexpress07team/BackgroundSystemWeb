<template>
  <section>
    <!--工具条-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
      <el-form :inline="true" :model="filters">
        <el-form-item>
          <el-input v-model="filters.name" placeholder="配送员姓名"></el-input>
        </el-form-item>
        <el-form-item>
          <!--<el-button type="primary" v-on:click="Find">按ID查询</el-button>-->
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-on:click="Findbyname">按姓名查询</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-on:click="Findbytrans">正在配送</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleAdd">新增</el-button>
        </el-form-item>
        <el-form-item>
          <el-button @click="getUsers">重置条件</el-button>
        </el-form-item>
      </el-form>
    </el-col>

    <!--列表-->
    <el-table :data="users" highlight-current-row v-loading="listLoading" @selection-change="selsChange"
              style="width: 100%;">
      <el-table-column type="selection" width="55">
      </el-table-column>
      <el-table-column type="index" width="60">
      </el-table-column>
      <el-table-column prop="d_id" label="编号" sortable>
      </el-table-column>
      <el-table-column prop="d_name" label="姓名">
      </el-table-column>
      <el-table-column prop="d_phone" label="电话">
      </el-table-column>
      <el-table-column prop="f_id" label="工厂">
      </el-table-column>
      <el-table-column label="操作" width="150">
        <template slot-scope="scope">
          <el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
          <!--<el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>-->
          <el-button style="margin: 10px 0 0;" size="small" @click="getOrder(scope.$index, scope.row)">查看订单信息
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!--工具条-->
    <el-col :span="24" class="toolbar">
      <!--<el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button>-->
      <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="10" :total="total"
                     style="float:right;">
      </el-pagination>
    </el-col>

    <!--编辑界面-->
    <el-dialog title="编辑" v-model="editFormVisible" :close-on-click-modal="false">
      <el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
        <el-form-item label="订单ID" prop="name">
          <el-input type="textarea" v-model="editForm.o_id" disabled></el-input>
        </el-form-item>
        <el-form-item label="用户ID">
          <el-input type="textarea" v-model="editForm.u_id" disabled></el-input>
        </el-form-item>
        <el-form-item label="地址">
          <el-input type="textarea" v-model="editForm.o_delivery_addr"></el-input>
        </el-form-item>
        <el-form-item label="支付状态">
          <el-input type="textarea" v-model="editForm.o_pay_state"></el-input>
        </el-form-item>
        <el-form-item label="配送状态">
          <el-input type="textarea" v-model="editForm.delivery_state"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="editFormVisible = false">取消</el-button>
        <el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
      </div>
    </el-dialog>

    <!--新增界面-->
    <el-dialog title="新增" v-model="addFormVisible" :close-on-click-modal="false">
      <el-form :model="addForm" label-width="80px" :rules="addFormRules" ref="addForm">
        <!--
        <el-form-item label="姓名" prop="name">
          <el-input v-model="addForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="性别">
          <el-radio-group v-model="addForm.sex">
            <el-radio class="radio" :label="1">男</el-radio>
            <el-radio class="radio" :label="0">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="年龄">
          <el-input-number v-model="addForm.age" :min="0" :max="200"></el-input-number>
        </el-form-item>
        <el-form-item label="生日">
          <el-date-picker type="date" placeholder="选择日期" v-model="addForm.birth"></el-date-picker>
        </el-form-item>
        <el-form-item label="地址">
          <el-input type="textarea" v-model="addForm.addr"></el-input>
        </el-form-item>
        -->
        <el-form-item label="订单ID" prop="name">
          <el-input type="textarea" v-model="editForm.addr"></el-input>
        </el-form-item>
        <el-form-item label="用户ID">
          <el-input type="textarea" v-model="editForm.addr"></el-input>
        </el-form-item>
        <el-form-item label="地址">
          <el-input type="textarea" v-model="editForm.addr"></el-input>
        </el-form-item>
        <el-form-item label="订单详情">
          <el-input type="textarea" v-model="editForm.addr"></el-input>
        </el-form-item>
        <el-form-item label="订单价格">
          <el-input type="textarea" v-model="editForm.addr"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="addFormVisible = false">取消</el-button>
        <el-button type="primary" @click.native="addSubmit" :loading="addLoading">提交</el-button>
      </div>
    </el-dialog>
  </section>
</template>

<script>
  import util from '../../common/js/util'
  import {parsePayState} from '../../common/js/util'
  //import NProgress from 'nprogress'
  import {getUserListPage, removeUser, batchRemoveUser, editUser, addUser} from '../../api/api';

  export default {
    data() {
      return {
        filters: {
          name: ''
        },
        users: [],
        total: 100,
        page: 1,
        listLoading: false,
        sels: [],//列表选中列

        editFormVisible: false,//编辑界面是否显示
        editLoading: false,
        editFormRules: {
          name: [
            {required: true, message: '请输入姓名', trigger: 'blur'}
          ]
        },
        //编辑界面数据
        editForm: {
          id: 0,
          name: '',
          sex: -1,
          age: 0,
          birth: '',
          addr: ''
        },

        addFormVisible: false,//新增界面是否显示
        addLoading: false,
        addFormRules: {
          name: [
            {required: true, message: '请输入姓名', trigger: 'blur'}
          ]
        },
        //新增界面数据
        addForm: {
          name: '',
          sex: -1,
          age: 0,
          birth: '',
          addr: ''
        }

      }
    },
    methods: {
      Find() {
        let para = {
          page: this.page,
          name: this.filters.name
        };
        this.listLoading = true;
        const url = `/deli/getById?d_id=${para.name}`;
        this.getRequest(url)
          .then(data => {
            //NProgress.done()
            const result = data.data;
            console.log(result);
            this.users = result.successQuery;
            this.listLoading = false;
            /*if (result) {
              if (result.length < 10) {
                this.total = (this.page - 1) * 10 + result.length;
                console.log(result.length, this.total);
              }
            }*/
            if (!result) {
              this.$message({
                message: '',
                type: 'error'
              });
            }
          });
      },
      Findbyname() {
        let para = {
          page: this.page,
          name: this.filters.name
        };
        this.listLoading = true;
        const url = `/deli/getByNameLike?d_name=${para.name}`;
        this.getRequest(url)
          .then(data => {
            //NProgress.done()
            const result = data.data;
            console.log(result);
            this.users = result.list;
            this.total = result.total;
            this.listLoading = false;
            if (result) {
              if (result.length < 10) {
                this.total = (this.page - 1) * 10 + result.length;
                console.log(result.length, this.total);
              }
            }
            if (!result) {
              this.$message({
                message: '',
                type: 'error'
              });
            }
          });
      },
      Findbytrans() {
        let para = {
          page: this.page,
          name: this.filters.name
        };
        this.listLoading = true;
        //NProgress.start();
        /*getUserListPage(para).then((res) => {
          this.total = res.data.total;
          this.users = res.data.users;
          this.listLoading = false;
          //NProgress.done();
        });*/

        const url = `/deli/listOrder?pno=${this.page}&pageSize=100`;
        this.getRequest(url)
          .then(data => {
            //NProgress.done()
            const result = data.data;
            console.log(result);
            this.users = result.list;
            this.total = parseInt(result.total);
            this.listLoading = false;
            if (result) {
              if (result.length < 10) {
                this.total = (this.page - 1) * 10 + result.length;
                console.log(result.length, this.total);
              }
            }
            if (!result) {
              this.$message({
                message: '',
                type: 'error'
              });
            }
          });
      },
      getOrder(index, row) {
        let para = {id: row.d_id};
        const url = `/deli/getDeliOrderById?d_id=${para.id}`;
        this.getRequest(url)
          .then(data => {
            data = data.data;
            if (data.errorCode === 1) {
              this.$message.error('配送员不存在');
            } else if (data.errorCode === 2) {
              this.$message.error('配送员还未接单');
            } else {
              data = data.list;
              this.$alert('' +
                `配送员id:${data.d_id} ` +
                `配送员姓名:${data.d_name} ` +
                `配送员电话:${data.d_phone} ` +
                `配送工厂id:${data.f_id} `,
                '订单信息', {
                  dangerouslyUseHTMLString: true
                });
            }
          });
      },
      /**
       * 解析json字符串
       * @param string 需要解析的string内容
       * @param whichNeed 用于判断需要返回哪种格式或内容
       * @returns {*}
       * @constructor
       * @return {string}
       */
      JsonParse(string, whichNeed) {
        const parsedString = JSON.parse(string);
        if (whichNeed === 'addr') {
          return parsedString.detail;
        } else if (whichNeed === 'orderDetail') {
          let detailContent = '';
          parsedString.forEach((item) => {
            const size = item.size,
              num = item.num,
              name = item.name,
              price = item.price;
            const tmpContent = `${size}${name}共${num}份，单价￥${price}\n`;
            detailContent += tmpContent;
          });
          return detailContent;
        }
        return parsedString;
      },
      //性别显示转换
      formatSex: function (row, column) {
        return row.sex == 1 ? '男' : row.sex == 0 ? '女' : '未知';
      },
      handleCurrentChange(val) {
        this.page = val;
        this.getUsers();
      },
      admin(admin) {
        return admin === 0 ? '否' : '是';
      },
      parsePayState(payState) {
        return payState === 0 ? '未支付' : '已支付';
      },
      parseDeliveryState(deliveryState) {
        if (deliveryState === 0) {
          return '未配送';
        } else if (deliveryState === 1) {
          return '配送中';
        } else {
          return '已送达';
        }
      },
      tranAddr(stringAddr) {
        const addr = JSON.parse(stringAddr);
        return addr.detail;
      },

      //获取列表
      getUsers() {
        let para = {
          page: this.page,
          name: this.filters.name
        };
        this.listLoading = true;
        //NProgress.start();
        /*getUserListPage(para).then((res) => {
          this.total = res.data.total;
          this.users = res.data.users;
          this.listLoading = false;
          //NProgress.done();
        });*/

        const url = `/deli/list?pno=${this.page}&pageSize=10`;
        this.getRequest(url)
          .then(data => {
            //NProgress.done()
            const result = data.data;
            console.log(result);
            this.users = result.list;
            this.total = parseInt(result.total);
            this.listLoading = false;
            if (result) {
              if (result.length < 10) {
                this.total = (this.page - 1) * 10 + result.length;
                console.log(result.length, this.total);
              }
            }
            if (!result) {
              this.$message({
                message: '',
                type: 'error'
              });
            }
          });
      },

      //删除
      handleDel: function (index, row) {
        this.$confirm('确认删除该记录吗?', '提示', {
          type: 'warning'
        }).then(() => {
          this.listLoading = true;
          //NProgress.start();
          let para = {id: row.id};
          removeUser(para).then((res) => {
            this.listLoading = false;
            //NProgress.done();
            this.$message({
              message: '删除成功',
              type: 'success'
            });
            this.getUsers();
          });
        }).catch(() => {

        });
      },
      //显示编辑界面
      handleEdit: function (index, row) {
        this.editFormVisible = true;
        this.editForm = Object.assign({}, row);
      },
      //显示新增界面
      handleAdd: function () {
        this.addFormVisible = true;
        this.addForm = {
          name: '',
          sex: -1,
          age: 0,
          birth: '',
          addr: ''
        };
      },
      //编辑
      editSubmit: function () {
        this.$refs.editForm.validate((valid) => {
          if (valid) {
            this.$confirm('确认提交吗？', '提示', {}).then(() => {
              this.editLoading = true;
              //NProgress.start();
              let para = Object.assign({}, this.editForm);
              //para.birth = (!para.birth || para.birth == '') ? '' : util.formatDate.format(new Date(para.birth), 'yyyy-MM-dd');
              editUser(para).then((res) => {
                this.editLoading = false;
                //NProgress.done();
                this.$message({
                  message: '提交成功',
                  type: 'success'
                });
                this.$refs['editForm'].resetFields();
                this.editFormVisible = false;
                this.getUsers();
              });
            });
          }
        });
      },
      //新增
      addSubmit: function () {
        this.$refs.addForm.validate((valid) => {
          if (valid) {
            this.$confirm('确认提交吗？', '提示', {}).then(() => {
              this.addLoading = true;
              //NProgress.start();
              let para = Object.assign({}, this.addForm);
              //para.birth = (!para.birth || para.birth == '') ? '' : util.formatDate.format(new Date(para.birth), 'yyyy-MM-dd');
              addUser(para).then((res) => {
                this.addLoading = false;
                //NProgress.done();
                this.$message({
                  message: '提交成功',
                  type: 'success'
                });
                this.$refs['addForm'].resetFields();
                this.addFormVisible = false;
                this.getUsers();
              });
            });
          }
        });
      },
      selsChange: function (sels) {
        this.sels = sels;
      },
      //批量删除
      batchRemove: function () {
        var ids = this.sels.map(item => item.id).toString();
        this.$confirm('确认删除选中记录吗？', '提示', {
          type: 'warning'
        }).then(() => {
          this.listLoading = true;
          //NProgress.start();
          let para = {ids: ids};
          batchRemoveUser(para).then((res) => {
            this.listLoading = false;
            //NProgress.done();
            this.$message({
              message: '删除成功',
              type: 'success'
            });
            this.getUsers();
          });
        }).catch(() => {

        });
      }
    },
    mounted() {
      this.getUsers();
    }
  }

</script>

<style scoped>

</style>
