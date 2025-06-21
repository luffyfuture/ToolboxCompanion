<template>
  <div class="red-team-container">
    <div class="red-team-header">
      <h2>红队常用命令</h2>
      <div class="header-actions">
        <el-input
          v-model="searchQuery"
          placeholder="搜索命令..."
          class="search-input"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="selectedCategory" placeholder="选择分类" clearable>
          <el-option
            v-for="category in categories"
            :key="category"
            :label="category"
            :value="category"
          />
        </el-select>
      </div>
    </div>

    <div class="commands-content">
      <div class="category-tabs">
        <el-tabs v-model="activeTab" @tab-click="handleTabClick">
          <el-tab-pane
            v-for="category in Object.keys(commandData)"
            :key="category"
            :label="category"
            :name="category"
          >
            <div class="commands-section">
              <div
                v-for="(section, sectionName) in commandData[category]"
                :key="sectionName"
                class="command-group"
              >
                <h3 class="section-title">{{ sectionName }}</h3>
                <div class="command-cards">
                  <div
                    v-for="(command, index) in filteredCommands(section)"
                    :key="index"
                    class="command-card"
                  >
                    <div class="command-header">
                      <h4>{{ command.title }}</h4>
                      <el-button
                        size="small"
                        @click="copyCommand(command.code)"
                        :icon="DocumentCopy"
                        circle
                      />
                    </div>
                    <div class="command-description" v-if="command.description">
                      {{ command.description }}
                    </div>
                    <div class="command-code">
                      <pre><code>{{ command.code }}</code></pre>
                    </div>
                    <div class="command-tags" v-if="command.tags">
                      <el-tag
                        v-for="tag in command.tags"
                        :key="tag"
                        size="small"
                        type="info"
                      >
                        {{ tag }}
                      </el-tag>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, DocumentCopy } from '@element-plus/icons-vue'

interface Command {
  title: string
  code: string
  description?: string
  tags?: string[]
}

const searchQuery = ref('')
const selectedCategory = ref('')
const activeTab = ref('系统信息收集')

const commandData = ref({
  '系统信息收集': {
    '基础信息': [
      {
        title: '系统信息',
        code: 'systeminfo',
        description: '获取系统详细信息',
        tags: ['Windows', '信息收集']
      },
      {
        title: '当前用户',
        code: 'whoami',
        description: '获取当前用户名',
        tags: ['Windows', 'Linux']
      },
      {
        title: '用户列表',
        code: 'net user',
        description: '列出所有用户账户',
        tags: ['Windows']
      },
      {
        title: '组信息',
        code: 'net localgroup',
        description: '列出本地组',
        tags: ['Windows']
      },
      {
        title: '网络配置',
        code: 'ipconfig /all',
        description: '显示网络配置信息',
        tags: ['Windows', '网络']
      },
      {
        title: 'ARP表',
        code: 'arp -a',
        description: '显示ARP缓存表',
        tags: ['Windows', 'Linux', '网络']
      },
      {
        title: '路由表',
        code: 'route print',
        description: '显示路由表',
        tags: ['Windows', '网络']
      },
      {
        title: '网络连接',
        code: 'netstat -an',
        description: '显示网络连接和监听端口',
        tags: ['Windows', 'Linux', '网络']
      }
    ],
    '进程和服务': [
      {
        title: '进程列表',
        code: 'tasklist',
        description: '列出所有运行中的进程',
        tags: ['Windows']
      },
      {
        title: '服务列表',
        code: 'net start',
        description: '列出所有启动的服务',
        tags: ['Windows']
      },
      {
        title: '详细进程信息',
        code: 'wmic process list full',
        description: '获取详细的进程信息',
        tags: ['Windows', 'WMIC']
      },
      {
        title: '杀死进程',
        code: 'taskkill /f /pid <PID>',
        description: '强制结束指定进程',
        tags: ['Windows']
      }
    ]
  },
  '权限提升': {
    'Windows权限提升': [
      {
        title: '检查权限',
        code: 'whoami /priv',
        description: '检查当前用户权限',
        tags: ['Windows', '权限']
      },
      {
        title: '用户组信息',
        code: 'whoami /groups',
        description: '查看当前用户所属组',
        tags: ['Windows', '权限']
      },
      {
        title: 'UAC绕过检查',
        code: 'reg query HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System',
        description: '检查UAC配置',
        tags: ['Windows', 'UAC', '注册表']
      },
      {
        title: '计划任务',
        code: 'schtasks /query /fo LIST /v',
        description: '列出所有计划任务',
        tags: ['Windows', '计划任务']
      },
      {
        title: '服务权限',
        code: 'sc qc <服务名>',
        description: '查询服务配置',
        tags: ['Windows', '服务']
      }
    ],
    'Linux权限提升': [
      {
        title: 'Sudo权限',
        code: 'sudo -l',
        description: '检查sudo权限',
        tags: ['Linux', '权限']
      },
      {
        title: 'SUID文件',
        code: 'find / -perm -u=s -type f 2>/dev/null',
        description: '查找SUID文件',
        tags: ['Linux', 'SUID']
      },
      {
        title: '可写文件',
        code: 'find / -writable -type f 2>/dev/null',
        description: '查找可写文件',
        tags: ['Linux', '权限']
      },
      {
        title: 'Cron任务',
        code: 'crontab -l && cat /etc/crontab',
        description: '查看计划任务',
        tags: ['Linux', 'Cron']
      }
    ]
  },
  '横向移动': {
    '网络扫描': [
      {
        title: 'Ping扫描',
        code: 'for /L %i in (1,1,254) do @ping -n 1 -w 200 192.168.1.%i > nul && echo 192.168.1.%i is alive',
        description: 'Windows下的ping扫描',
        tags: ['Windows', '网络扫描']
      },
      {
        title: '端口扫描',
        code: 'nmap -sS -O 192.168.1.0/24',
        description: 'Nmap端口扫描',
        tags: ['Nmap', '端口扫描']
      },
      {
        title: 'SMB扫描',
        code: 'nmap --script smb-enum-shares -p445 192.168.1.0/24',
        description: 'SMB共享扫描',
        tags: ['Nmap', 'SMB']
      },
      {
        title: 'Web服务扫描',
        code: 'nmap -sV -p80,443,8080 192.168.1.0/24',
        description: 'Web服务版本扫描',
        tags: ['Nmap', 'Web']
      }
    ],
    '远程连接': [
      {
        title: 'RDP连接',
        code: 'mstsc /v:192.168.1.100',
        description: '远程桌面连接',
        tags: ['Windows', 'RDP']
      },
      {
        title: 'PsExec',
        code: 'psexec \\\\192.168.1.100 -u administrator -p password cmd',
        description: '使用PsExec远程执行命令',
        tags: ['Windows', 'PsExec']
      },
      {
        title: 'WMI远程执行',
        code: 'wmic /node:192.168.1.100 /user:administrator /password:password process call create "cmd.exe"',
        description: '通过WMI远程执行命令',
        tags: ['Windows', 'WMI']
      },
      {
        title: 'SSH连接',
        code: 'ssh user@192.168.1.100',
        description: 'SSH远程连接',
        tags: ['Linux', 'SSH']
      }
    ]
  },
  '持久化': {
    '注册表': [
      {
        title: '启动项',
        code: 'reg add HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run /v backdoor /t REG_SZ /d "C:\\backdoor.exe"',
        description: '添加启动项',
        tags: ['Windows', '注册表', '持久化']
      },
      {
        title: '用户启动项',
        code: 'reg add HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run /v backdoor /t REG_SZ /d "C:\\backdoor.exe"',
        description: '添加用户启动项',
        tags: ['Windows', '注册表', '持久化']
      }
    ],
    '服务': [
      {
        title: '创建服务',
        code: 'sc create backdoor binpath= "C:\\backdoor.exe" start= auto',
        description: '创建Windows服务',
        tags: ['Windows', '服务', '持久化']
      },
      {
        title: '启动服务',
        code: 'sc start backdoor',
        description: '启动服务',
        tags: ['Windows', '服务']
      }
    ],
    '计划任务': [
      {
        title: '创建计划任务',
        code: 'schtasks /create /sc minute /mo 5 /tn "backdoor" /tr "C:\\backdoor.exe"',
        description: '创建每5分钟执行的计划任务',
        tags: ['Windows', '计划任务', '持久化']
      },
      {
        title: 'Linux Cron',
        code: 'echo "*/5 * * * * /tmp/backdoor" | crontab -',
        description: '添加Cron任务',
        tags: ['Linux', 'Cron', '持久化']
      }
    ]
  },
  '防御绕过': {
    'Windows Defender': [
      {
        title: '检查Defender状态',
        code: 'Get-MpComputerStatus',
        description: '检查Windows Defender状态',
        tags: ['PowerShell', 'Defender']
      },
      {
        title: '添加排除目录',
        code: 'Add-MpPreference -ExclusionPath "C:\\temp"',
        description: '添加Defender排除路径',
        tags: ['PowerShell', 'Defender']
      },
      {
        title: '禁用实时保护',
        code: 'Set-MpPreference -DisableRealtimeMonitoring $true',
        description: '禁用实时保护',
        tags: ['PowerShell', 'Defender']
      }
    ],
    '防火墙': [
      {
        title: '查看防火墙状态',
        code: 'netsh advfirewall show allprofiles',
        description: '显示防火墙配置',
        tags: ['Windows', '防火墙']
      },
      {
        title: '添加防火墙规则',
        code: 'netsh advfirewall firewall add rule name="Allow Port" dir=in action=allow protocol=TCP localport=8080',
        description: '添加入站规则',
        tags: ['Windows', '防火墙']
      },
      {
        title: '关闭防火墙',
        code: 'netsh advfirewall set allprofiles state off',
        description: '关闭所有防火墙配置文件',
        tags: ['Windows', '防火墙']
      }
    ]
  }
})

const categories = computed(() => Object.keys(commandData.value))

const filteredCommands = (commands: Command[]) => {
  if (!searchQuery.value) return commands
  
  return commands.filter(command => 
    command.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    command.code.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    (command.description && command.description.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
    (command.tags && command.tags.some(tag => tag.toLowerCase().includes(searchQuery.value.toLowerCase())))
  )
}

const handleTabClick = (tab: any) => {
  activeTab.value = tab.name
}

const copyCommand = async (command: string) => {
  try {
    await navigator.clipboard.writeText(command)
    ElMessage.success('命令已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

onMounted(() => {
  // Initialize with first category
  if (categories.value.length > 0) {
    activeTab.value = categories.value[0]
  }
})
</script>

<style scoped>
.red-team-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.red-team-header {
  padding: 20px;
  border-bottom: 1px solid #e6e6e6;
  background: #fafafa;
}

.red-team-header h2 {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 24px;
}

.header-actions {
  display: flex;
  gap: 16px;
  align-items: center;
}

.search-input {
  width: 300px;
}

.commands-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.category-tabs {
  height: 100%;
}

.commands-section {
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

.command-group {
  margin-bottom: 32px;
}

.section-title {
  font-size: 18px;
  color: #333;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #3b82f6;
}

.command-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 16px;
}

@media (max-width: 768px) {
  .command-cards {
    grid-template-columns: 1fr;
  }
  
  .header-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-input {
    width: 100%;
  }
}

.command-card {
  border: 1px solid #e6e6e6;
  border-radius: 8px;
  padding: 16px;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
}

.command-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.command-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.command-header h4 {
  margin: 0;
  color: #333;
  font-size: 16px;
}

.command-description {
  color: #666;
  font-size: 14px;
  margin-bottom: 12px;
  line-height: 1.4;
}

.command-code {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 12px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  overflow-x: auto;
}

.command-code pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
}

.command-code code {
  font-size: 13px;
  color: #333;
  background: none;
}

.command-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

:deep(.el-tabs__header) {
  margin-bottom: 20px;
}

:deep(.el-tabs__nav-scroll) {
  overflow-x: auto;
}

:deep(.el-tabs__item) {
  font-weight: 500;
}

:deep(.el-tabs__item.is-active) {
  color: #3b82f6;
}

:deep(.el-tabs__active-bar) {
  background-color: #3b82f6;
}
</style>