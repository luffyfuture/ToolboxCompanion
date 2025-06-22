import { drizzle } from 'drizzle-orm/libsql';
import * as schema from "@shared/schema";
import path from 'path';
import { createClient } from '@libsql/client';

// 使用 libsql 连接本地 SQLite 文件
const client = createClient({ url: 'file:database.sqlite' });
export const db = drizzle(client, { schema });

// libsql 不支持直接执行原生 SQL 初始化表结构，建议通过 drizzle-kit migration 管理表结构
// 若需兼容旧逻辑，可通过 drizzle-kit 迁移命令初始化数据库

export { client };
