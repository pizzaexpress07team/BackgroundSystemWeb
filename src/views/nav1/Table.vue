<template>
  <section>
    <!--工具条-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
      <el-form :inline="true" :model="filters">
        <el-form-item>
          <el-input v-model="filters.name" placeholder="订单ID 用户ID 用户名"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-on:click="Find">按订单ID查询</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-on:click="FindbyUid">按用户ID查询</el-button>
        </el-form-item>
        <el-form-item>
          <!--<el-button type="primary" v-on:click="FindbyUsername">按用户名查询</el-button>-->
        </el-form-item>
        <el-form-item>
          <el-button @click="getUsers">重置条件</el-button>
        </el-form-item>
      </el-form>
    </el-col>

    <!--列表-->
    <el-table :data="users" highlight-current-row v-loading="listLoading" @selection-change="selsChange"
              style="width: 100%;">
      <!--<el-table-column type="selection" width="55">-->
      <!--</el-table-column>-->
      <el-table-column type="index">
      </el-table-column>
      <el-table-column prop="o_id" label="订单ID">
      </el-table-column>
      <el-table-column prop="u_id" label="用户ID">
      </el-table-column>
      <el-table-column label="详情" min-width="200">
        <template slot-scope="scope">
          <span class="order-detail" style="margin-left: 10px">{{ JsonParse(scope.row.detail, 'orderDetail') }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="total_price" label="总价">
      </el-table-column>
      <el-table-column label="地址" width="150">
        <template slot-scope="scope">
          <span style="margin-left: 10px">{{ JsonParse(scope.row.o_delivery_addr, 'addr') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="110">
        <template slot-scope="scope">
          <span>{{ formatDateFormat(scope.row.o_create_time, 'yyyy-MM-dd hh:mm:ss') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="支付时间" width="110">
        <template slot-scope="scope">
          <span>{{ formatDateFormat(scope.row.o_pay_time, 'yyyy-MM-dd hh:mm:ss') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="支付状态" width="100">
        <template slot-scope="scope">
          <span>{{ parsePayState(scope.row.o_pay_state) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="配送状态" width="100">
        <template slot-scope="scope">
          <span>{{ parseDeliveryState(scope.row.delivery_state) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" min-width="200">
        <template slot-scope="scope">
          <el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
<!--          <el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>-->
          <el-button type="warning" size="small" @click="handleCancel(scope.$index, scope.row)">取消</el-button>
          <el-button style="margin: 10px 0 0;" size="small" @click="getDeliveryman(scope.$index, scope.row)">查看配送信息</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!--工具条分页-->
    <el-col :span="24" class="toolbar">
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
          <el-input type="textarea" v-model="editForm.o_delivery_addr" disabled=""></el-input>
        </el-form-item>
        <el-form-item label="支付状态">
          <el-radio-group v-model="editForm.o_pay_state">
            <el-radio :label="0" disabled>未支付</el-radio>
            <el-radio :label="1" disabled>已支付</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="配送状态">
          <el-radio-group v-model="editForm.delivery_state">
            <el-radio :label="0">未配送</el-radio>
            <el-radio :label="1">配送中</el-radio>
            <el-radio :label="2">已完成</el-radio>
            <el-radio :label="3">已取消</el-radio>
          </el-radio-group>
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
  import { parsePayState } from '../../common/js/util'
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
            {required: false, message: '请输入姓名', trigger: 'blur'}
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
            {required: false, message: '请输入姓名', trigger: 'blur'}
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
      //性别显示转换
      formatSex: function (row, column) {
        return row.sex == 1 ? '男' : row.sex == 0 ? '女' : '未知';
      },
      handleCurrentChange(val) {
        this.page = val;
        this.getUsers();
      },
      parsePayState(payState) {
        return payState === 0 ? '未支付' : '已支付';
      },
      parseDeliveryState(deliveryState) {
        if (deliveryState === 0) {
          return '未配送';
        } else if (deliveryState === 1) {
          return '配送中';
        } else if (deliveryState === 3) {
          return '已取消';
        } else {
          return '已送达';
        }
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
      // 根据订单ID查询
      Find() {
        let para = {
          page: this.page,
          name: this.filters.name
        };
        this.listLoading = true;
        const url = `/order/getById?o_id=${para.name}`;
        this.getRequest(url)
          .then(data => {
            //NProgress.done()
            const result = data.data;
            this.users = [result.successQuery];
            this.total = 1;
            this.listLoading = false;
            if (result.errorCode !== 0) {
              this.$message({
                message: '暂无该条订单数据',
                type: 'error'
              });
            }
          });
      },
      // 根据用户Id查询
      FindbyUid() {
        let para = {
          page: this.page,
          name: this.filters.name
        };
        this.listLoading = true;
        const url = `/order/view?uid=${para.name}`;
        this.getRequest(url)
          .then(data => {
            //NProgress.done()
            const result = data.data;
            this.users = result.list;
            this.total = result.total; // 数据总数 用于列表分页
            this.listLoading = false;
            if (result.errorCode !== 0) {
              this.$message({
                message: '该用户无订单',
                type: 'error'
              });
            }
          });
      },
      FindbyUsername() {
        let para = {
          page: this.page,
          name: this.filters.name
        };
        this.listLoading = true;
        const url = `/order/status/getByUserName?username=${para.name}`;
        this.getRequest(url)
          .then(data => {
            if (data.status !== 200) {
              this.$message({
                message: '系统出错，请稍后再试',
                type: 'error'
              });
              this.listLoading = false;
              return;
            }
            //NProgress.done()
            const result = data.data;
            this.users = result.list;
            this.total = result.total; // 数据总数 用于列表分页
            this.listLoading = false;
            if (result.errorCode === 1) {
              this.$message({
                message: '该用户不存在',
                type: 'error'
              });
            } else if (result.errorCode === 2) {
              this.$message({
                message: '该用户暂无下单',
                type: 'error'
              });
            }
          });
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

        const url = `/order/listByTime?pno=${this.page}&pageSize=10`; // 按下单时间查询
        this.getRequest(url)
          .then(data => {
            //NProgress.done()
            const result = data.data;
            console.log(result);
            this.users = result.list;
            this.total = parseInt(result.databaseTotal);
            this.listLoading = false;
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
        this.$confirm('确认删除该订单吗?', '提示', {
          type: 'warning'
        }).then(() => {
          this.listLoading = true;
          let para = {id: row.o_id};
          const url = `/order/delete?o_id=${para.id}`;
          this.getRequest(url)
            .then(data => {
              if (data.data.errorCode === 1) {
                this.$message.error('此订单ID不存在');
              } else if (data.data.errorCode === 2) {
                this.$message.error('系统错误（数据库删除操作失败');
              } else {
                this.$message({
                  message: '删除成功',
                  type: 'success'
                });
              }
              this.getUsers();
            });
          });
      },
      // 取消订单
      handleCancel(index, row) {
        this.$confirm('确认取消该订单吗?', '提示', {
          type: 'warning'
        }).then(async () => {
          this.listLoading = true;
          let para = {id: row.o_id};
          const url = `/order/cancel?o_id=${para.id}`;
          const result = await this.getRequest(url);
          //NProgress.done();
          if (result.data.errorCode === 1) {
            this.$message.error('此订单ID不存在');
          } else if (result.data.errorCode === 2) {
            this.$message.error('系统错误（数据库操作失败）');
          } else {
            this.$message({
              message: '取消成功',
              type: 'success'
            });
          }
          this.getUsers();
        });
      },
      getDeliveryman(index, row) {
        let para = {id: row.o_id};
        const url = `/order/getOrderDeliverman?o_id=${para.id}`;
        this.getRequest(url)
          .then(data => {
            data = data.data;
            console.log(data);
            if (data.errorCode === 1) {
              this.$message.error('此订单暂未开始配送');
            } else if (data.errorCode === 2) {
              this.$message.error('系统错误（订单的配送员ID不匹配配送员列表）');
            } else {
              data = data.successQuery;
              this.$alert('' +
                `配送员id:${data.d_id} ` +
                `配送员姓名:${data.d_name} ` +
                `配送员电话:${data.d_phone} ` +
                `配送工厂id:${data.f_id} `,
                '配送信息', {
                dangerouslyUseHTMLString: true
              });
            }
          });
      },
      /**
       * 格式化时间戳
       * @param timestamp
       * @param format
       * @returns {*|Date}
       */
      formatDateFormat(timestamp, format) {
        if (!timestamp) {
          return '-';
        }
        return util.formatDate.format(new Date(timestamp), format);
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
        // this.$refs.editForm.validate((valid) => {});
          this.$confirm('确认提交吗？', '提示', {}).then(() => {
            this.editLoading = true;
            //NProgress.start();
            let para = Object.assign({}, this.editForm);
            //para.birth = (!para.birth || para.birth == '') ? '' : util.formatDate.format(new Date(para.birth), 'yyyy-MM-dd');
            const url = `/order/modifyDeliState?o_id=${para.o_id}&deliState=${para.delivery_state}`;
            this.getRequest(url)
              .then(res => {
                this.editLoading = false;
                //NProgress.done();
                if (res.data.errorCode === 1) {
                  this.$message.error('此订单不存在');
                } else if (res.data.errorCode === 2) {
                  this.$message.error('系统错误（数据库修改操作失败），请稍后再试');
                } else {
                  this.$message({
                    message: '提交成功',
                    type: 'success'
                  });
                }
                this.$refs['editForm'].resetFields();
                this.editFormVisible = false;
                this.getUsers();
              });
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
    beforeMount() {
      this.getUsers();
    }
  }

</script>

<style scoped>
.order-detail {
  white-space: pre-line;
}
</style>
