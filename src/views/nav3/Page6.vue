<template>
  <section>
    <!--工具条-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
      <el-form :inline="true" :model="filters">
        <el-form-item>
          <el-input v-model="filters.name" placeholder="菜单名称"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-on:click="Find">按名称查询</el-button>
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
      <el-table-column prop="p_name" label="名称" sortable>
      </el-table-column>
      <el-table-column prop="p_type" label="种类" sortable>
      </el-table-column>
      <el-table-column prop="price" label="价格" sortable>
      </el-table-column>
      <el-table-column prop="resource" label="原料" sortable>
      </el-table-column>
      <el-table-column label="图片">
        <template slot-scope="scope">
          <span style="margin-left: 10px">{{ (scope.row.p_picture) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150">
        <template slot-scope="scope">
          <el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
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
        <el-form-item label="名称" prop="name">
          <el-input type="textarea" v-model="editForm.p_name"></el-input>
        </el-form-item>
        <el-form-item label="种类">
          <el-input type="textarea" v-model="editForm.p_type"></el-input>
        </el-form-item>
        <el-form-item label="价格">
          <el-input type="textarea" v-model="editForm.price"></el-input>
        </el-form-item>
        <el-form-item label="原料">
          <el-input type="textarea" v-model="editForm.resource"></el-input>
        </el-form-item>
        <el-form-item label="图片">
          <el-input type="textarea" v-model="editForm.p_picture"></el-input>
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
        <el-form-item label="名称" prop="name">
          <el-input type="textarea" v-model="filters.p_name"></el-input>
        </el-form-item>
        <el-form-item label="种类">
          <el-input type="textarea" v-model="filters.p_type"></el-input>
        </el-form-item>
        <el-form-item label="价格">
          <el-input type="textarea" v-model="filters.price"></el-input>
        </el-form-item>
        <el-form-item label="原料">
          <el-input type="textarea" v-model="filters.resource"></el-input>
        </el-form-item>
        <el-form-item label="图片">
          <el-input type="textarea" v-model="filters.p_picture"></el-input>
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
      Find() {
        let para = {
          page: this.page,
          name: this.filters.name
        };
        this.listLoading = true;
        const url = `/menu/getByNameLike?p_name=${para.name}`;
        this.getRequest(url)
          .then(data => {
            //NProgress.done()
            const result = data.data;
            console.log(result);
            this.users = result.list;
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

        const url = `/menu/info`;
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
        this.$confirm('确认删除该菜单吗?', '提示', {
          type: 'warning'
        }).then(() => {
          this.listLoading = true;
          let para = {id: row.p_id};
          const url = `/menu/deleteWithRes?p_id=${para.id}`;
          this.getRequest(url)
            .then(data => {
              if (data.data.errorCode === 1) {
                this.$message.error('此菜单不存在');
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
      editSubmit: function (index, row) {
        this.$confirm('确认提交吗？', '提示', {}).then(() => {
          this.editLoading = true;
          let para = {
            empty: this.users.is_empty,
            id: this.users.p_id,
            name: this.editForm.p_name,
            picture: this.editForm.p_picture,
            size: this.users.p_size,
            type: this.editForm.p_type,
            price: this.editForm.price,
            resource: JSON.stringify(this.editForm.resource),
          };
          const url = `/menu/modify?pizzaInfoWithRes=${JSON.stringify(para)}`;
          this.getRequest(url)
            .then(res => {
              header("Access-Control-Allow-Origin: *");
              this.editLoading = false;
              //NProgress.done();
              if (res.data.errorCode === 1) {
                this.$message.error('此菜单不存在');
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
        this.$confirm('确认提交吗？', '提示', {}).then(() => {
          this.editLoading = true;
          let para = {
            empty: "",
            id: "",
            name: this.filters.p_name,
            picture: this.filters.p_picture,
            size: "",
            type: this.filters.p_type,
            price: this.filters.price,
            resource: JSON.stringify(this.filters.resource),
          };
          const url = `/menu/createWithRes?pizzaInfoWithRes=${JSON.stringify(para)}`;
          this.postRequest(url)
            .then(res => {
              this.editLoading = false;
              //NProgress.done();
              if (res.data.errorCode === 1) {
                this.$message.error('此菜单已存在');
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
