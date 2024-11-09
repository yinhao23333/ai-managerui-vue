<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="queryParams.email" placeholder="请输入邮箱" clearable style="width: 240px"
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="state">
        <el-select v-model="queryParams.state" placeholder="状态" clearable>
          <el-option v-for="item in dict.type.sys_cookie_state" :key="item.value" :label="item.label"
            :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
          v-hasPermi="['system:config:add']">新增</el-button>
      </el-col>
      <!-- <el-col :span="1.5">
        <el-button type="success" plain icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate"
          v-hasPermi="['system:config:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['system:config:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="el-icon-download" size="mini" @click="handleExport"
          v-hasPermi="['system:config:export']">导出</el-button>
      </el-col> -->
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- @selection-change="handleSelectionChange" -->
    <el-table v-loading="loading" :data="configList">
      <!-- <el-table-column type="selection" width="55" align="center" /> -->
      <el-table-column label="账号" align="center" prop="email" width="240" />
      <el-table-column label="添加时间" align="center" prop="createTime">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="账号订阅过期时间" align="center" prop="renewsOn">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.renewsOn) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="当前积分" align="center" prop="points" />
      <el-table-column label="并发等级" align="center" prop="level" />
      <!-- <el-table-column label="状态" align="center" prop="state">
        <template slot-scope="scope">
          <span>{{ typeFormat(scope.row) }}</span>
        </template>
      </el-table-column> -->
      <el-table-column label="状态" align="center" prop="state">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.sys_cookie_state" :value="scope.row.state" />
        </template>
      </el-table-column>
      <el-table-column label="sessionId" align="center" prop="sessionId" />
      <el-table-column label="cookie" show-overflow-tooltip align="center" prop="cookie" />
      <el-table-column label="操作时间" align="center" prop="lastTime">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.lastTime) }}</span>
        </template>
      </el-table-column>
      <!-- <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column> -->
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <!-- <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['system:config:edit']">修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
            v-hasPermi="['system:config:remove']">删除</el-button> -->
          <el-button size="mini" type="text" icon="el-icon-copy-document"
            @click="copyCookie(scope.row)">复制cookie</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.page" :limit.sync="queryParams.size"
      @pagination="getList" />

    <!-- 添加或修改参数配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="邮箱" />
        </el-form-item>
        <el-form-item label="状态" prop="state" style="width:100%;">
          <el-select v-model="form.state" style="width:100%;">
            <el-option v-for="item in dict.type.sys_cookie_state" :key="item.value" :label="item.label"
              :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="并发等级" style="width:100%;">
          <el-input-number v-model="form.level" controls-position="right" :min="0" style="width:100%;" />
        </el-form-item>
        <el-form-item label="sessionId" prop="sessionId">
          <el-input v-model="form.sessionId" placeholder="sessionId" />
        </el-form-item>
        <el-form-item label="cookie" prop="cookie">
          <el-input v-model="form.cookie" type="textarea" placeholder="请输入cookie"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getCookieList, addCookieList } from "@/api/music/index";
import { AESDecrypt } from '../../../utils/AESDecrypt.js'
export default {
  name: "Suno",
  dicts: ['sys_cookie_state'],
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 参数表格数据
      configList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        page: 1,
        size: 10,
        email: null,
        state: '-1',
      },
      // 表单参数
      form: {
        level: 2,
        state: 2,
      },
      // 表单校验
      rules: {
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
        ],
        state: [
          { required: true, message: "请选择状态", trigger: "change" }
        ],
        sessionId: [
          { required: true, message: "sessionId不能为空", trigger: "blur" }
        ],
        cookie: [
          { required: true, message: "cookie不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询参数列表 */
    getList() {
      this.loading = true;
      let data=JSON.parse(JSON.stringify(this.queryParams))
      data.state=Number(data.state)
      getCookieList(data).then(response => {
        let data = AESDecrypt(response.data)
        console.log(data)
        console.log(data.total)
        this.configList = data.records;
        this.total = data.total;
        this.loading = false;
      }
      );
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        email:'',
        state:'2' ,
        sessionId:'',
        cookie:'',
        level: 2
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.page = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加cookie";
    },
    // // 多选框选中数据
    // handleSelectionChange(selection) {
    //   this.ids = selection.map(item => item.configId)
    //   this.single = selection.length != 1
    //   this.multiple = !selection.length
    // },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const configId = row.configId || this.ids
      getConfig(configId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改cookie";
      });
    },
    /** 提交按钮 */
    submitForm: function () {
      let data=JSON.parse(JSON.stringify(this.form))
      data.state=Number(data.state)
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.configId != undefined) {
            updateConfig(data).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addCookieList(data).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const configIds = row.configId || this.ids;
      this.$modal.confirm('是否确认删除参数编号为"' + configIds + '"的数据项？').then(function () {
        return delConfig(configIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => { });
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/config/export', {
        ...this.queryParams
      }, `config_${new Date().getTime()}.xlsx`)
    },
    // 复制
    copyCookie(row) {
      navigator.clipboard.writeText(row.cookie).then(() => {
        this.$modal.msgSuccess("复制成功！");
      }).catch(err => {
        this.$modal.msgError("复制失败：" + err);
      });
    }
  }
};
</script>
