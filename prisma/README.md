# vue3-web-prisma

vue3-web后端和控制端共享的的prisma

## prisma 操作

### 生成 prisma 客户端

```bash
npx prisma generate
```
### 生成 prisma 迁移文件

```bash
npx prisma migrate dev --name init
```

### 应用 prisma 迁移文件

```bash
npx prisma migrate deploy
```

### prisma 迁移文件推送至数据库

```bash
npx prisma db push
```

## 子树更新与同步

### 提交prisma的更改

```bash
git add prisma/
git commit -m "Update prisma"
git push origin main
```

### 将更改推送到vue3-web-prisma仓库

```bash
git subtree push --prefix=prisma https://github.com/guangyiliushan/vue3-web-prisma.git main
```

### 拉取最新更改

```bash
git subtree pull --prefix=prisma https://github.com/guangyiliushan/vue3-web-prisma.git main --squash
```
